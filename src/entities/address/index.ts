import { getEntityConfig } from "../../config/index";
import { makeAddressEntity } from "./make-address-entity";
import { createHash, makeId } from "../../common/util/index";

export const Address = makeAddressEntity({
  makeId,
  createHash,
  currentTimeMs: () => Date.now(),
  config: getEntityConfig({ entity: "address" }),
});
