import { currentTimeMs, makeId } from "../../common/util";
import { deepFreeze } from "../../common/util/deep-freeze";
import { sanitizeHTML } from "../../common/util/sanitize";
import { makeProductEntity } from "./make-product-entity";

export const Product = makeProductEntity({
  makeId,
  deepFreeze,
  sanitizeHTML,
  currentTimeMs,
});
