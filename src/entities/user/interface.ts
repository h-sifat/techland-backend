export interface UserConfigInterface {
  MAX_NAME_LENGTH: number;
  MAX_PASSWORD_LENGTH: number;
  MIN_PASSWORD_LENGTH: number;
}

export interface UserPublicInterface {
  _id: string;
  name: string;
  email: string;
  createdAt: number;
  addresses: string[];
}

export enum ACCOUNT_STATUSES {
  OPEN = "open",
  BANNED = "banned",
  FROZEN = "frozen",
  DELETED = "deleted",
}
Object.freeze(ACCOUNT_STATUSES);

export type UserPrivateInterface = UserPublicInterface & {
  password: string;
  accountStatus: ACCOUNT_STATUSES;
};
