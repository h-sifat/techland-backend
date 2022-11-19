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
  shortDescriptions: string[];
  specifications: Record<string, Record<string, string>>;
}

export type ProductPublicInterface = CommonProductFields & { inStock: boolean };
export type ProductPrivateInterface = CommonProductFields & {
  inStock: number;
  addedBy: string;
  isHidden: boolean;
  isDeleted: boolean;
};

enum PRICE_UNITS {
  USD = "USD",
  TAKA = "TAKA",
}
Object.freeze(PRICE_UNITS);
export { PRICE_UNITS };
