/**
 * Create Admin User Script
 * Usage: node scripts/create-admin.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function createAdmin() {
  try {
    console.log('\n🔐 Create Admin User\n');

    const username = await question('Username: ');
    const email = await question('Email (optional): ');
    const password = await question('Password: ');

    if (!username || !password) {
      console.error('❌ Username and password are required!');
      process.exit(1);
    }

    // Check if admin already exists
    const existing = await prisma.admin.findUnique({
      where: { username },
    });

    if (existing) {
      console.error(`❌ Admin user "${username}" already exists!`);
      process.exit(1);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        username,
        email: email || null,
        passwordHash,
      },
    });

    console.log('\n✅ Admin user created successfully!');
    console.log(`Username: ${admin.username}`);
    if (admin.email) console.log(`Email: ${admin.email}`);
    console.log('\nYou can now login at /admin/login\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

createAdmin();
