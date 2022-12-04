import { debug } from "debug";

export function makeDebugger(arg: { namespace: string }) {
  return debug(arg.namespace);
}
