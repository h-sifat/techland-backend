export interface UseCaseOptions {
  transaction?: any;
}

export interface GetDatabase_Argument {
  transaction?: any;
}
export type GetDatabase<T> = (arg?: GetDatabase_Argument) => T;
