import { MakeDatabaseType } from "../data-access/interface";
import { UseCaseOptions } from "./interfaces";

export function makeGetDatabase<DB extends object>(
  database: MakeDatabaseType<DB>
): (options?: UseCaseOptions) => DB {
  return (options = {}) => {
    const { transaction } = options;
    if (transaction) return database.useTransaction(options.transaction);
    return database;
  };
}
