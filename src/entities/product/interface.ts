export interface ProductImage {
  id: string;
  isMain: boolean;
}

export interface ProductBrand {
  id: string;
  name: string;
}

export interface CommonProductFields {
  _id: string;
  name: string;
  price: number;
  createdAt: number;
  priceUnit: string;
  categoryId: string;
  brand: ProductBrand;
  description: string;
  images: ProductImage[];
  lastModifiedAt: number;
  shortDescriptions: string[];
  specifications: Record<string, Record<string, string>>;
}

export type ProductPublicInterface = CommonProductFields & {
  inStock: boolean;
};
export type ProductPrivateInterface = CommonProductFields & {
  addedBy: string;
  inStock: number;
  isHidden: boolean;
};

enum PRICE_UNITS {
  USD = "USD",
  TAKA = "TAKA",
}
Object.freeze(PRICE_UNITS);
export { PRICE_UNITS };
