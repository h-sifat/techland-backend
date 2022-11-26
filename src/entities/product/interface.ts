export interface ProductImage {
  id: string;
  isMain: boolean;
}

interface CommonProductFields {
  _id: string;
  name: string;
  brand: string;
  price: number;
  createdAt: number;
  priceUnit: string;
  description: string;
  images: ProductImage[];
  lastModifiedAt: number;
  shortDescriptions: string[];
  specifications: Record<string, Record<string, string>>;
}

export type ProductPublicInterface = CommonProductFields & {
  inStock: boolean;
  category: { id: string; name: string; parents: string[] };
};
export type ProductPrivateInterface = CommonProductFields & {
  addedBy: string;
  inStock: number;
  isHidden: boolean;
  categoryId: string;
  isDeleted: boolean;
};

enum PRICE_UNITS {
  USD = "USD",
  TAKA = "TAKA",
}
Object.freeze(PRICE_UNITS);
export { PRICE_UNITS };
