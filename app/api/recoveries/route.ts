import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  PaymentStatus,
  RecoveryActionType,
  RecoveryStatus,
  AuditActor,
} from "@/src/generated/prisma/client";

export async function GET() {
  try {
    const recoveries = await db.recoveryAction.findMany({
      include: {
        payment: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const auditLogs = await db.auditLog.findMany({
      include: {
        payment: {
          include: {
            customer: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      recoveries,
      auditLogs,
    });
  } catch (error) {
    console.error("GET /api/recoveries error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to load recovery data",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const recoveryId = String(body.recoveryId || "");
    const action = String(body.action || "").toUpperCase();

    if (!recoveryId) {
      return NextResponse.json(
        {
          success: false,
          error: "recoveryId is required",
        },
        { status: 400 }
      );
    }

    if (!action) {
      return NextResponse.json(
        {
          success: false,
          error: "action is required",
        },
        { status: 400 }
      );
    }

    const recovery = await db.recoveryAction.findUnique({
      where: {
        id: recoveryId,
      },
      include: {
        payment: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!recovery) {
      return NextResponse.json(
        {
          success: false,
          error: "Recovery action not found",
        },
        { status: 404 }
      );
    }

    /*
     * ==========================================
     * STOP RECOVERY
     * ==========================================
     */

    if (action === "STOP") {
      const updatedRecovery = await db.recoveryAction.update({
        where: {
          id: recoveryId,
        },
        data: {
          status: RecoveryStatus.STOPPED,
        },
      });

      await db.payment.update({
        where: {
          id: recovery.paymentId,
        },
        data: {
          recoveryStatus: RecoveryStatus.STOPPED,
        },
      });

      await db.auditLog.create({
        data: {
          paymentId: recovery.paymentId,
          actor: AuditActor.MERCHANT,
          event: "RECOVERY_STOPPED",
          action: "STOP",
          reason: "Recovery stopped by merchant",
          metadata: JSON.stringify({
            recoveryId,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        recovered: false,
        amountRecovered: 0,
        recovery: updatedRecovery,
        message: "Recovery stopped",
      });
    }

    /*
     * ==========================================
     * APPROVE RECOVERY
     * ==========================================
     */

    if (action === "APPROVE") {
      const recoveryType = recovery.actionType;

      /*
       * Mark the recovery as executing.
       */

      let executingStatus: RecoveryStatus;

      if (recoveryType === RecoveryActionType.RETRY_PAYMENT) {
        executingStatus = RecoveryStatus.RETRYING;
      } else if (
        recoveryType === RecoveryActionType.SEND_MESSAGE ||
        recoveryType === RecoveryActionType.SEND_REMINDER
      ) {
        executingStatus = RecoveryStatus.MESSAGE_SENT;
      } else {
        executingStatus = RecoveryStatus.PENDING;
      }

      const approvedRecovery = await db.recoveryAction.update({
        where: {
          id: recoveryId,
        },
        data: {
          status: executingStatus,
          executedAt: new Date(),
        },
      });

      await db.payment.update({
        where: {
          id: recovery.paymentId,
        },
        data: {
          recoveryStatus: executingStatus,
        },
      });

      /*
       * Record merchant approval.
       */

      await db.auditLog.create({
        data: {
          paymentId: recovery.paymentId,
          actor: AuditActor.MERCHANT,
          event: "RECOVERY_APPROVED",
          action: recoveryType,
          reason: "Recovery approved by merchant",
          metadata: JSON.stringify({
            recoveryId,
            attemptNumber: recovery.attemptNumber,
          }),
        },
      });

      /*
       * ==========================================
       * SIMULATED RECOVERY ENGINE
       * ==========================================
       *
       * For the hackathon demo:
       *
       * RETRY_PAYMENT
       * + AI confidence >= 80
       * + retry count < 3
       *
       * = successful recovery.
       */

      const aiConfidence = recovery.aiConfidence ?? 0;

      const canRecover =
        recoveryType === RecoveryActionType.RETRY_PAYMENT &&
        aiConfidence >= 80 &&
        recovery.payment.retryCount < 3;

      if (canRecover) {
        const recoveredAmount = recovery.payment.amount;

        /*
         * Mark recovery as successful.
         */

        const finalRecovery = await db.recoveryAction.update({
          where: {
            id: recoveryId,
          },
          data: {
            status: RecoveryStatus.RECOVERED,
            amountRecovered: recoveredAmount,
            executedAt: new Date(),
          },
        });

        /*
         * Mark payment as successful.
         */

        await db.payment.update({
          where: {
            id: recovery.paymentId,
          },
          data: {
            status: PaymentStatus.SUCCESS,
            recoveryStatus: RecoveryStatus.RECOVERED,
            retryCount: {
              increment: 1,
            },
          },
        });

        /*
         * Record successful recovery.
         */

        await db.auditLog.create({
          data: {
            paymentId: recovery.paymentId,
            actor: AuditActor.AI_AGENT,
            event: "PAYMENT_RECOVERED",
            action: recoveryType,
            reason: "Recovery retry succeeded",
            metadata: JSON.stringify({
              recoveryId,
              amountRecovered: recoveredAmount,
              aiConfidence,
            }),
          },
        });

        return NextResponse.json({
          success: true,
          recovered: true,
          amountRecovered: recoveredAmount,
          recovery: finalRecovery,
          message: `₹${Number(recoveredAmount).toLocaleString(
            "en-IN"
          )} recovered successfully`,
        });
      }

      /*
       * ==========================================
       * RECOVERY DID NOT COMPLETE
       * ==========================================
       */

      let finalStatus: RecoveryStatus;

      if (
        recoveryType === RecoveryActionType.SEND_MESSAGE ||
        recoveryType === RecoveryActionType.SEND_REMINDER
      ) {
        finalStatus = RecoveryStatus.MESSAGE_SENT;
      } else {
        finalStatus = RecoveryStatus.FAILED;
      }

      const finalRecovery = await db.recoveryAction.update({
        where: {
          id: recoveryId,
        },
        data: {
          status: finalStatus,
        },
      });

      const paymentUpdate: {
        recoveryStatus: RecoveryStatus;
        retryCount?: {
          increment: number;
        };
      } = {
        recoveryStatus: finalStatus,
      };

      if (recoveryType === RecoveryActionType.RETRY_PAYMENT) {
        paymentUpdate.retryCount = {
          increment: 1,
        };
      }

      await db.payment.update({
        where: {
          id: recovery.paymentId,
        },
        data: paymentUpdate,
      });

      await db.auditLog.create({
        data: {
          paymentId: recovery.paymentId,
          actor: AuditActor.AI_AGENT,
          event:
            finalStatus === RecoveryStatus.MESSAGE_SENT
              ? "RECOVERY_MESSAGE_SENT"
              : "RECOVERY_ATTEMPT_FAILED",
          action: recoveryType,
          reason:
            finalStatus === RecoveryStatus.MESSAGE_SENT
              ? "Recovery message sent to customer"
              : "Recovery attempt did not succeed",
          metadata: JSON.stringify({
            recoveryId,
            aiConfidence,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        recovered: false,
        amountRecovered: 0,
        recovery: finalRecovery,
        message:
          finalStatus === RecoveryStatus.MESSAGE_SENT
            ? "Recovery message sent"
            : "Recovery attempt failed",
      });
    }

    /*
     * ==========================================
     * INVALID ACTION
     * ==========================================
     */

    return NextResponse.json(
      {
        success: false,
        error: "Invalid action. Use APPROVE or STOP.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("POST /api/recoveries error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to execute recovery action",
      },
      { status: 500 }
    );
  }
}