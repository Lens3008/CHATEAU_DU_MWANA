/* eslint-disable @typescript-eslint/no-explicit-any */
import 'dotenv/config';
import { Temporal } from '@js-temporal/polyfill';

// Ensure Temporal is globally available for Prisma 8 runtime
if (typeof (globalThis as any).Temporal === 'undefined') {
  (globalThis as any).Temporal = Temporal;
}

import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from '../../prisma/schema.d';
import contractJson from '../../prisma/schema.json' with { type: 'json' };

function getDatabaseUrl(): string | undefined {
  return process.env['DATABASE_URL'] || process.env['POSTGRES_URL'];
}

function createPrismaClient() {
  // Instantiate postgres client with data contract
  // Lazy connection: we do not pass url synchronously at construct time to prevent
  // un-awaited background driver connect race conditions. Connection is resolved and awaited
  // cleanly on first use or explicit db.connect().
  // @ts-expect-error Postgres contract options type narrowing
  const rawClient = postgres<Contract>({
    contractJson,
  });

  const originalConnect = rawClient.connect.bind(rawClient);
  let connectionPromise: Promise<any> | null = null;

  async function ensureConnected(bindingOverride?: any): Promise<any> {
    if (connectionPromise) {
      return connectionPromise;
    }

    const currentUrl = getDatabaseUrl();
    const binding = bindingOverride ?? (currentUrl ? { url: currentUrl } : undefined);

    if (!binding) {
      throw new Error(
        'Postgres binding not configured. Neither DATABASE_URL nor POSTGRES_URL is set in environment variables. Pass url to db.connect({ url }) or set DATABASE_URL.'
      );
    }

    connectionPromise = (async () => {
      try {
        return await originalConnect(binding);
      } catch (err: any) {
        connectionPromise = null;
        throw err;
      }
    })();

    return connectionPromise;
  }

  // Intercept runtime execution so driver is guaranteed connected before any query or marker verification
  const domainNamespaces = (rawClient.contract as any)?.domain?.namespaces || {};
  const firstNs = Object.keys(domainNamespaces)[0];
  const firstModel = firstNs ? Object.keys(domainNamespaces[firstNs]?.models || {})[0] : undefined;
  const ctxRuntime = firstNs && firstModel ? (rawClient.orm as any)[firstNs][firstModel]?.ctx?.runtime : undefined;

  if (ctxRuntime) {
    const originalQuery = ctxRuntime.query;
    ctxRuntime.query = async function* (plan: any) {
      await ensureConnected();
      yield* originalQuery.call(this, plan);
    };

    const originalExecute = ctxRuntime.execute;
    ctxRuntime.execute = async function (plan: any) {
      await ensureConnected();
      return originalExecute.call(this, plan);
    };

    const originalConnection = ctxRuntime.connection;
    ctxRuntime.connection = async function () {
      await ensureConnected();
      return originalConnection.call(this);
    };
  }

  // Also intercept rawClient.runtime() so direct runtime access awaits connection
  const originalRuntime = rawClient.runtime.bind(rawClient);
  let runtimeIntercepted = false;
  rawClient.runtime = function () {
    const rt = originalRuntime();
    if (!runtimeIntercepted) {
      runtimeIntercepted = true;
      const origSetup = (rt as any).setupDriverExecution;
      if (typeof origSetup === 'function') {
        (rt as any).setupDriverExecution = async function (exec: any) {
          await ensureConnected();
          return origSetup.call(this, exec);
        };
      }
      const origConn = rt.connection;
      if (typeof origConn === 'function') {
        rt.connection = async function () {
          await ensureConnected();
          return origConn.call(this);
        };
      }
    }
    return rt;
  };

  const originalTransaction = rawClient.transaction.bind(rawClient);
  rawClient.transaction = async function (fn: any) {
    await ensureConnected();
    return originalTransaction(fn);
  };

  const originalPrepare = rawClient.prepare.bind(rawClient);
  rawClient.prepare = async function (declaration: any, callback: any) {
    await ensureConnected();
    return originalPrepare(declaration, callback);
  };

  rawClient.connect = async function (bindingInput?: any) {
    return ensureConnected(bindingInput);
  };

  const originalClose = rawClient.close.bind(rawClient);
  rawClient.close = async function () {
    connectionPromise = null;
    return originalClose();
  };

  return rawClient;
}

const globalForPrisma = globalThis as unknown as {
  prismaDbInstance: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prismaDbInstance ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaDbInstance = db;
}

export default db;
