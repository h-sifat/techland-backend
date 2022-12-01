import {
  makeMainImageUrlGeneratorStage,
  makeAllProductCategoriesLookupStage,
} from "./util";

describe("makeMainImageUrlGeneratorStage", () => {
  it(`create a $set stage to create the mainImageUrl`, () => {
    const fieldNames = Object.freeze({
      images: "images",
      imageId: "id",
      generatedUrl: "imageUrl",
      imageIsMain: "isMain",
    });
    const imageUrlPrefix = "https://techland.com/images/";

    const mainImageUrlGeneratorStage = makeMainImageUrlGeneratorStage({
      imageUrlPrefix,
      fieldNames: <any>fieldNames,
    } as any);

    expect(mainImageUrlGeneratorStage).toEqual({
      $set: {
        [fieldNames.generatedUrl]: {
          // select the main image id and generate url
          $concat: [
            imageUrlPrefix,
            {
              $getField: {
                input: {
                  $first: {
                    $filter: {
                      input: `$${fieldNames.images}`,
                      as: "image",
                      cond: {
                        $eq: [`$$image.${fieldNames.imageIsMain}`, true],
                      },
                    },
                  }, // end $first
                },
                field: fieldNames.imageId,
              }, // end $getField
            },
          ],
        }, // end imageUrl
      },
    });
  });
});

describe("makeAllCategoriesLookupStage", () => {
  it(`makes a $lookup stage from product_categories`, () => {
    const addCategoriesAs = "categories";
    const collectionName = "product_categories";
    const pickFields = Object.freeze(["_id", "name", "parentId"]) as string[];

    const lookupCategoriesStage = makeAllProductCategoriesLookupStage({
      pickFields,
      collectionName,
      addCategoriesAs,
    });

    // Hmmm 😕! The expected result looks exactly like the implementation.
    expect(lookupCategoriesStage).toEqual({
      $lookup: {
        from: collectionName,
        as: addCategoriesAs,
        pipeline: [
          {
            $project: pickFields.reduce((filter: any, field: any) => {
              filter[field] = 1;
              return filter;
            }, {} as any),
          },
        ],
      },
    });
  });
});
