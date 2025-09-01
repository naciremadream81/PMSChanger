#!/usr/bin/env node
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { execSync } = require('child_process');
const prisma = new PrismaClient();

const [,, command, ...args] = process.argv;

async function seed() {
  // Check if customer already exists
  const existingCustomer = await prisma.customer.findFirst({
    where: { email: 'customer@example.com' }
  });
  
  let customer;
  if (existingCustomer) {
    customer = existingCustomer;
    console.log('Customer already exists:', customer);
  } else {
    customer = await prisma.customer.create({
      data: {
        name: 'Test Customer',
        email: 'customer@example.com',
        phone: '555-1234',
        address: '123 Main St'
      }
    });
    console.log('Seeded customer:', customer);
  }

  // Check if contractor already exists
  const existingContractor = await prisma.contractor.findFirst({
    where: { email: 'contractor@example.com' }
  });
  
  let contractor;
  if (existingContractor) {
    contractor = existingContractor;
    console.log('Contractor already exists:', contractor);
  } else {
    contractor = await prisma.contractor.create({
      data: {
        name: 'Test Contractor',
        email: 'contractor@example.com',
        phone: '555-5678',
        license: 'LIC-001'
      }
    });
    console.log('Seeded contractor:', contractor);
  }
}

async function listCustomers() {
  const customers = await prisma.customer.findMany();
  console.log('Customers:', customers);
}

async function listContractors() {
  const contractors = await prisma.contractor.findMany();
  console.log('Contractors:', contractors);
}

async function seedUsers() {
  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: { email: 'admin@example.com' }
  });
  
  if (existingUser) {
    console.log('Admin user already exists:', existingUser);
    return;
  }
  
  // bcrypt hash for 'password'
  const passwordHash = await bcrypt.hash('password', 12);
  const user = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash,
      role: 'ADMIN'
    }
  });
  console.log('Seeded user:', user);
}

async function seedPackages() {
  const customer = await prisma.customer.findFirst();
  const contractor = await prisma.contractor.findFirst();
  const user = await prisma.user.findFirst();
  if (!customer || !contractor || !user) {
    console.log('You must seed at least one customer, contractor, and user first.');
    return;
  }
  const pkg = await prisma.permitPackage.create({
    data: {
      title: 'Sample Package',
      status: 'DRAFT',
      customerId: customer.id,
      contractorId: contractor.id,
      createdById: user.id
    }
  });
  console.log('Seeded permit package:', pkg);
}

async function diagnose() {
  const userCount = await prisma.user.count();
  const customerCount = await prisma.customer.count();
  const contractorCount = await prisma.contractor.count();
  const packageCount = await prisma.permitPackage.count();
  console.log(`Users: ${userCount}, Customers: ${customerCount}, Contractors: ${contractorCount}, Packages: ${packageCount}`);
}

async function dbSetup() {
  try {
    execSync('npx prisma migrate dev --name init', { stdio: 'inherit' });
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('Database setup complete!');
  } catch (e) {
    console.error('Database setup failed:', e.message);
  }
}

async function main() {
  switch (command) {
    case 'seed':
      await seed();
      break;
    case 'list-customers':
      await listCustomers();
      break;
    case 'list-contractors':
      await listContractors();
      break;
    case 'seed-users':
      await seedUsers();
      break;
    case 'seed-packages':
      await seedPackages();
      break;
    case 'diagnose':
      await diagnose();
      break;
    case 'db-setup':
      await dbSetup();
      break;
    default:
      console.log('Usage: node cli.js [seed|list-customers|list-contractors|seed-users|seed-packages|diagnose|db-setup]');
  }
  await prisma.$disconnect();
}

main(); 