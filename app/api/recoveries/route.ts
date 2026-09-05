import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  PaymentStatus,
  RecoveryActionType,
  RecoveryStatus,
  AuditActor,
} from "@/src/generated/prisma/client";
import { getCurrentUser } from "@/lib/current-user";

/*
 * =========================================================
 * GET — CURRENT USER'S RECOVERIES + AUDIT LOGS ONLY
 * =========================================================
 */

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const userId = user.id;

    /*
     * Only load recovery actions belonging to
     * the currently logged-in merchant.
     */
    const recoveries = await db.recoveryAction.findMany({
      where: {
        userId,
        payment: {
          userId,
        },
      },
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

    /*
     * Extra protection:
     * payment and customer must also belong
     * to the currently logged-in merchant.
     */
    const userRecoveries = recoveries.filter(
      (recovery) =>
        recovery.payment.userId === userId &&
        recovery.payment.customer.userId === userId
    );

    /*
     * Only load audit logs belonging to
     * the currently logged-in merchant.
     */
    const auditLogs = await db.auditLog.findMany({
      where: {
        userId,
      },
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

    const userAuditLogs = auditLogs.filter(
      (log) =>
        !log.payment ||
        (log.payment.userId === userId &&
          log.payment.customer.userId === userId)
    );

    return NextResponse.json({
      success: true,
      recoveries: userRecoveries,
      auditLogs: userAuditLogs,
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

/*
 * =========================================================
 * POST — EXECUTE CURRENT USER'S RECOVERY ONLY
 * =========================================================
 */

export async function POST(request: Request) {
  try {
    /*
     * Verify logged-in merchant.
     */
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const userId = user.id;

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

    if (action !== "APPROVE" && action !== "STOP") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid action. Use APPROVE or STOP.",
        },
        { status: 400 }
      );
    }

    /*
     * =======================================================
     * SECURITY CHECK
     *
     * Recovery + Payment must belong to this merchant.
     * =======================================================
     */

    const recovery = await db.recoveryAction.findFirst({
      where: {
        id: recoveryId,
        userId,
        payment: {
          userId,
        },
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
     * Extra ownership validation.
     */
    if (recovery.payment.customer.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Recovery ownership validation failed",
        },
        { status: 403 }
      );
    }

    /*
     * Do not execute an already recovered action.
     */
    if (recovery.status === RecoveryStatus.RECOVERED) {
      return NextResponse.json(
        {
          success: false,
          error: "This recovery has already been completed.",
        },
        { status: 409 }
      );
    }

    /*
     * Do not execute a stopped action.
     */
    if (recovery.status === RecoveryStatus.STOPPED) {
      return NextResponse.json(
        {
          success: false,
          error: "This recovery has already been stopped.",
        },
        { status: 409 }
      );
    }

    /*
     * =======================================================
     * STOP RECOVERY
     * =======================================================
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
          userId,
          paymentId: recovery.paymentId,
          actor: AuditActor.MERCHANT,
          event: "RECOVERY_STOPPED",
          action: "STOP",
          reason: "Recovery stopped by merchant",
          metadata: JSON.stringify({
            recoveryId,
            merchantId: userId,
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
     * =======================================================
     * APPROVE RECOVERY
     * =======================================================
     */

    if (action === "APPROVE") {
      const recoveryType = recovery.actionType;

      /*
       * Determine the initial execution status.
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

      /*
       * Mark recovery as executing.
       */
      await db.recoveryAction.update({
        where: {
          id: recoveryId,
        },
        data: {
          status: executingStatus,
          executedAt: new Date(),
        },
      });

      /*
       * Update payment recovery status.
       */
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
          userId,
          paymentId: recovery.paymentId,
          actor: AuditActor.MERCHANT,
          event: "RECOVERY_APPROVED",
          action: recoveryType,
          reason: "Recovery approved by merchant",
          metadata: JSON.stringify({
            recoveryId,
            attemptNumber: recovery.attemptNumber,
            merchantId: userId,
          }),
        },
      });

      /*
       * =======================================================
       * SIMULATED RECOVERY ENGINE
       * =======================================================
       *
       * RecoverX demo rule:
       *
       * AI confidence >= 80%
       * AND
       * previous retries < 3
       *
       * = simulated successful recovery.
       *
       * This applies to:
       *
       * RETRY_PAYMENT
       * SEND_MESSAGE
       * SEND_REMINDER
       *
       * because the merchant has approved the
       * AI-selected recovery strategy.
       */

      const aiConfidence = recovery.aiConfidence ?? 0;

      const canRecover =
        aiConfidence >= 80 &&
        recovery.payment.retryCount < 3 &&
        recoveryType !== RecoveryActionType.STOP;

      /*
       * =======================================================
       * SUCCESSFUL RECOVERY
       * =======================================================
       */

      if (canRecover) {
        const recoveredAmount = recovery.payment.amount;

        /*
         * Mark recovery as recovered.
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
            userId,
            paymentId: recovery.paymentId,
            actor: AuditActor.AI_AGENT,
            event: "PAYMENT_RECOVERED",
            action: recoveryType,
            reason: `Recovery strategy "${recoveryType}" succeeded`,
            metadata: JSON.stringify({
              recoveryId,
              amountRecovered: recoveredAmount,
              aiConfidence,
              merchantId: userId,
            }),
          },
        });

        return NextResponse.json({
          success: true,
          recovered: true,
          amountRecovered: recoveredAmount,
          recovery: finalRecovery,
          message: `₹${Number(
            recoveredAmount
          ).toLocaleString("en-IN")} recovered successfully`,
        });
      }

      /*
       * =======================================================
       * RECOVERY DID NOT COMPLETE
       * =======================================================
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

      /*
       * Count retry attempt only for actual payment retry.
       */
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

      /*
       * Record unsuccessful / pending recovery action.
       */
      await db.auditLog.create({
        data: {
          userId,
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
            merchantId: userId,
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