import cuid from "cuid";
import crypto from "crypto";
import type { MakeId } from "../interface";

export function createHash(str: string): string {
  return crypto.createHash("md5").update(str).digest("base64");
}

export const makeId: MakeId = () => cuid();
