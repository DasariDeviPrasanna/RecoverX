import { db } from "./db";
import { getCurrentUser } from "./current-user";

export async function getDashboardData() {
  const user = await getCurrentUser();

  // No authenticated merchant = empty dashboard.
  // Never fall back to global database data.
  if (!user) {
    return {
      totalPayments: 0,
      failedPayments: 0,
      revenueAtRisk: 0,
      recoveryPotential: 0,
      recoveredRevenue: 0,
      recoveryRate: 0,
      highRiskPayments: 0,
      aiActions: 0,
    };
  }

  const payments = await db.payment.findMany({
    where: {
      userId: user.id,
    },
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

  /*
   * Recovery rate should use the total recovery opportunity,
   * including money that has already been recovered.
   *
   * Example:
   * ₹10,000 recovered + ₹5,000 still at risk
   * = ₹15,000 total opportunity
   * = 66.7% recovery rate
   */
  const recoveryBase = recoveredRevenue + revenueAtRisk;

  const recoveryRate =
    recoveryBase > 0
      ? (recoveredRevenue / recoveryBase) * 100
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