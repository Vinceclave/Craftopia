// apps/backend/src/scripts/seedAdmin.ts
import prisma from "../config/prisma";
import bcrypt from "bcrypt";

async function seedAdmin() {
  const hashedPassword = await bcrypt.hash("Admin@123456", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@craftopia.com" },
    update: {},
    create: {
      email: "admin@craftopia.com",
      password_hash: hashedPassword,
      username: "Admin",
      role: "admin",
      is_email_verified: true,
      is_active: true
    }
  });

  console.log("✅ Admin created:", {
    email: admin.email,
    username: admin.username,
    role: admin.role
  });

  await prisma.$disconnect();
}

seedAdmin()
  .catch((e) => {
    console.error("❌ Error seeding admin:", e);
    process.exit(1);
  });