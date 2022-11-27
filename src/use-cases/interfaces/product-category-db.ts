import type {
  CategoryPublicInterface,
  CategoryPrivateInterface,
} from "../../entities/product-category/interface";

export interface DBQueryMethodArgs {
  findById: { id: string };
  deleteById: { id: string };
  findByHash: { hash: string };
  updateById: { id: string; category: CategoryPrivateInterface };
}

export interface ReadOptions {
  audience: "public" | "private";
}

export type FindResult<audience extends ReadOptions["audience"]> =
  audience extends "public"
    ? CategoryPublicInterface
    : CategoryPrivateInterface;

export interface ProductCategoryDatabase {
  findAll<Options extends ReadOptions>(
    options: Options
  ): Promise<Readonly<FindResult<Options["audience"]>>[]>;
  findById<Options extends ReadOptions>(
    arg: DBQueryMethodArgs["findById"],
    options: Options
  ): Promise<Readonly<FindResult<Options["audience"]>> | null>;
  findByHash(
    arg: DBQueryMethodArgs["findByHash"]
  ): Promise<Readonly<CategoryPrivateInterface> | null>;
  updateById(
    arg: DBQueryMethodArgs["updateById"]
  ): Promise<Readonly<CategoryPrivateInterface>>;
  insert(arg: CategoryPrivateInterface): Promise<void>;
  deleteById(arg: DBQueryMethodArgs["deleteById"]): Promise<void>;
}
