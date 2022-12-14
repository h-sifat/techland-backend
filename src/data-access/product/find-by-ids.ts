import type { Collection } from "mongodb";
import type { QueryMethodOptions } from "../util";
import type { DBQueryMethodArgs } from "../../use-cases/interfaces/product-db";
import { deepFreeze } from "../../common/util/deep-freeze";

const commonProjectFields = Object.freeze({
  _id: 1,
  name: 1,
  brand: 1,
  price: 1,
  images: 1,
  createdAt: 1,
  priceUnit: 1,
  categoryId: 1,
  description: 1,
  lastModifiedAt: 1,
  specifications: 1,
  shortDescriptions: 1,
} as const);

export const findByIdsProjectObjects = deepFreeze({
  public: {
    ...commonProjectFields,
    inStock: { $ne: ["$inStock", 0] },
  },
  private: {
    ...commonProjectFields,
    addedBy: 1,
    inStock: 1,
    isHidden: 1,
  },
} as const);

export interface MakeFindByIds_Argument {
  imageUrlPrefix: string;
  collection: Pick<Collection, "aggregate">;
}
export function makeFindByIds(factoryArg: MakeFindByIds_Argument) {
  const { collection, imageUrlPrefix } = factoryArg;

  const imageIdToUrlMapper = deepFreeze({
    $map: {
      input: "$images",
      as: "image",
      in: {
        isMain: "$$image.isMain",
        url: { $concat: [imageUrlPrefix, "$$image.id"] },
      },
    },
  });

  return async function findByIds(
    arg: DBQueryMethodArgs["findByIds"],
    options: QueryMethodOptions = {}
  ): Promise<any> {
    const { ids, formatDocumentAs } = arg;

    const aggregateArgs: [any, any] = [
      [
        { $match: { _id: { $in: ids } } },
        {
          $project: {
            ...findByIdsProjectObjects[formatDocumentAs], // don't change order
            images: imageIdToUrlMapper,
          },
        },
      ],
      options,
    ];

    const products = await collection.aggregate(...aggregateArgs).toArray();

    return products as any;
  };
}
