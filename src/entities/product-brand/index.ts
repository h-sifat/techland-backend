import cuid from "cuid";
import { currentTimeMs } from "../../common/util";
import { makeProductBrandEntity } from "./make-brand-entity";

export const ProductBrand = makeProductBrandEntity({
  currentTimeMs,
  makeId: () => cuid.slug(),
});
