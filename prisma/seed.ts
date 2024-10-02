// prisma/seed.ts

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "dev.hassan33@gmail.com"; // Replace with desired admin email
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("Admin user already exists.");
    return;
  }

  const hashedPassword = await bcrypt.hash("12345678", 10); // Replace with secure password

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      // @ts-ignore
      emailVerified: new Date(),
    },
  });

  console.log("Admin user created:", admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
