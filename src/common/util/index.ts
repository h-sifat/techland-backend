import cuid from "cuid";
import crypto from "crypto";
import type { MakeId } from "../interface";

export function createMD5Hash(str: string): string {
  return crypto.createHash("md5").update(str).digest("base64");
}

export const makeId: MakeId = () => cuid();

export function currentTimeMs() {
  return Date.now();
}
