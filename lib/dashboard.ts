import { db } from "./db";

export async function getDashboardData() {
  const payments = await db.payment.findMany({
    include: {
      customer: true,
      recoveries: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalPayments = payments.length;

  // Payments that represent money currently at risk
  const riskyPayments = payments.filter(
    (payment) =>
      payment.status === "FAILED" ||
      payment.status === "ABANDONED"
  );

  // Successfully recovered payments
  const recoveredPayments = payments.filter(
    (payment) => payment.recoveryStatus === "RECOVERED"
  );

  // Total money currently at risk
  const revenueAtRisk = riskyPayments.reduce(
    (total, payment) => total + Number(payment.amount),
    0
  );

  // Total money recovered
  const recoveredRevenue = recoveredPayments.reduce(
    (total, payment) => total + Number(payment.amount),
    0
  );

  // Estimated recovery potential
  const recoveryPotential = riskyPayments
    .filter((payment) => payment.recoveryStatus !== "STOPPED")
    .reduce(
      (total, payment) => total + Number(payment.amount) * 0.8,
      0
    );

  // Recovery percentage
  const recoveryRate =
    revenueAtRisk > 0
      ? (recoveredRevenue / revenueAtRisk) * 100
      : 0;

  // High and critical risk payments
  const highRiskPayments = payments.filter(
    (payment) =>
      payment.riskLevel === "HIGH" ||
      payment.riskLevel === "CRITICAL"
  );

  // Number of recovery actions
  const aiActions = payments.reduce(
    (total, payment) => total + payment.recoveries.length,
    0
  );

  return {
    totalPayments,
    failedPayments: riskyPayments.length,
    revenueAtRisk,
    recoveryPotential,
    recoveredRevenue,
    recoveryRate,
    highRiskPayments: highRiskPayments.length,
    aiActions,
  };
}
