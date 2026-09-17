import { createReservationAction } from './src/lib/actions/reservation-actions';
import { getCustomersAction } from './src/lib/actions/crm-actions';
import * as auth from './src/lib/auth/user';
import { db } from './src/lib/prisma';
import { createReservation } from './src/lib/services/reservation';

// We mock requireAuth and requireRole
jest.mock('./src/lib/auth/user', () => {
  let currentUser = null;
  return {
    ...jest.requireActual('./src/lib/auth/user'),
    requireAuth: jest.fn().mockImplementation(async () => {
      if (!currentUser) throw new Error('Unauthorized');
      return currentUser;
    }),
    requireRole: jest.fn().mockImplementation(async (roles: string[]) => {
      if (!currentUser) throw new Error('Unauthorized');
      if (!roles.includes(currentUser.role)) throw new Error('Forbidden');
      return currentUser;
    }),
    setCurrentTestUser: (user: any) => {
      currentUser = user;
    }
  };
});

// We mock the DB and Reservation service for unit testing without blowing up real DB
jest.mock('./src/lib/services/reservation', () => ({
  createReservation: jest.fn().mockResolvedValue({ id: 'res_123', status: 'DRAFT' })
}));

describe('Bridge 1 - Actions Tests', () => {
  beforeEach(() => {
    (auth as any).setCurrentTestUser(null);
    jest.clearAllMocks();
  });

  test('1. Visiteur non connecté → createReservationAction() REFUSÉE.', async () => {
    const res = await createReservationAction({ formulaId: 'f1' });
    expect(res.success).toBe(false);
    expect(res.error).toBe('Unauthorized');
    expect(createReservation).not.toHaveBeenCalled();
  });

  test('2. Utilisateur connecté → createReservationAction() AUTORISÉE, customerId respecté', async () => {
    const testUser = {
      id: 'usr_test',
      email: 'test@example.com',
      role: 'CLIENT',
      customerId: 'cust_123'
    };
    (auth as any).setCurrentTestUser(testUser);
    
    // We try to pass a malicious customerId
    const res = await createReservationAction({ formulaId: 'f1', customerId: 'cust_MALICIOUS' });
    
    expect(res.success).toBe(true);
    expect(createReservation).toHaveBeenCalledWith(expect.objectContaining({
      customerId: 'cust_123', // should override the malicious one
      performedById: 'usr_test',
      formulaId: 'f1'
    }));
  });

  test('3. CRM: LOGISTICIAN est bloqué', async () => {
    const logistician = {
      id: 'usr_log',
      email: 'log@example.com',
      role: 'LOGISTICIAN'
    };
    (auth as any).setCurrentTestUser(logistician);
    
    await expect(getCustomersAction()).rejects.toThrow('Forbidden');
  });
  
  test('4. CRM: ADMIN est autorisé', async () => {
    const admin = {
      id: 'usr_admin',
      email: 'admin@example.com',
      role: 'ADMIN'
    };
    (auth as any).setCurrentTestUser(admin);
    
    // will throw connection error if not mocked, but will pass RBAC check
    try {
      await getCustomersAction();
    } catch (e: any) {
      expect(e.message).not.toBe('Forbidden');
    }
  });
});
