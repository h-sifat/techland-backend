import { deepFreeze } from "../../common/util/deep-freeze";
import type {
  CategoryPublicInterface,
  CategoryPrivateInterface,
} from "../../entities/product-category/interface";

export interface CategoryProjectStages {
  public: Record<keyof CategoryPublicInterface, number | object>;
  private: Record<keyof CategoryPrivateInterface, number | object>;
}

export interface MakeCategoryProjectStages_Argument {
  imageUrlPrefix: string;
}

export function makeCategoryProjectStages(
  arg: MakeCategoryProjectStages_Argument
) {
  const { imageUrlPrefix } = arg;

  const commonCategoryFields = Object.freeze({
    _id: 1,
    name: 1,
    parentId: 1,
    createdAt: 1,
    description: 1,
  });

  const concatImageUrlPrefixWithImageId = Object.freeze({
    $concat: [imageUrlPrefix, "$imageId"],
  });

  const projectStages: CategoryProjectStages = deepFreeze({
    public: {
      ...commonCategoryFields,
      imageUrl: concatImageUrlPrefixWithImageId,
    },
    private: {
      hash: 1,
      imageId: 1,
      isDeleted: 1,
      ...commonCategoryFields,
      imageUrl: concatImageUrlPrefixWithImageId,
    },
  });

  return projectStages;
}
