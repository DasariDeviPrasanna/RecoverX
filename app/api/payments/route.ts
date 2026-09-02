import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { analyzePaymentRisk } from "@/lib/risk-engine";

export async function POST(request: Request) {
  try {
    // -----------------------------------------
    // 1. Read request body
    // -----------------------------------------

    const body = await request.json();

    const customerName = String(body.customerName || "").trim();
    const email = String(body.email || "").trim();
    const phone = String(body.phone || "").trim();

    const amount = Number(body.amount);

    const status = String(body.status || "FAILED");

    const failureReason =
      body.failureReason
        ? String(body.failureReason)
        : null;

    const retryCount = Number(body.retryCount || 0);

    const language = String(
      body.language || "English"
    );

    // -----------------------------------------
    // 2. Validate input
    // -----------------------------------------

    if (!customerName) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer name is required.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment amount must be greater than zero.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(retryCount) || retryCount < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Retry count must be a valid non-negative number.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // 3. Create a unique email if merchant
    //    doesn't provide one
    // -----------------------------------------

    const customerEmail =
      email ||
      `customer-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}@recoverx.local`;

    // -----------------------------------------
    // 4. Find existing customer or create one
    // -----------------------------------------

    const existingCustomer = await db.customer.findUnique({
      where: {
        email: customerEmail,
      },
    });

    let customer;

    if (existingCustomer) {
      customer = await db.customer.update({
        where: {
          id: existingCustomer.id,
        },
        data: {
          name: customerName,
          phone: phone || null,
          language,
        },
      });
    } else {
      customer = await db.customer.create({
        data: {
          name: customerName,
          email: customerEmail,
          phone: phone || null,
          language,
          lifetimeValue: 0,
          riskScore: 0,
        },
      });
    }

    // -----------------------------------------
    // 5. Run RecoverX Risk Engine
    // -----------------------------------------

    const analysis = analyzePaymentRisk({
      amount,
      status,
      failureReason,
      retryCount,
      customerRiskScore: customer.riskScore,
    });

    const {
      riskScore,
      riskLevel,
      diagnosis,
      recoveryProbability,
      recommendedAction,
      actionReason,
      aiConfidence,
    } = analysis;

    // -----------------------------------------
    // 6. Create payment
    // -----------------------------------------

    const payment = await db.payment.create({
      data: {
        customerId: customer.id,
        amount,
        status,
        failureReason,
        riskScore,
        riskLevel,
        recoveryStatus: "PENDING",
        retryCount,
      },
    });

    // -----------------------------------------
    // 7. Update customer lifetime value
    // -----------------------------------------

    await db.customer.update({
      where: {
        id: customer.id,
      },
      data: {
        lifetimeValue: {
          increment: amount,
        },
        riskScore,
      },
    });

    // -----------------------------------------
    // 8. Create AI recovery action
    // -----------------------------------------

    const recoveryAction = await db.recoveryAction.create({
      data: {
        paymentId: payment.id,
        customerId: customer.id,

        actionType: recommendedAction,

        status: "PENDING",

        reason: actionReason,

        aiConfidence,

        amountRecovered: 0,

        attemptNumber: retryCount + 1,
      },
    });

    // -----------------------------------------
    // 9. Create audit log
    // -----------------------------------------

    await db.auditLog.create({
      data: {
        paymentId: payment.id,

        actor: "AI_AGENT",

        event: "PAYMENT_ANALYZED",

        action: recommendedAction,

        reason: diagnosis,

        metadata: JSON.stringify({
          amount,
          customerName,
          status,
          failureReason,

          riskScore,
          riskLevel,

          recoveryProbability,

          recommendedAction,

          actionReason,

          aiConfidence,

          retryCount,
        }),
      },
    });

    // -----------------------------------------
    // 10. Return complete result
    // -----------------------------------------

    return NextResponse.json(
      {
        success: true,

        message: "Payment added and analyzed successfully.",

        payment: {
          id: payment.id,
          amount: payment.amount,
          status: payment.status,
          failureReason: payment.failureReason,
          riskScore: payment.riskScore,
          riskLevel: payment.riskLevel,
          recoveryStatus: payment.recoveryStatus,
          retryCount: payment.retryCount,
        },

        customer: {
          id: customer.id,
          name: customerName,
          email: customerEmail,
          phone,
          language,
        },

        analysis: {
          riskScore,
          riskLevel,
          diagnosis,
          recoveryProbability,
          recommendedAction,
          actionReason,
          aiConfidence,
        },

        recoveryAction: {
          id: recoveryAction.id,
          actionType: recoveryAction.actionType,
          status: recoveryAction.status,
          attemptNumber: recoveryAction.attemptNumber,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // -----------------------------------------
    // 11. Error handling
    // -----------------------------------------

    console.error("PAYMENT API ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Failed to add payment.",
      },
      { status: 500 }
    );
  }
}