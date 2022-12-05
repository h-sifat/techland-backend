import {
  isNever,
  MissingOrUnknownPropertiesInSchema,
} from "../common/util/zod";
import { z } from "zod";

import type {
  WithTransaction,
  MakeDatabaseType,
  CustomTransaction,
  MakeWithTransaction_Argument,
} from "./interface";
import type { ClientSession } from "mongodb";

import { MongoClient } from "mongodb";
import { makeUrl, MakeUrl_Argument } from "../common/util";
import { deepFreeze } from "../common/util/deep-freeze";

export interface PaginationObject {
  pageNumber: number;
  itemsPerPage: number;
}

export function makeWithTransaction(
  factoryArg: MakeWithTransaction_Argument
): WithTransaction {
  const { client, transactionOptions } = factoryArg;

  return async function withTransaction(callback) {
    const session = client.startSession();

    try {
      await session.withTransaction(async () => {
        const callbackArg = Object.freeze({
          transaction: Object.freeze({ session }),
        });

        await callback(callbackArg);
      }, transactionOptions);
    } finally {
      await session.endSession();
    }
  };
}

export interface MakeTransactionalDatabaseProxy_Argument<Database> {
  database: Database;
  transaction: CustomTransaction;
}

export function makeTransactionalDatabaseProxy<DB extends object>(
  factoryArg: MakeTransactionalDatabaseProxy_Argument<DB>
): DB {
  const { database, transaction } = factoryArg;

  return new Proxy(database, {
    get(target, property, receiver) {
      if (typeof (<any>target)[property] === "function") {
        return (arg: any) =>
          // Here we're are injecting the transaction session
          (<any>target)[property](arg, { session: transaction.session });
      }
      return Reflect.get(target, property, receiver);
    },
  });
}

export function addUseTransactionAndArgsFilter<DB extends object>(
  db: DB
): MakeDatabaseType<DB> {
  const database: any = {
    useTransaction(transaction: any) {
      return makeTransactionalDatabaseProxy({
        transaction,
        database: db,
      });
    },
  };

  Object.entries(db).forEach(([name, func]) => {
    (<any>database)[name] = (arg: any) => (<Function>func)(arg);
  });

  return Object.freeze(database) as any;
}

export const PaginationSchema = z
  .object({
    pageNumber: z.number().nonnegative().int(),
    itemsPerPage: z.number().nonnegative().int(),
  })
  .strict();

{
  type shouldBeNever = MissingOrUnknownPropertiesInSchema<
    z.infer<typeof PaginationSchema>,
    PaginationObject
  >;
  isNever<shouldBeNever>();
}

export type MakeAggregationStagesForPagination = (
  arg: PaginationObject
) => [{ $skip: number }, { $limit: number }];

export function makePaginationStagesArray(
  arg: PaginationObject
): [{ $skip: number }, { $limit: number }] {
  const { pageNumber, itemsPerPage } = arg;

  return deepFreeze([
    { $skip: (pageNumber - 1) * itemsPerPage },
    { $limit: itemsPerPage },
  ]);
}

export const DocumentFormatSchema = z
  .string()
  .trim()
  .refine(
    (format) => format === "private" || format === "public",
    (format) => ({ message: `Invalid format: "${format}"` })
  );

export interface QueryMethodOptions {
  session?: ClientSession;
}

const DEFAULT_DB_OPTIONS = Object.freeze({
  w: "majority",
  readConcernLevel: "majority",
});

export type MakeDatabase_Argument = {
  protocol?: string;
  options?: { w: string; readConcernLevel: string };
} & Pick<MakeUrl_Argument, "host" | "auth">;

export async function makeDatabaseClient(
  factoryArg: MakeDatabase_Argument
): Promise<MongoClient> {
  const {
    auth,
    host,
    protocol = "mongodb+srv",
    options = DEFAULT_DB_OPTIONS,
  } = factoryArg;

  const dbUrl = makeUrl({ host, protocol, auth, searchParams: options });
  const client = new MongoClient(dbUrl);

  await client.connect();
  // making sure that client is connected to db
  await client.db("admin").command({ ping: 1 });

  return client;
}
