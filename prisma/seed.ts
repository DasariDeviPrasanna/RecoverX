import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const customers = [
  {
    name: "Rahul Sharma",
    email: "rahul@recoverx.demo",
    phone: "+919876543210",
    language: "Hinglish",
    lifetimeValue: 82400,
  },
  {
    name: "Priya Reddy",
    email: "priya@recoverx.demo",
    phone: "+919876543211",
    language: "English",
    lifetimeValue: 54200,
  },
  {
    name: "Arjun Kumar",
    email: "arjun@recoverx.demo",
    phone: "+919876543212",
    language: "English",
    lifetimeValue: 38600,
  },
  {
    name: "Sneha Rao",
    email: "sneha@recoverx.demo",
    phone: "+919876543213",
    language: "Hinglish",
    lifetimeValue: 92700,
  },
  {
    name: "Vikram Enterprises",
    email: "vikram@recoverx.demo",
    phone: "+919876543214",
    language: "English",
    lifetimeValue: 185000,
  },
];

const failureReasons = [
  "insufficient_funds",
  "bank_declined",
  "network_error",
  "expired_card",
  "authentication_failed",
];

async function main() {
  console.log("🌱 Starting RecoverX database seed...");

  // Clear old demo data
  await prisma.auditLog.deleteMany();
  await prisma.recoveryAction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.customer.deleteMany();

  console.log("🧹 Old data cleared.");

  let totalPayments = 0;
  let totalCustomers = 0;

  for (const customerData of customers) {
    const customer = await prisma.customer.create({
      data: {
        ...customerData,
        riskScore: Math.floor(Math.random() * 30) + 60,
      },
    });

    totalCustomers++;

    // Create 12 payments for every customer
    for (let i = 0; i < 12; i++) {
      const random = Math.random();

      let status:
        | "SUCCESS"
        | "FAILED"
        | "PENDING"
        | "ABANDONED";

      if (random < 0.50) {
        status = "SUCCESS";
      } else if (random < 0.75) {
        status = "FAILED";
      } else if (random < 0.90) {
        status = "ABANDONED";
      } else {
        status = "PENDING";
      }

      const amount =
        Math.floor(Math.random() * 190) * 100 + 1000;

      const riskScore =
        status === "SUCCESS"
          ? Math.floor(Math.random() * 30) + 10
          : Math.floor(Math.random() * 30) + 70;

      let riskLevel:
        | "LOW"
        | "MEDIUM"
        | "HIGH"
        | "CRITICAL";

      if (riskScore >= 90) {
        riskLevel = "CRITICAL";
      } else if (riskScore >= 75) {
        riskLevel = "HIGH";
      } else if (riskScore >= 40) {
        riskLevel = "MEDIUM";
      } else {
        riskLevel = "LOW";
      }

      const payment = await prisma.payment.create({
        data: {
          customerId: customer.id,
          amount,
          status,
          riskScore,
          riskLevel,

          failureReason:
            status === "FAILED"
              ? failureReasons[
                  Math.floor(
                    Math.random() * failureReasons.length
                  )
                ]
              : null,

          recoveryStatus:
            status === "SUCCESS"
              ? "RECOVERED"
              : "PENDING",

          retryCount:
            status === "SUCCESS"
              ? 0
              : Math.floor(Math.random() * 2),
        },
      });

      totalPayments++;

      // Add audit record for every failed payment
      if (status === "FAILED") {
        await prisma.auditLog.create({
          data: {
            paymentId: payment.id,
            actor: "SYSTEM",
            event: "Payment failure detected",
            action: "DETECT",
            reason: payment.failureReason,
            metadata: {
              amount: payment.amount,
              riskScore: payment.riskScore,
            },
          },
        });
      }

      // Add recovery record for some successful recoveries
      if (
        status === "SUCCESS" &&
        Math.random() < 0.25
      ) {
        await prisma.recoveryAction.create({
          data: {
            paymentId: payment.id,
            customerId: customer.id,
            actionType: "RETRY_PAYMENT",
            status: "RECOVERED",
            reason:
              "Payment successfully recovered through smart retry.",
            aiConfidence: 0.91,
            amountRecovered: payment.amount,
            attemptNumber: 1,
            executedAt: new Date(),
          },
        });

        await prisma.auditLog.create({
          data: {
            paymentId: payment.id,
            actor: "AI_AGENT",
            event: "Revenue recovered",
            action: "RETRY_PAYMENT",
            reason:
              "Smart retry successfully recovered payment.",
            metadata: {
              amountRecovered: payment.amount,
            },
          },
        });
      }
    }
  }

  console.log("");
  console.log("================================");
  console.log("🎉 RecoverX seed completed!");
  console.log("================================");
  console.log(`👥 Customers: ${totalCustomers}`);
  console.log(`💳 Payments: ${totalPayments}`);
  console.log("📊 Demo recovery data created");
  console.log("📝 Audit logs created");
  console.log("================================");
}

main()
  .catch((error) => {
    console.error("❌ SEED FAILED");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });