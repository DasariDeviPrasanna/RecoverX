import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PaymentStatus } from "@/src/generated/prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const customerName = String(body.customerName || "").trim();
    const email = String(body.email || "").trim();
    const phone = body.phone ? String(body.phone).trim() : null;

    const amount = Number(body.amount);

    const status = String(body.status || "FAILED") as PaymentStatus;

    const failureReason = body.failureReason
      ? String(body.failureReason).trim()
      : null;

    const dueDate = body.dueDate
      ? String(body.dueDate)
      : null;

    const retryCount = Number(body.retryCount || 0);

    const language = String(body.language || "English");

    // ---------------------------------------------------------
    // VALIDATION
    // ---------------------------------------------------------

    if (!customerName) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer name is required",
        },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer email is required",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Payment amount must be greater than 0",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(retryCount) || retryCount < 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Retry count must be 0 or greater",
        },
        { status: 400 }
      );
    }

    // ---------------------------------------------------------
    // FIND OR CREATE CUSTOMER
    // ---------------------------------------------------------

    let customer = await db.customer.findUnique({
      where: {
        email,
      },
    });

    if (!customer) {
      customer = await db.customer.create({
        data: {
          name: customerName,
          email,
          phone,
          language,
          lifetimeValue: amount,
          riskScore: 0,
        },
      });
    } else {
      customer = await db.customer.update({
        where: {
          id: customer.id,
        },
        data: {
          name: customerName,
          phone,
          language,
          lifetimeValue: {
            increment: amount,
          },
        },
      });
    }

    // ---------------------------------------------------------
    // RISK ENGINE
    // ---------------------------------------------------------

    const { analyzePaymentRisk } = await import("@/lib/risk-engine");

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

    // ---------------------------------------------------------
    // UPDATE CUSTOMER RISK
    // ---------------------------------------------------------

    await db.customer.update({
      where: {
        id: customer.id,
      },
      data: {
        riskScore,
      },
    });

    // ---------------------------------------------------------
    // CREATE PAYMENT
    // ---------------------------------------------------------

   const payment = await db.payment.create({
  data: {
    customerId: customer.id,
    amount,
    status: status as PaymentStatus,
    failureReason,
    riskScore,
    riskLevel,
    recoveryStatus: "PENDING",
    retryCount,
  },
});

    // ---------------------------------------------------------
    // CREATE RECOVERY ACTION
    // ---------------------------------------------------------

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

    // ---------------------------------------------------------
    // CREATE AUDIT LOG
    // ---------------------------------------------------------

    await db.auditLog.create({
      data: {
        paymentId: payment.id,
        actor: "AI_AGENT",
        event: "PAYMENT_ANALYZED",
        action: recommendedAction,
        reason: diagnosis,
        metadata: JSON.stringify({
          riskScore,
          riskLevel,
          recoveryProbability,
          aiConfidence,
          failureReason,
          retryCount,
          dueDate,
          language,
        }),
      },
    });

    // ---------------------------------------------------------
    // RESPONSE
    // ---------------------------------------------------------

    return NextResponse.json(
      {
        success: true,

        payment: {
          id: payment.id,
          customerId: payment.customerId,
          amount: Number(payment.amount),
          status: payment.status,
          failureReason: payment.failureReason,
          riskScore: payment.riskScore,
          riskLevel: payment.riskLevel,
          recoveryStatus: payment.recoveryStatus,
          retryCount: payment.retryCount,
          createdAt: payment.createdAt,
        },

        customer: {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          language: customer.language,
          lifetimeValue: Number(customer.lifetimeValue),
          riskScore: customer.riskScore,
        },

        analysis: {
          diagnosis,
          riskScore,
          riskLevel,
          recoveryProbability,
          recommendedAction,
          actionReason,
          aiConfidence,
        },

        recoveryAction: {
          id: recoveryAction.id,
          actionType: recoveryAction.actionType,
          status: recoveryAction.status,
          reason: recoveryAction.reason,
          aiConfidence: recoveryAction.aiConfidence,
          amountRecovered: Number(recoveryAction.amountRecovered),
          attemptNumber: recoveryAction.attemptNumber,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Payment API error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to process payment data",
      },
      { status: 500 }
    );
  }
}