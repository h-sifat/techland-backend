import type { ClientSession, MongoClient, TransactionOptions } from "mongodb";

export interface CustomTransaction {
  readonly session: ClientSession;
}

export type MakeDatabaseType<Database extends object> = Database & {
  useTransaction(transaction: CustomTransaction): Database;
};

export interface MakeWithTransaction_Argument {
  client: MongoClient;
  transactionOptions: TransactionOptions;
}

type WithTransactionCallback = (arg: {
  transaction: CustomTransaction;
}) => Promise<any>;

export type WithTransaction = <CB extends WithTransactionCallback>(
  callback: CB
) => Promise<void>;
