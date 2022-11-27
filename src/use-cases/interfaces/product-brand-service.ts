import type {
  MakeBrand_Argument,
  EditBrand_Argument,
} from "../../entities/product-brand/make-brand-entity";
import type { DBQueryMethodArgs } from "./product-brand-db";
import type { ProductBrandInterface } from "../../entities/product-brand/interface";

export interface ServiceArguments {
  addBrand: { brand: MakeBrand_Argument };
  findBrandById: DBQueryMethodArgs["findById"];
  findBrandByName: DBQueryMethodArgs["findByName"];
  editBrand: { id: string; changes: EditBrand_Argument["changes"] };
}

type ProductBrandResponse = Promise<Readonly<ProductBrandInterface>>;

export interface ProductBrandService {
  addBrand(arg: ServiceArguments["addBrand"]): ProductBrandResponse;
  editBrand(arg: ServiceArguments["editBrand"]): ProductBrandResponse;
  findBrandById(
    arg: ServiceArguments["findBrandById"]
  ): Promise<Readonly<ProductBrandInterface> | null>;
  listBrands(): Promise<Readonly<ProductBrandInterface>[]>;
}
