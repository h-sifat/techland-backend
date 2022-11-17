import { getEntityConfig } from "../../config/index";
import { makeAddressEntity } from "./make-address-entity";
import { createMD5Hash, makeId } from "../../common/util/index";

export const Address = makeAddressEntity({
  makeId,
  createHash: createMD5Hash,
  currentTimeMs: () => Date.now(),
  config: getEntityConfig({ entity: "address" }),
});
