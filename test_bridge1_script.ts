import { createReservationAction } from './src/lib/actions/reservation-actions';
import { getCustomersAction } from './src/lib/actions/crm-actions';
import * as auth from './src/lib/auth/user';

// --- MOCK SETUP ---
let currentUser: any = null;

const originalRequireAuth = auth.requireAuth;
const originalRequireRole = auth.requireRole;

(auth as any).requireAuth = async () => {
  if (!currentUser) throw new Error('Unauthorized');
  return currentUser;
};

(auth as any).requireRole = async (roles: string[]) => {
  if (!currentUser) throw new Error('Unauthorized');
  if (!roles.includes(currentUser.role)) throw new Error('Forbidden');
  return currentUser;
};

// We mock createReservation dynamically to avoid DB connections
jest = require('jest-mock');
const reservationService = require('./src/lib/services/reservation');
reservationService.createReservation = jest.fn().mockResolvedValue({ id: 'res_123', status: 'DRAFT' });

const dbMod = require('./src/lib/prisma');
dbMod.db.orm.public.Customer.first = jest.fn().mockResolvedValue({ id: 'cust_999' });
dbMod.db.transaction = jest.fn().mockImplementation(async (cb: any) => {
  return await cb({ execute: jest.fn().mockResolvedValue(true) });
});
dbMod.db.raw = { sql: jest.fn().mockReturnValue({ affectedCount: () => ({ build: () => ({}) }) }) };


async function runTests() {
  console.log('--- STARTING BRIDGE 1 TESTS ---');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, msg: string) {
    total++;
    if (condition) {
      console.log(`[PASS] ${msg}`);
      passed++;
    } else {
      console.error(`[FAIL] ${msg}`);
    }
  }

  // 1. Visiteur non connecté
  currentUser = null;
  const res1 = await createReservationAction({ formulaId: 'f1' });
  assert(res1.success === false && res1.error === 'Unauthorized', 'Visiteur non connecté -> REFUSEE');

  // 2. Utilisateur connecté
  currentUser = { id: 'usr_test', email: 'test@example.com', role: 'CLIENT', customerId: 'cust_123' };
  const res2 = await createReservationAction({ formulaId: 'f1', customerId: 'cust_MALICIOUS' });
  assert(res2.success === true, 'Utilisateur connecté -> AUTORISEE');
  assert(
    reservationService.createReservation.mock.calls[0][0].customerId === 'cust_123', 
    'customerId malicieux ignoré, customerId du profil utilisé'
  );

  // 3. LOGISTICIAN sur le CRM
  currentUser = { id: 'usr_log', email: 'log@example.com', role: 'LOGISTICIAN' };
  try {
    await getCustomersAction();
    assert(false, 'LOGISTICIAN devrait être bloqué sur CRM');
  } catch (e: any) {
    assert(e.message === 'Forbidden', 'LOGISTICIAN sur CRM -> BLOQUE (Forbidden)');
  }

  console.log(`\nResults: ${passed}/${total} tests passed.`);
  process.exit(passed === total ? 0 : 1);
}

runTests().catch(console.error);
