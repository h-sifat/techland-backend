import {
  makeAllProductCategoriesLookupStage,
  makeMainImageUrlGeneratorStage,
} from "./util";
import { makePaginationStagesArray } from "../util";
import { makeSearchProducts } from "./search-products";
import { deepFreeze } from "../../common/util/deep-freeze";

const toArray = jest.fn();
const aggregate = jest.fn(() => Object.freeze({ toArray }));
const collection = Object.freeze({ aggregate });

const imageUrlPrefix = "https://techland.com/imgaes";
const productCategoryCollectionName = "product_categories";

const searchPaths = Object.freeze([
  "name",
  "brand",
  "shortDescriptions",
  "description",
] as const);

const searchProducts = makeSearchProducts({
  deepFreeze,
  imageUrlPrefix,
  collection: <any>collection,
  productCategoryCollectionName,
  searchPaths: <any>searchPaths,
  makeMainImageUrlGeneratorStage,
  makeAllProductCategoriesLookupStage,
  makeAggregationStagesForPagination: makePaginationStagesArray,
});

beforeEach(() => {
  toArray.mockClear();
  aggregate.mockClear();
});

describe("Functionality", () => {
  const searchProductsArg = deepFreeze({
    formatDocumentAs: "public",
    query: "Keychron",
    pagination: { pageNumber: 1, itemsPerPage: 20 },
  } as const);

  let fakeResponse: any;

  beforeEach(() => {
    fakeResponse = [{ a: 1 }];
    toArray.mockResolvedValueOnce(fakeResponse);
  });

  it(`searches the query in the given search paths`, async () => {
    const result = await searchProducts(searchProductsArg);
    expect(result).toEqual(fakeResponse[0]);
    expect(Object.isFrozen(fakeResponse[0])).toBeTruthy();

    const aggregationPipeline = (<any[][]>aggregate.mock.calls)[0][0] as any[];

    expect(aggregationPipeline[0]).toMatchObject({
      $search: {
        text: {
          path: searchPaths,
          query: searchProductsArg.query,
        },
      },
    });

    expect(aggregate).toHaveBeenCalledTimes(1);
    expect(aggregate).toHaveBeenCalledWith(expect.any(Array), {});
  });

  it(`hides hidden products if formatDocumentAs is "public"`, async () => {
    await searchProducts({ ...searchProductsArg, formatDocumentAs: "public" });
    const aggregationPipeline = (<any[][]>aggregate.mock.calls)[0][0] as any[];

    expect(aggregationPipeline[1]).toEqual({
      $match: { isHidden: false },
    });
  });

  it(`does not hide hidden products if formatDocumentAs is "private"`, async () => {
    await searchProducts({ ...searchProductsArg, formatDocumentAs: "private" });
    const aggregationPipeline = (<any[][]>aggregate.mock.calls)[0][0] as any[];

    expect(aggregationPipeline[1]).not.toEqual({
      $match: { isHidden: false },
    });
  });

  it(`passes the transaction session to the db method`, async () => {
    const session: any = "my transaction session";
    await searchProducts(
      { ...searchProductsArg, formatDocumentAs: "private" },
      { session }
    );

    expect(aggregate).toHaveBeenCalledTimes(1);
    expect(aggregate).toHaveBeenCalledWith(expect.any(Array), { session });
  });
});
