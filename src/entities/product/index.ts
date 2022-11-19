import deepFreeze from "deep-freeze-strict";
import { currentTimeMs, makeId } from "../../common/util";
import { sanitizeHTML } from "../../common/util/sanitize";
import { makeProductEntity } from "./make-product-entity";

export const Product = makeProductEntity({
  makeId,
  deepFreeze,
  sanitizeHTML,
  currentTimeMs,
});
