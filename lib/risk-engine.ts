export type RiskAnalysis = {
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  diagnosis: string;
  recoveryProbability: number;
  recommendedAction:
    | "RETRY_PAYMENT"
    | "SEND_MESSAGE"
    | "SEND_REMINDER"
    | "ESCALATE"
    | "STOP";
  actionReason: string;
  aiConfidence: number;
};

type RiskInput = {
  amount: number;
  status: string;
  failureReason?: string | null;
  retryCount: number;
  customerRiskScore?: number;
};

export function analyzePaymentRisk(
  input: RiskInput
): RiskAnalysis {
  let score = 0;

  // -----------------------------
  // Payment status
  // -----------------------------

  if (input.status === "FAILED") {
    score += 45;
  }

  if (input.status === "ABANDONED") {
    score += 35;
  }

  if (input.status === "PENDING") {
    score += 15;
  }

  // -----------------------------
  // Failure reason
  // -----------------------------

  switch (input.failureReason) {
    case "Insufficient funds":
      score += 25;
      break;

    case "Card declined":
      score += 25;
      break;

    case "Bank timeout":
      score += 15;
      break;

    case "Authentication failed":
      score += 20;
      break;

    case "Payment abandoned":
      score += 20;
      break;

    default:
      score += 10;
      break;
  }

  // -----------------------------
  // Retry history
  // -----------------------------

  if (input.retryCount >= 3) {
    score += 15;
  } else if (input.retryCount === 2) {
    score += 10;
  } else if (input.retryCount === 1) {
    score += 5;
  }

  // -----------------------------
  // Customer risk
  // -----------------------------

  if ((input.customerRiskScore || 0) >= 80) {
    score += 10;
  } else if ((input.customerRiskScore || 0) >= 60) {
    score += 5;
  }

  score = Math.min(score, 100);

  // -----------------------------
  // Risk level
  // -----------------------------

  let riskLevel: RiskAnalysis["riskLevel"];

  if (score >= 80) {
    riskLevel = "CRITICAL";
  } else if (score >= 60) {
    riskLevel = "HIGH";
  } else if (score >= 30) {
    riskLevel = "MEDIUM";
  } else {
    riskLevel = "LOW";
  }

  // -----------------------------
  // Diagnosis
  // -----------------------------

  let diagnosis: string;

  switch (input.failureReason) {
    case "Insufficient funds":
      diagnosis =
        "Customer payment failed because sufficient funds were unavailable.";
      break;

    case "Card declined":
      diagnosis =
        "The issuing bank declined the card transaction.";
      break;

    case "Bank timeout":
      diagnosis =
        "The payment attempt timed out while communicating with the bank.";
      break;

    case "Authentication failed":
      diagnosis =
        "The payment could not complete because authentication failed.";
      break;

    case "Payment abandoned":
      diagnosis =
        "The customer started the payment process but did not complete it.";
      break;

    default:
      diagnosis =
        "The payment failed for an uncertain reason and needs further investigation.";
      break;
  }

  // -----------------------------
  // Recovery strategy
  // -----------------------------

  let recommendedAction: RiskAnalysis["recommendedAction"];
  let actionReason: string;

  if (input.retryCount >= 3) {
    recommendedAction = "SEND_MESSAGE";

    actionReason =
      "Maximum retry threshold reached. Contact the customer instead of repeatedly retrying.";
  } else if (input.failureReason === "Insufficient funds") {
    recommendedAction = "RETRY_PAYMENT";

    actionReason =
      "Retry after a delay to allow the customer to replenish available funds.";
  } else if (input.failureReason === "Bank timeout") {
    recommendedAction = "RETRY_PAYMENT";

    actionReason =
      "A temporary banking failure may succeed on a controlled retry.";
  } else if (input.failureReason === "Payment abandoned") {
    recommendedAction = "SEND_REMINDER";

    actionReason =
      "The customer showed payment intent but did not complete checkout.";
  } else if (input.failureReason === "Authentication failed") {
    recommendedAction = "SEND_MESSAGE";

    actionReason =
      "Ask the customer to retry with the required authentication step.";
  } else if (input.failureReason === "Card declined") {
    recommendedAction = "SEND_MESSAGE";

    actionReason =
      "Avoid repeated card retries and ask the customer to use another payment method.";
  } else {
    recommendedAction = "SEND_MESSAGE";

    actionReason =
      "The failure cause is uncertain, so contact the customer before attempting another payment.";
  }

  // -----------------------------
  // Recovery probability
  // -----------------------------

  let recoveryProbability = 50;

  if (input.failureReason === "Insufficient funds") {
    recoveryProbability = 80;
  } else if (input.failureReason === "Bank timeout") {
    recoveryProbability = 75;
  } else if (input.failureReason === "Payment abandoned") {
    recoveryProbability = 65;
  } else if (input.failureReason === "Authentication failed") {
    recoveryProbability = 60;
  } else if (input.failureReason === "Card declined") {
    recoveryProbability = 45;
  }

  // Repeated attempts reduce probability
  recoveryProbability -= input.retryCount * 8;

  recoveryProbability = Math.max(
    5,
    Math.min(recoveryProbability, 95)
  );

  // -----------------------------
  // AI confidence
  // -----------------------------

  let aiConfidence = 85;

  if (input.failureReason) {
    aiConfidence += 5;
  }

  if (input.retryCount >= 3) {
    aiConfidence -= 5;
  }

  aiConfidence = Math.max(
    50,
    Math.min(aiConfidence, 98)
  );

  // -----------------------------
  // Final result
  // -----------------------------

  return {
    riskScore: score,
    riskLevel,
    diagnosis,
    recoveryProbability,
    recommendedAction,
    actionReason,
    aiConfidence,
  };
}