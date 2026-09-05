import { db } from "./db";
import { getCurrentUser } from "./current-user";

export async function getDashboardData() {
  const user = await getCurrentUser();

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

  const userId = user.id;

  const payments = await db.payment.findMany({
    where: {
      userId,
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

  /*
   * Payments currently requiring recovery.
   *
   * SUCCESS / REFUNDED payments are no longer at risk.
   * STOPPED payments have been intentionally closed.
   */
  const riskyPayments = payments.filter(
    (payment) =>
      payment.status !== "SUCCESS" &&
      payment.status !== "REFUNDED" &&
      payment.recoveryStatus !== "STOPPED"
  );

  /*
   * Successfully recovered payments.
   */
  const recoveredPayments = payments.filter(
    (payment) =>
      payment.recoveryStatus === "RECOVERED"
  );

  /*
   * Revenue currently at risk.
   */
  const revenueAtRisk = riskyPayments.reduce(
    (total, payment) =>
      total + Number(payment.amount),
    0
  );

  /*
   * Revenue recovered.
   */
  const recoveredRevenue = recoveredPayments.reduce(
    (total, payment) =>
      total + Number(payment.amount),
    0
  );

  /*
   * Estimated recovery potential.
   *
   * 80% is the current RecoverX simulation assumption.
   */
  const recoveryPotential = riskyPayments.reduce(
    (total, payment) =>
      total + Number(payment.amount) * 0.8,
    0
  );

  /*
   * Recovery rate.
   *
   * Example:
   * ₹80,000 recovered
   * ₹20,000 still at risk
   *
   * Recovery rate = 80%
   */
  const recoveryBase =
    recoveredRevenue + revenueAtRisk;

  const recoveryRate =
    recoveryBase > 0
      ? (recoveredRevenue / recoveryBase) * 100
      : 0;

  /*
   * High and critical risk payments.
   */
  const highRiskPayments = payments.filter(
    (payment) =>
      payment.riskLevel === "HIGH" ||
      payment.riskLevel === "CRITICAL"
  );

  /*
   * Total AI recovery actions for this merchant.
   */
  const aiActions = payments.reduce(
    (total, payment) =>
      total + payment.recoveries.length,
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