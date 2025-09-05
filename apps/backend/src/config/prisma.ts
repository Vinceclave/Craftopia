import { PrismaClient } from "../generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("AdminPass123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password_hash: hashedPassword,
      username: "Super Admin",
      role: "admin"
    }
  });

  console.log("✅ Admin created:", admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export default prisma;