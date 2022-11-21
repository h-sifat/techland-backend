import { makeProductCategoryEntity } from "./make-category-entity";
import { createMD5Hash, currentTimeMs, makeId } from "../../common/util";

export const ProductCategory = makeProductCategoryEntity({
  makeId,
  currentTimeMs,
  createHash: createMD5Hash,
});
