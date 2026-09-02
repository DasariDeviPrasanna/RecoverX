import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const payments = await db.payment.findMany();

    const totalAtRisk = payments
      .filter(
        (payment) =>
          payment.status !== "SUCCESS" &&
          payment.status !== "REFUNDED"
      )
      .reduce(
        (total, payment) => total + payment.amount,
        0
      );

    const recoveredRevenue = payments
      .filter(
        (payment) =>
          payment.recoveryStatus === "RECOVERED"
      )
      .reduce(
        (total, payment) => total + payment.amount,
        0
      );

    const riskyPayments = payments.filter(
      (payment) =>
        payment.riskLevel === "HIGH" ||
        payment.riskLevel === "CRITICAL"
    );

    const recoveryRate =
      totalAtRisk > 0
        ? (recoveredRevenue / totalAtRisk) * 100
        : 0;

    const recoveryActions =
      await db.recoveryAction.count();

    return NextResponse.json({
      totalAtRisk,
      recoveredRevenue,
      recoveryRate,
      recoveryActions,
      riskyPayments: riskyPayments.length,
      totalPayments: payments.length,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      {
        error: "Failed to load dashboard data",
      },
      {
        status: 500,
      }
    );
  }
}