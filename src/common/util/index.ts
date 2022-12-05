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

export interface MakeUrl_Argument {
  host: string;
  protocol: string;
  searchParams?: Record<string, string>;
  auth?: { password: string; username: string };
}

export function makeUrl(arg: MakeUrl_Argument) {
  const { protocol, host, auth, searchParams } = arg;

  let url = `${protocol}://`;

  if (auth)
    url +=
      [auth.username, auth.password].map(encodeURIComponent).join(":") + "@";

  url += host;

  if (searchParams) url += "?" + new URLSearchParams(searchParams).toString();

  return url;
}
