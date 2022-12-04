import { UseCaseOptions } from ".";
import type {
  CategoryInterface,
  CategoryPublicInterface,
  CategoryPrivateInterface,
} from "../../entities/product-category/interface";

interface FormatDocumentAs {
  formatDocumentAs: "public" | "private";
}

export interface DBQueryMethodArgs {
  findAll: FormatDocumentAs;
  insert: CategoryInterface;
  deleteById: { id: string };
  findByHash: { hash: string };
  findSubCategories: { id: string };
  findById: { id: string } & FormatDocumentAs;
  updateById: { id: string; category: CategoryInterface };
}

export interface ReadOptions {
  audience: "public" | "private";
}

export type FormatDocument<Arg extends FormatDocumentAs> =
  Arg["formatDocumentAs"] extends "public"
    ? CategoryPublicInterface
    : CategoryPrivateInterface;

export interface ProductCategoryDatabase {
  findAll<Arg extends DBQueryMethodArgs["findAll"]>(
    arg: Arg,
    // @TODO remove the use-case options. it doesn't belong here
    options?: UseCaseOptions
  ): Promise<Readonly<FormatDocument<Arg>>[]>;
  findById<Arg extends DBQueryMethodArgs["findById"]>(
    arg: Arg,
    // @TODO remove the use-case options. it doesn't belong here
    options?: UseCaseOptions
  ): Promise<Readonly<FormatDocument<Arg>> | null>;
  findByHash(
    arg: DBQueryMethodArgs["findByHash"]
  ): Promise<Readonly<CategoryInterface> | null>;
  updateById(arg: DBQueryMethodArgs["updateById"]): Promise<void>;
  insert(arg: DBQueryMethodArgs["insert"]): Promise<void>;
  findSubCategories(
    arg: DBQueryMethodArgs["findSubCategories"],
    // @TODO remove the use-case options. it doesn't belong here
    options?: UseCaseOptions
  ): Promise<Readonly<CategoryInterface>[]>;
}
