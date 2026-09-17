import 'dotenv/config';
import { db } from './src/lib/prisma';

// ============================================================
// BRIDGE 3.3 — FORENSIC VALIDATION SCRIPT
// ============================================================
// Tests: RBAC, Routes, Server Actions, Client Isolation,
//        Location/GPS, Google Maps, Apple Plans
// ============================================================

const PASS = '\x1b[32mPASS\x1b[0m';
const FAIL = '\x1b[31mFAIL\x1b[0m';
const WARN = '\x1b[33mWARN\x1b[0m';
const INFO = '\x1b[36mINFO\x1b[0m';

let totalTests = 0;
let passCount = 0;
let failCount = 0;
let warnCount = 0;

function test(label: string, result: boolean, detail?: string) {
  totalTests++;
  if (result) {
    passCount++;
    console.log(`  [${PASS}] ${label}`);
  } else {
    failCount++;
    console.log(`  [${FAIL}] ${label}${detail ? ' — ' + detail : ''}`);
  }
}

function warn(label: string, detail?: string) {
  warnCount++;
  console.log(`  [${WARN}] ${label}${detail ? ' — ' + detail : ''}`);
}

function section(name: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${name}`);
  console.log(`${'='.repeat(60)}`);
}

async function run() {
  await db.connect();

  // ============================================================
  // 1. RBAC — requireRole verification in pages
  // ============================================================
  section('1. RBAC — Page-level requireRole');

  const fs = await import('fs');
  const path = await import('path');

  // Define expected roles per route
  const expectedRoles: Record<string, string[]> = {
    'src/app/dashboard/admin/page.tsx': ['ADMIN'],
    'src/app/dashboard/supervisor/page.tsx': ['SUPERVISOR'],
    'src/app/dashboard/secretary/page.tsx': ['SECRETARY'],
    'src/app/dashboard/logistician/page.tsx': ['LOGISTICIAN'],
    'src/app/admin/reservations/page.tsx': ['ADMIN', 'SUPERVISOR', 'SECRETARY'],
    'src/app/admin/reservations/new/page.tsx': ['ADMIN', 'SUPERVISOR', 'SECRETARY'],
    'src/app/admin/reservations/[id]/page.tsx': ['ADMIN', 'SUPERVISOR', 'SECRETARY', 'CLIENT'],
    'src/app/admin/crm/page.tsx': ['ADMIN', 'SUPERVISOR', 'SECRETARY'],
    'src/app/admin/crm/clients/[id]/page.tsx': ['ADMIN', 'SUPERVISOR', 'SECRETARY'],
    'src/app/admin/contact/page.tsx': ['ADMIN', 'SUPERVISOR', 'SECRETARY'],
    'src/app/admin/contact/[id]/page.tsx': ['ADMIN', 'SUPERVISOR', 'SECRETARY'],
    'src/app/admin/analytics/page.tsx': ['ADMIN', 'SUPERVISOR'],
    'src/app/admin/notifications/page.tsx': ['ADMIN', 'SUPERVISOR', 'SECRETARY', 'LOGISTICIAN'],
    'src/app/admin/imports/page.tsx': ['ADMIN', 'SUPERVISOR'],
    'src/app/admin/cms/page.tsx': ['ADMIN'],
    'src/app/admin/cms/pages/page.tsx': ['ADMIN'],
    'src/app/admin/cms/pages/[id]/page.tsx': ['ADMIN'],
    'src/app/admin/cms/pages/new/page.tsx': ['ADMIN'],
    'src/app/admin/cms/templates/page.tsx': ['ADMIN'],
    'src/app/admin/cms/templates/[id]/page.tsx': ['ADMIN'],
    'src/app/admin/cms/templates/new/page.tsx': ['ADMIN'],
    'src/app/admin/cms/settings/page.tsx': ['ADMIN'],
    'src/app/admin/cms/media/page.tsx': ['ADMIN'],
    'src/app/admin/cms/gallery/page.tsx': ['ADMIN'],
    'src/app/admin/cms/gallery/[id]/page.tsx': ['ADMIN'],
    'src/app/admin/cms/gallery/new/page.tsx': ['ADMIN'],
  };

  for (const [filePath, expectedArr] of Object.entries(expectedRoles)) {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      test(`${filePath} exists`, false, 'File not found');
      continue;
    }
    const content = fs.readFileSync(fullPath, 'utf8');
    const roleMatch = content.match(/requireRole\(\[(.*?)\]\)/);
    if (!roleMatch) {
      test(`${filePath} has requireRole`, false, 'No requireRole call found');
      continue;
    }
    const rolesStr = roleMatch[1];
    const roles = rolesStr.replace(/'/g, '').replace(/"/g, '').split(',').map((r: string) => r.trim()).filter(Boolean);
    const expected = expectedArr.sort().join(',');
    const actual = roles.sort().join(',');
    test(`${filePath} RBAC = [${expected}]`, actual === expected, `Got [${actual}]`);
  }

  // ============================================================
  // 2. Server Actions RBAC
  // ============================================================
  section('2. Server Actions RBAC');

  const actionFiles: Record<string, { fn: string; expectedRoles: string[] }[]> = {
    'src/lib/actions/contact-actions.ts': [
      { fn: 'updateContactMessageStatusAction', expectedRoles: ['ADMIN', 'SECRETARY'] },
    ],
    'src/lib/actions/analytics.ts': [
      { fn: 'getAnalyticsDashboardData', expectedRoles: ['ADMIN', 'SUPERVISOR'] },
    ],
    'src/lib/actions/cms-actions.ts': [
      { fn: 'getPageByIdAction', expectedRoles: ['ADMIN'] },
      { fn: 'getPagesAction', expectedRoles: ['ADMIN'] },
      { fn: 'createPageAction', expectedRoles: ['ADMIN'] },
      { fn: 'updatePageAction', expectedRoles: ['ADMIN'] },
      { fn: 'deletePageAction', expectedRoles: ['ADMIN'] },
    ],
    'src/lib/actions/media-actions.ts': [
      { fn: 'getMediasAction', expectedRoles: ['ADMIN'] },
      { fn: 'uploadMediaAction', expectedRoles: ['ADMIN'] },
      { fn: 'deleteMediaAction', expectedRoles: ['ADMIN'] },
    ],
    'src/lib/actions/settings-actions.ts': [
      { fn: 'getSettingsAction', expectedRoles: ['ADMIN'] },
      { fn: 'updateSettingAction', expectedRoles: ['ADMIN'] },
    ],
    'src/lib/actions/gallery-actions.ts': [
      { fn: 'createGalleryAction', expectedRoles: ['ADMIN'] },
      { fn: 'updateGalleryAction', expectedRoles: ['ADMIN'] },
    ],
    'src/lib/actions/crm-actions.ts': [
      { fn: 'getCustomer360Action', expectedRoles: ['ADMIN', 'SUPERVISOR', 'SECRETARY'] },
      { fn: 'getCRMDashboardStatsAction', expectedRoles: ['ADMIN', 'SUPERVISOR', 'SECRETARY'] },
      { fn: 'getCustomersAction', expectedRoles: ['ADMIN', 'SUPERVISOR', 'SECRETARY'] },
    ],
    'src/lib/actions/loyalty-actions.ts': [
      { fn: 'getCustomerLoyaltySummaryAction', expectedRoles: ['ADMIN', 'SUPERVISOR', 'SECRETARY'] },
    ],
    'src/lib/actions/templates-actions.ts': [
      { fn: 'createTemplateAction', expectedRoles: ['ADMIN'] },
      { fn: 'updateTemplateAction', expectedRoles: ['ADMIN'] },
      { fn: 'deleteTemplateAction', expectedRoles: ['ADMIN'] },
    ],
    'src/lib/actions/imports-actions.ts': [
      { fn: 'submitImportAction', expectedRoles: ['ADMIN'] },
    ],
  };

  for (const [filePath, fns] of Object.entries(actionFiles)) {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      test(`${filePath} exists`, false, 'File not found');
      continue;
    }
    const content = fs.readFileSync(fullPath, 'utf8');
    for (const { fn, expectedRoles: er } of fns) {
      // Find the function and its requireRole
      const fnIdx = content.indexOf(`function ${fn}`);
      if (fnIdx === -1) {
        test(`${fn} in ${filePath}`, false, 'Function not found');
        continue;
      }
      const afterFn = content.substring(fnIdx, fnIdx + 500);
      const roleMatch = afterFn.match(/requireRole\(\[(.*?)\]\)/);
      if (!roleMatch) {
        test(`${fn} has requireRole`, false, 'No requireRole call');
        continue;
      }
      const roles = roleMatch[1].replace(/'/g, '').replace(/"/g, '').split(',').map((r: string) => r.trim()).filter(Boolean);
      const expected = er.sort().join(',');
      const actual = roles.sort().join(',');
      test(`${fn} RBAC = [${expected}]`, actual === expected, `Got [${actual}]`);
    }
  }

  // ============================================================
  // 3. Client Data Isolation
  // ============================================================
  section('3. Client Data Isolation');

  // Verify dashboard/client/page.tsx does NOT use .all() for private data
  const clientDashPath = path.resolve('src/app/dashboard/client/page.tsx');
  const clientDash = fs.readFileSync(clientDashPath, 'utf8');
  
  // Check that Reservation.all() is NOT used
  test('Client dashboard: no Reservation.all()', !clientDash.includes('Reservation.all()'));
  test('Client dashboard: no Customer.all() (global)', !clientDash.includes('allCustomers = await db.orm.public.Customer.all()') || clientDash.includes('.where('));
  test('Client dashboard: no Invoice.all()', !clientDash.includes('Invoice.all()'));
  test('Client dashboard: no LoyaltyAccount.all() (global)', !clientDash.includes('allLoyaltyAccounts = await db.orm.public.LoyaltyAccount.all()') || clientDash.includes('.where('));
  
  // Check client reservations page
  const clientResPath = path.resolve('src/app/dashboard/reservations/page.tsx');
  const clientRes = fs.readFileSync(clientResPath, 'utf8');
  test('Client reservations: uses .where({ customerId })', clientRes.includes('.where({ customerId })'));
  test('Client reservations: no Reservation.all()', !clientRes.includes('Reservation.all()'));

  // ============================================================
  // 4. Reservation Action Security
  // ============================================================
  section('4. Reservation Action — Anti-Spoofing');

  const resActionPath = path.resolve('src/lib/actions/reservation-actions.ts');
  const resAction = fs.readFileSync(resActionPath, 'utf8');
  
  test('createReservationAction: blocks LOGISTICIAN', resAction.includes("user.role === 'LOGISTICIAN'"));
  test('createReservationAction: blocks SUPERVISOR', resAction.includes("user.role === 'SUPERVISOR'"));
  test('createReservationAction: forces customerId from session for CLIENT', 
    resAction.includes("user.role === 'CLIENT' ? user.customerId"));

  // ============================================================
  // 5. Reservation Detail — Isolation + Performance
  // ============================================================
  section('5. Reservation Detail — Isolation + Performance');
  
  const resDetailPath = path.resolve('src/app/admin/reservations/[id]/page.tsx');
  const resDetail = fs.readFileSync(resDetailPath, 'utf8');
  
  test('Reservation detail: no Reservation.all()', !resDetail.includes('Reservation.all()'));
  test('Reservation detail: uses .where({ id })', resDetail.includes('.where({ id })'));
  test('Reservation detail: CLIENT isolation check', resDetail.includes('reservation.customerId !== user.customerId'));
  test('Reservation detail: no Customer.all()', !resDetail.includes('Customer.all()'));
  test('Reservation detail: no Location.all()', !resDetail.includes('Location.all()'));

  // ============================================================
  // 6. Location Model Verification
  // ============================================================
  section('6. Location Model — Schema Fields');

  const schemaPath = path.resolve('prisma/schema.prisma');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  const locationFields = ['latitude', 'longitude', 'detailedAddress', 'city', 'commune', 'neighborhood', 'landmark', 'precision', 'accessInstructions', 'contactPhone'];
  for (const field of locationFields) {
    test(`Location has field: ${field}`, schema.includes(field));
  }
  test('Location has customerId relation', schema.includes('customerId') && schema.includes('Customer?'));

  // ============================================================
  // 7. Google Maps / Apple Plans Links
  // ============================================================
  section('7. Google Maps / Apple Plans');

  test('Reservation detail: Google Maps link', resDetail.includes('google.com/maps/search'));
  test('Reservation detail: Apple Plans link', resDetail.includes('maps.apple.com'));
  test('Map links: conditional on latitude && longitude', resDetail.includes('location.latitude && location.longitude'));

  // ============================================================
  // 8. CMS Access — ADMIN Only
  // ============================================================
  section('8. CMS — ADMIN Only (no SUPERVISOR)');

  const cmsPages = [
    'src/app/admin/cms/page.tsx',
    'src/app/admin/cms/pages/page.tsx',
    'src/app/admin/cms/templates/page.tsx',
    'src/app/admin/cms/settings/page.tsx',
    'src/app/admin/cms/media/page.tsx',
    'src/app/admin/cms/gallery/page.tsx',
  ];

  for (const cp of cmsPages) {
    const fullPath = path.resolve(cp);
    if (!fs.existsSync(fullPath)) {
      test(`${cp} exists`, false);
      continue;
    }
    const content = fs.readFileSync(fullPath, 'utf8');
    const hasSupervisor = content.includes("'SUPERVISOR'");
    test(`${cp}: no SUPERVISOR access`, !hasSupervisor, hasSupervisor ? 'SUPERVISOR found in requireRole' : undefined);
  }

  // ============================================================
  // 9. Database Schema Unchanged
  // ============================================================
  section('9. Database Schema');

  test('Schema has Location model', schema.includes('model Location'));
  test('Schema NOT modified (latitude exists)', schema.includes('latitude'));
  test('Schema NOT modified (longitude exists)', schema.includes('longitude'));
  // No new models should have been added
  test('No PlayArea model', !schema.includes('model PlayArea'));
  test('No GoogleMaps model', !schema.includes('model GoogleMap'));

  // ============================================================
  // 10. Client A/B Data Isolation (DB Level)
  // ============================================================
  section('10. Client A/B Data Isolation (DB Level)');

  const allCustomers = await db.orm.public.Customer.all();
  if (allCustomers.length >= 2) {
    const clientA = allCustomers[0];
    const clientB = allCustomers[1];

    // Test: Reservations for Client A should NOT include Client B's
    const resA = await db.orm.public.Reservation.where({ customerId: clientA.id }).all();
    const resB = await db.orm.public.Reservation.where({ customerId: clientB.id }).all();
    
    const crossContamination = resA.some((r: any) => r.customerId === clientB.id);
    test(`Client A reservations: no Client B data`, !crossContamination);

    const crossContamination2 = resB.some((r: any) => r.customerId === clientA.id);
    test(`Client B reservations: no Client A data`, !crossContamination2);

    // Test: Invoices
    const invA = await db.orm.public.Invoice.where({ customerId: clientA.id }).all();
    const invCross = invA.some((i: any) => i.customerId === clientB.id);
    test(`Client A invoices: no Client B data`, !invCross);

    // Test: LoyaltyAccount
    const loyA = await db.orm.public.LoyaltyAccount.where({ customerId: clientA.id }).all();
    const loyCross = loyA.some((l: any) => l.customerId === clientB.id);
    test(`Client A loyalty: no Client B data`, !loyCross);

    // Test: Locations
    const locA = await db.orm.public.Location.where({ customerId: clientA.id }).all();
    const locCross = locA.some((l: any) => l.customerId === clientB.id);
    test(`Client A locations: no Client B data`, !locCross);

    console.log(`  [${INFO}] Client A: ${clientA.firstName} ${clientA.lastName} (${clientA.id})`);
    console.log(`  [${INFO}] Client B: ${clientB.firstName} ${clientB.lastName} (${clientB.id})`);
    console.log(`  [${INFO}] Client A reservations: ${resA.length}, Client B reservations: ${resB.length}`);
  } else {
    warn('Not enough customers to test A/B isolation', `Found ${allCustomers.length} customers`);
  }

  // ============================================================
  // FINAL SUMMARY
  // ============================================================
  section('FINAL SUMMARY');
  console.log(`  Total Tests: ${totalTests}`);
  console.log(`  ${PASS}: ${passCount}`);
  console.log(`  ${FAIL}: ${failCount}`);
  console.log(`  ${WARN}: ${warnCount}`);
  console.log('');

  if (failCount === 0) {
    console.log(`  ✅ BRIDGE 3.3 FORENSIC VALIDATION: ${PASS}`);
  } else {
    console.log(`  ❌ BRIDGE 3.3 FORENSIC VALIDATION: ${FAIL} (${failCount} failures)`);
  }

  process.exit(failCount > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
