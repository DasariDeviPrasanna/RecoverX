import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/current-user";

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

    const payments = await db.payment.findMany({
      where: {
        userId,
      },
    });

    const totalAtRisk = payments
      .filter(
        (payment) =>
          payment.status !== "SUCCESS" &&
          payment.status !== "REFUNDED"
      )
      .reduce(
        (total, payment) =>
          total + Number(payment.amount),
        0
      );

    const recoveryPotential = payments
      .filter(
        (payment) =>
          payment.status !== "SUCCESS" &&
          payment.status !== "REFUNDED"
      )
      .reduce(
        (total, payment) =>
          total + Number(payment.amount),
        0
      );

    const recoveredRevenue = payments
      .filter(
        (payment) =>
          payment.recoveryStatus === "RECOVERED"
      )
      .reduce(
        (total, payment) =>
          total + Number(payment.amount),
        0
      );

    const riskyPayments = payments.filter(
      (payment) =>
        payment.riskLevel === "HIGH" ||
        payment.riskLevel === "CRITICAL"
    );

    const recoveryActions =
      await db.recoveryAction.count({
        where: {
          userId,
        },
      });

    const recoveryRate =
      totalAtRisk > 0
        ? (recoveredRevenue / totalAtRisk) * 100
        : 0;

    return NextResponse.json({
      success: true,

      totalAtRisk,

      recoveryPotential,

      recoveredRevenue,

      recoveryRate,

      recoveryActions,

      riskyPayments:
        riskyPayments.length,

      totalPayments:
        payments.length,
    });
  } catch (error) {
    console.error(
      "Dashboard API error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to load dashboard data",
      },
      { status: 500 }
    );
  }
}