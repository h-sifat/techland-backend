import bcrypt from "bcrypt";
import { getConfig } from "../../../config/index";

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, getConfig().BCRYPT_SALT_ROUNDS);
}

export function matchPassword(arg: {
  password: string;
  hash: string;
}): Promise<boolean> {
  const { password, hash } = arg;
  return bcrypt.compare(password, hash);
}
