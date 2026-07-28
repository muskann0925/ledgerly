import { PrismaClient, ExpenseStatus, ExpensePaymentMethod } from "@prisma/client";

const prisma = new PrismaClient();

const defaultCategories = [
  { name: "Office Supplies", description: "Stationery, office equipment, paper, ink", color: "#3B82F6" },
  { name: "Utilities", description: "Electricity, water, internet, phone bills", color: "#EF4444" },
  { name: "Software & Subscriptions", description: "SaaS subscriptions, hosting, domain names", color: "#8B5CF6" },
  { name: "Travel & Transport", description: "Flight tickets, cab fare, fuel, lodging", color: "#F59E0B" },
  { name: "Marketing & Advertising", description: "Ads, promotions, sponsorships, print media", color: "#EC4899" },
  { name: "Rent & Infrastructure", description: "Office rent, maintenance charges", color: "#10B981" },
  { name: "Salaries & Payroll", description: "Employee salaries, bonuses, contractor payments", color: "#6366F1" },
  { name: "Maintenance & Repairs", description: "IT repairs, office renovation, hardware fixing", color: "#14B8A6" },
  { name: "Legal & Professional Services", description: "Auditing, legal fees, consultancy", color: "#64748B" },
  { name: "Miscellaneous", description: "General unclassified expenses", color: "#94A3B8" },
];

const defaultVendors = [
  { name: "AWS Cloud Services", email: "billing@aws.amazon.com", phone: "+1800-123-456", gstNumber: "27AAACA0000A1Z5" },
  { name: "Airtel Business", email: "support@airtel.in", phone: "+91-9876543210", gstNumber: "07AAACA1234F1Z1" },
  { name: "Staples Supplies", email: "sales@staples.com", phone: "+91-8800112233", gstNumber: "29BBBBB5678K1Z2" },
];

export async function seedExpenses() {
  console.log("🌱 Seeding default expense categories...");

  for (const cat of defaultCategories) {
    await prisma.expenseCategory.upsert({
      where: { name: cat.name },
      update: { description: cat.description, color: cat.color },
      create: cat,
    });
  }

  console.log("🌱 Seeding default vendors...");
  for (const ven of defaultVendors) {
    const existing = await prisma.vendor.findFirst({ where: { name: ven.name } });
    if (!existing) {
      await prisma.vendor.create({ data: ven });
    }
  }

  console.log("✅ Expense seed completed!");
}

if (require.main === module) {
  seedExpenses()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
