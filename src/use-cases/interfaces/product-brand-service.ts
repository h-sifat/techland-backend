import type {
  MakeBrand_Argument,
  EditBrand_Argument,
} from "../../entities/product-brand/make-brand-entity";
import type { DBQueryMethodArgs } from "./product-brand-db";
import type { ProductBrandInterface } from "../../entities/product-brand/interface";
import { UseCaseOptions } from ".";

export interface ServiceArguments {
  addBrand: { brand: MakeBrand_Argument };
  findBrandById: DBQueryMethodArgs["findById"];
  findBrandByName: DBQueryMethodArgs["findByName"];
  editBrand: { id: string; changes: EditBrand_Argument["changes"] };
}

type ProductBrandResponse = Promise<Readonly<ProductBrandInterface>>;

export interface ProductBrandService {
  addBrand(
    arg: ServiceArguments["addBrand"],
    options?: UseCaseOptions
  ): ProductBrandResponse;
  editBrand(
    arg: ServiceArguments["editBrand"],
    options?: UseCaseOptions
  ): ProductBrandResponse;
  findBrandById(
    arg: ServiceArguments["findBrandById"],
    options?: UseCaseOptions
  ): Promise<Readonly<ProductBrandInterface> | null>;

  listBrands(
    options?: UseCaseOptions
  ): Promise<Readonly<ProductBrandInterface>[]>;
}
