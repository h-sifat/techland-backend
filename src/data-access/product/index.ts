import deepFreezeStrict from "deep-freeze-strict";

export const makeFindArgsPartial = (() => {
  const commonFormattedProductFields = [
    "_id",
    "name",
    "price",
    "priceUnit",
    "shortDescriptions",
  ];

  return deepFreezeStrict({
    metaFieldName: "meta",
    productsFieldName: "products",
    productCategoriesFieldName: "categories",

    metaFieldNames: {
      allBrands: "brands",
      maxPrice: "maxPrice",
      minPrice: "minPrice",
      productsCount: "count",
    },
    originalProductFieldNames: {
      imageId: "id",
      brand: "brand",
      price: "price",
      images: "images",
      brandId: "brand.id",
      imageUrl: "imageUrl",
      isHidden: "isHidden",
      imageIsMain: "isMain",
      categoryId: "categoryId",
    },

    formattedProductFields: {
      public: [...commonFormattedProductFields],
      private: [...commonFormattedProductFields, "isHidden"],
    },

    formattedProductCategoryFields: ["_id", "name", "parentId"],
  });
})();
