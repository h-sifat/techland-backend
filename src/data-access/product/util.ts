export interface MakeMainImageUrlGeneratorStage_Argument {
  imageUrlPrefix: string;
  fieldNames: {
    images: string;
    imageId: string;
    imageUrl: string;
    imageIsMain: string;
  };
}

export type MakeMainImageUrlGeneratorStage = (
  arg: MakeMainImageUrlGeneratorStage_Argument
) => { $set: object };

export function makeMainImageUrlGeneratorStage(
  arg: MakeMainImageUrlGeneratorStage_Argument
) {
  const {
    images: imagesFieldName,
    imageId: imageIdFieldName,
    imageUrl: imageUrlFieldName,
    imageIsMain: imageIsMainFieldName,
  } = arg.fieldNames;

  /**
   * The following scary lines are doing exactly the same thing as
   * the following code snippet:
   *
   * ```js
   * const id = product.images.filter(image => image[imageIsMainFieldName])[0]
   * product[imageUrlFieldName] = imageUrlPrefix + id
   * ```
   * */
  const setStage = {
    $set: {
      [imageUrlFieldName]: {
        // select the main image id and generate url
        $concat: [
          arg.imageUrlPrefix,
          {
            $getField: {
              input: {
                $first: {
                  $filter: {
                    input: `$${imagesFieldName}`,
                    as: "image",
                    cond: { $eq: [`$$image.${imageIsMainFieldName}`, true] },
                  },
                }, // end $first
              },
              field: imageIdFieldName,
            }, // end $getField
          },
        ],
      }, // end imageUrl
    },
  };

  return setStage;
}

export interface MakeAllCategoriesLookupStage_Argument {
  pickFields: string[];
  collectionName: string;
  addCategoriesAs: string;
}

export type MakeAllProductCategoriesLookupStage = (
  arg: MakeAllCategoriesLookupStage_Argument
) => { $lookup: object };

export function makeAllProductCategoriesLookupStage(
  arg: MakeAllCategoriesLookupStage_Argument
) {
  const { pickFields, collectionName, addCategoriesAs } = arg;

  return {
    $lookup: {
      from: collectionName,
      as: addCategoriesAs,
      pipeline: [
        // this stage generates: {$project: {name: 1, parentId: 1 ...}}
        {
          $project: pickFields.reduce((filter, field) => {
            filter[field] = 1;
            return filter;
          }, {} as any),
        },
      ],
    },
  };
}
