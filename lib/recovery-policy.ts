export const RECOVERY_POLICY = {
  MAX_RETRIES: 3,

  // Payments above this amount should have merchant approval.
  HIGH_VALUE_THRESHOLD: 50000,

  // Low-confidence AI recommendations should not execute automatically.
  MIN_AI_CONFIDENCE: 80,
};

export type RecoveryPolicyInput = {
  paymentStatus: string;
  recoveryStatus: string;
  retryCount: number;
  amount: number;
  aiConfidence: number | null;
  failureReason: string | null;
};

export type RecoveryPolicyResult = {
  allowed: boolean;
  requiresApproval: boolean;
  reason: string;
  rule: string;
};

export function validateRecoveryPolicy(
  input: RecoveryPolicyInput
): RecoveryPolicyResult {
  const failureReason = (input.failureReason || "").toLowerCase();

  // ==========================================
  // RULE 1 — PAYMENT ALREADY RECOVERED
  // ==========================================

  if (
    input.paymentStatus === "SUCCESS" ||
    input.recoveryStatus === "RECOVERED"
  ) {
    return {
      allowed: false,
      requiresApproval: false,
      reason: "Payment has already been recovered.",
      rule: "ALREADY_RECOVERED",
    };
  }

  // ==========================================
  // RULE 2 — MERCHANT STOPPED RECOVERY
  // ==========================================

  if (input.recoveryStatus === "STOPPED") {
    return {
      allowed: false,
      requiresApproval: false,
      reason: "Merchant has stopped this recovery.",
      rule: "MERCHANT_STOPPED",
    };
  }

  // ==========================================
  // RULE 3 — REFUNDED PAYMENT
  // ==========================================

  if (input.paymentStatus === "REFUNDED") {
    return {
      allowed: false,
      requiresApproval: false,
      reason: "Refunded payments must not be recovered.",
      rule: "REFUNDED_PAYMENT",
    };
  }

  // ==========================================
  // RULE 4 — DISPUTE / CHARGEBACK
  // ==========================================

  if (
    failureReason.includes("dispute") ||
    failureReason.includes("chargeback")
  ) {
    return {
      allowed: false,
      requiresApproval: false,
      reason: "Disputed or chargeback payments must not be retried.",
      rule: "DISPUTED_PAYMENT",
    };
  }

  // ==========================================
  // RULE 5 — MAXIMUM RETRIES
  // ==========================================

  if (input.retryCount >= RECOVERY_POLICY.MAX_RETRIES) {
    return {
      allowed: false,
      requiresApproval: false,
      reason: `Maximum retry limit of ${RECOVERY_POLICY.MAX_RETRIES} has been reached.`,
      rule: "MAX_RETRIES_REACHED",
    };
  }

  // ==========================================
  // RULE 6 — PAYMENT MUST NEED RECOVERY
  // ==========================================

  if (
    input.paymentStatus !== "FAILED" &&
    input.paymentStatus !== "ABANDONED" &&
    input.paymentStatus !== "PENDING"
  ) {
    return {
      allowed: false,
      requiresApproval: false,
      reason: "Payment status is not eligible for recovery.",
      rule: "PAYMENT_NOT_ELIGIBLE",
    };
  }

  // ==========================================
  // RULE 7 — LOW AI CONFIDENCE
  // ==========================================

  if (
    input.aiConfidence !== null &&
    input.aiConfidence < RECOVERY_POLICY.MIN_AI_CONFIDENCE
  ) {
    return {
      allowed: true,
      requiresApproval: true,
      reason:
        "AI confidence is below the automatic execution threshold. Merchant approval is required.",
      rule: "LOW_AI_CONFIDENCE",
    };
  }

  // ==========================================
  // RULE 8 — HIGH VALUE PAYMENT
  // ==========================================

  if (input.amount >= RECOVERY_POLICY.HIGH_VALUE_THRESHOLD) {
    return {
      allowed: true,
      requiresApproval: true,
      reason:
        "High-value recovery requires explicit merchant approval before execution.",
      rule: "HIGH_VALUE_APPROVAL",
    };
  }

  // ==========================================
  // DEFAULT — ALLOWED
  // ==========================================

  return {
    allowed: true,
    requiresApproval: false,
    reason: "Recovery action passed all policy checks.",
    rule: "POLICY_APPROVED",
  };
}