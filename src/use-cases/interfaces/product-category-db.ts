import type {
  CategoryInterface,
  CategoryPublicInterface,
  CategoryPrivateInterface,
} from "../../entities/product-category/interface";

interface FormatDocumentAs {
  formatDocumentAs: "public" | "private";
}

export interface DBQueryMethodArgs {
  insert: CategoryInterface;
  findAll: FormatDocumentAs;
  deleteById: { id: string };
  findByHash: { hash: string };
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
    arg: Arg
  ): Promise<Readonly<FormatDocument<Arg>>[]>;
  findById<Arg extends DBQueryMethodArgs["findById"]>(
    arg: Arg
  ): Promise<Readonly<FormatDocument<Arg>> | null>;
  findByHash(
    arg: DBQueryMethodArgs["findByHash"]
  ): Promise<Readonly<CategoryInterface> | null>;
  updateById(arg: DBQueryMethodArgs["updateById"]): Promise<void>;
  insert(arg: DBQueryMethodArgs["insert"]): Promise<void>;
}
