const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Florida counties data
const FLORIDA_COUNTIES = [
  'Alachua', 'Baker', 'Bay', 'Bradford', 'Brevard', 'Broward', 'Calhoun', 'Charlotte', 'Citrus', 'Clay',
  'Collier', 'Columbia', 'DeSoto', 'Dixie', 'Duval', 'Escambia', 'Flagler', 'Franklin', 'Gadsden', 'Gilchrist',
  'Glades', 'Gulf', 'Hamilton', 'Hardee', 'Hendry', 'Hernando', 'Highlands', 'Hillsborough', 'Holmes', 'Indian River',
  'Jackson', 'Jefferson', 'Lafayette', 'Lake', 'Lee', 'Leon', 'Levy', 'Liberty', 'Madison', 'Manatee',
  'Marion', 'Martin', 'Miami-Dade', 'Monroe', 'Nassau', 'Okaloosa', 'Okeechobee', 'Orange', 'Osceola', 'Palm Beach',
  'Pasco', 'Pinellas', 'Polk', 'Putnam', 'Santa Rosa', 'Sarasota', 'Seminole', 'St. Johns', 'St. Lucie', 'Sumter',
  'Suwannee', 'Taylor', 'Union', 'Volusia', 'Wakulla', 'Walton', 'Washington'
];

// Default checklist template items
const DEFAULT_TEMPLATE_ITEMS = [
  { category: 'Application', label: 'Completed permit application form', required: true, sort: 1 },
  { category: 'Application', label: 'Owner/Authorized Agent signature', required: true, sort: 2 },
  { category: 'Site', label: 'Site plan with unit footprint and setbacks', required: true, sort: 3 },
  { category: 'Site', label: 'Address verification / parcel number', required: true, sort: 4 },
  { category: 'Zoning', label: 'Zoning/land use approval or reference', required: true, sort: 5 },
  { category: 'Flood', label: 'Flood zone noted; elevation certificate if required', required: false, sort: 6 },
  { category: 'Wind', label: 'Design wind zone/exposure documented', required: true, sort: 7 },
  { category: 'Fees', label: 'Impact fees paid or deferred documentation', required: false, sort: 8 },
  { category: 'Addressing', label: 'Addressing/911 approval if required', required: false, sort: 9 },
  { category: 'Foundation', label: 'Foundation plan (piers/slab/stem wall)', required: true, permitType: 'MOBILE_HOME', sort: 10 },
  { category: 'Anchorage', label: 'Tie-down/anchoring system details', required: true, permitType: 'MOBILE_HOME', sort: 11 },
  { category: 'Unit', label: 'Make/Model/Year', required: true, permitType: 'MOBILE_HOME', sort: 12 },
  { category: 'Unit', label: 'HUD label and serial/VIN', required: true, permitType: 'MOBILE_HOME', sort: 13 },
  { category: 'Installer', label: 'Licensed installer info', required: true, permitType: 'MOBILE_HOME', sort: 14 },
  { category: 'Utilities', label: 'Power/water/sewer letters as applicable', required: false, sort: 15 },
  { category: 'Photos', label: 'Site photos / HUD plate photo', required: false, permitType: 'MOBILE_HOME', sort: 16 },
  { category: 'Affidavits', label: 'Installation affidavit / setup certification', required: true, permitType: 'MOBILE_HOME', sort: 17 },
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Created admin user:', adminUser.email);

  // Create Florida counties
  console.log('🏛️ Creating Florida counties...');
  for (const countyName of FLORIDA_COUNTIES) {
    const county = await prisma.county.upsert({
      where: { name: countyName },
      update: {},
      create: { name: countyName },
    });
    console.log(`  ✅ ${county.name} County (ID: ${county.id})`);

    // Create default template items for each county
    for (const item of DEFAULT_TEMPLATE_ITEMS) {
      await prisma.countyChecklistTemplateItem.upsert({
        where: {
          countyId_label: {
            countyId: county.id,
            label: item.label,
          },
        },
        update: {},
        create: {
          countyId: county.id,
          label: item.label,
          category: item.category,
          permitType: item.permitType,
          required: item.required,
          sort: item.sort,
        },
      });
    }
    console.log(`  📋 Added ${DEFAULT_TEMPLATE_ITEMS.length} template items`);
  }

  // Create sample customer
  const sampleCustomer = await prisma.customer.upsert({
    where: { email: 'john.doe@example.com' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '(555) 123-4567',
      address: {
        create: {
          line1: '123 Main St',
          city: 'Orlando',
          state: 'FL',
          zip: '32801',
        },
      },
    },
  });
  console.log('✅ Created sample customer:', sampleCustomer.name);

  // Create sample contractor
  const sampleContractor = await prisma.contractor.upsert({
    where: { companyName: 'ABC Construction Co.' },
    update: {},
    create: {
      companyName: 'ABC Construction Co.',
      contactName: 'Jane Smith',
      email: 'jane@abcconstruction.com',
      phone: '(555) 987-6543',
      licenseNumber: 'FL123456',
      address: {
        create: {
          line1: '456 Business Ave',
          city: 'Tampa',
          state: 'FL',
          zip: '33602',
        },
      },
    },
  });
  console.log('✅ Created sample contractor:', sampleContractor.companyName);

  // Create sample permit package
  const samplePackage = await prisma.permitPackage.upsert({
    where: { title: 'Sample Mobile Home Installation' },
    update: {},
    create: {
      title: 'Sample Mobile Home Installation',
      permitType: 'MOBILE_HOME',
      status: 'DRAFT',
      parcelNumber: '123-456-789',
      floodZone: 'X',
      windExposure: 'B',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      customerId: sampleCustomer.id,
      contractorId: sampleContractor.id,
      countyId: 1, // Alachua County
      createdById: adminUser.id,
      siteAddress: {
        create: {
          line1: '789 Oak Drive',
          city: 'Gainesville',
          state: 'FL',
          zip: '32601',
        },
      },
      mobileHome: {
        create: {
          makeModel: 'Clayton Homes - Oakwood',
          year: 2023,
          widthFt: 16,
          lengthFt: 80,
          serialVIN: 'CLAYTON2023001',
          hudLabel: 'HUD-123456',
          installerLicense: 'FL-INST-001',
          foundationType: 'Piers',
          tieDownSystem: 'Engineered System A',
          windZone: 'Zone 2',
        },
      },
    },
  });
  console.log('✅ Created sample permit package:', samplePackage.title);

  // Create sample subcontractor
  const sampleSubcontractor = await prisma.subcontractor.create({
    data: {
      packageId: samplePackage.id,
      companyName: 'Electrical Solutions Inc.',
      contactName: 'Mike Johnson',
      phone: '(555) 555-1234',
      email: 'mike@electricalsolutions.com',
      licenseNumber: 'FL-ELEC-001',
      tradeType: 'Electrical',
      scopeOfWork: 'Complete electrical installation and hookup',
      contractAmount: 8500.00,
      startDate: new Date(),
      status: 'PENDING',
    },
  });
  console.log('✅ Created sample subcontractor:', sampleSubcontractor.companyName);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Sample Data Created:');
  console.log(`  👤 Admin User: admin@example.com (password: admin123)`);
  console.log(`  🏛️ Counties: ${FLORIDA_COUNTIES.length} Florida counties`);
  console.log(`  👥 Customer: ${sampleCustomer.name}`);
  console.log(`  🏗️ Contractor: ${sampleContractor.companyName}`);
  console.log(`  📦 Package: ${samplePackage.title}`);
  console.log(`  🔧 Subcontractor: ${sampleSubcontractor.companyName}`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
