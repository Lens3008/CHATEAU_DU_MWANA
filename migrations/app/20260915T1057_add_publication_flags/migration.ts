#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/398bb216f168020024286ff3677f99ad43968bd6e77a48f5171b7b7a46ff4e60/contract';
import endContract from '../../snapshots/398bb216f168020024286ff3677f99ad43968bd6e77a48f5171b7b7a46ff4e60/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/3da8eac623684af82c16039df326d8ff7b2ad0cb5eaa780663d86f6c75de77f0/contract';
import startContract from '../../snapshots/3da8eac623684af82c16039df326d8ff7b2ad0cb5eaa780663d86f6c75de77f0/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, lit, rawSql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'formula',
        column: col('isPublished', 'bool', {
          notNull: true,
          default: lit(false),
          codecRef: { codecId: 'pg/bool@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'service',
        column: col('isPublished', 'bool', {
          notNull: true,
          default: lit(false),
          codecRef: { codecId: 'pg/bool@1' },
        }),
      }),
      rawSql({
        id: 'data_migration.backfill_catalogue_publication_flags',
        label: 'Backfill catalogue publication flags',
        operationClass: 'data',
        target: { id: 'postgres' },
        precheck: [],
        execute: [
          {
            description: 'Publish existing formulas by default',
            sql: 'UPDATE "public"."formula" SET "isPublished" = true WHERE "isPublished" = false',
            params: [],
          },
          {
            description: 'Publish existing services by default',
            sql: 'UPDATE "public"."service" SET "isPublished" = true WHERE "isPublished" = false',
            params: [],
          },
          {
            description: 'Keep validation formulas private',
            sql: 'UPDATE "public"."formula" SET "isPublished" = false WHERE "name" IN (\'TEST_FORMULA\', \'TEST_B3_FORMULA\')',
            params: [],
          },
          {
            description: 'Keep validation services private',
            sql: 'UPDATE "public"."service" SET "isPublished" = false WHERE "name" IN (\'TEST_SERVICE\', \'TEST_B3_SERVICE\')',
            params: [],
          },
        ],
        postcheck: [],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
