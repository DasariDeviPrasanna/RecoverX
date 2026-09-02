import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET — fetch all recovery opportunities
export async function GET() {
  try {
    const recoveries = await db.recoveryAction.findMany({
      include: {
        payment: {
          include: {
            customer: true,
          },
        },
        customer: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      recoveries,
    });
  } catch (error) {
    console.error("RECOVERIES GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch recovery opportunities.",
      },
      { status: 500 }
    );
  }
}

// POST — approve or stop a recovery action
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const actionId = String(body.actionId || "");
    const action = String(body.action || "");

    if (!actionId) {
      return NextResponse.json(
        {
          success: false,
          error: "Recovery action ID is required.",
        },
        { status: 400 }
      );
    }

    if (action !== "APPROVE" && action !== "STOP") {
      return NextResponse.json(
        {
          success: false,
          error: "Action must be APPROVE or STOP.",
        },
        { status: 400 }
      );
    }

    const recovery = await db.recoveryAction.findUnique({
      where: {
        id: actionId,
      },
      include: {
        payment: true,
        customer: true,
      },
    });

    if (!recovery) {
      return NextResponse.json(
        {
          success: false,
          error: "Recovery action not found.",
        },
        { status: 404 }
      );
    }

    // STOP recovery
    if (action === "STOP") {
      const updatedRecovery = await db.recoveryAction.update({
        where: {
          id: actionId,
        },
        data: {
          status: "STOPPED",
        },
      });

      await db.payment.update({
        where: {
          id: recovery.paymentId,
        },
        data: {
          recoveryStatus: "STOPPED",
        },
      });

      await db.auditLog.create({
        data: {
          paymentId: recovery.paymentId,
          actor: "MERCHANT",
          event: "RECOVERY_STOPPED",
          action: "STOP",
          reason: "Merchant stopped the recovery action.",
          metadata: JSON.stringify({
            recoveryActionId: actionId,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Recovery action stopped.",
        recovery: updatedRecovery,
      });
    }

    // APPROVE recovery
    let newPaymentStatus:
      | "RETRYING"
      | "MESSAGE_SENT"
      | "PENDING";

    if (recovery.actionType === "RETRY_PAYMENT") {
      newPaymentStatus = "RETRYING";
    } else if (
      recovery.actionType === "SEND_MESSAGE" ||
      recovery.actionType === "SEND_REMINDER"
    ) {
      newPaymentStatus = "MESSAGE_SENT";
    } else {
      newPaymentStatus = "PENDING";
    }

    const updatedRecovery = await db.recoveryAction.update({
      where: {
        id: actionId,
      },
      data: {
        status: newPaymentStatus,
        executedAt: new Date(),
      },
    });

    await db.payment.update({
      where: {
        id: recovery.paymentId,
      },
      data: {
        recoveryStatus: newPaymentStatus,
      },
    });

    await db.auditLog.create({
      data: {
        paymentId: recovery.paymentId,
        actor: "MERCHANT",
        event: "RECOVERY_APPROVED",
        action: recovery.actionType,
        reason: "Merchant approved the AI recovery recommendation.",
        metadata: JSON.stringify({
          recoveryActionId: actionId,
          actionType: recovery.actionType,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Recovery action approved.",
      recovery: updatedRecovery,
    });
  } catch (error) {
    console.error("RECOVERIES POST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process recovery action.",
      },
      { status: 500 }
    );
  }
}