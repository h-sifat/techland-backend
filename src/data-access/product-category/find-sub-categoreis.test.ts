import { makeCategoryProjectStages } from "./util";
import { deepFreeze } from "../../common/util/deep-freeze";
import { makeFindSubCategories } from "./find-sub-categoreis";

const toArray = jest.fn();
const aggregate = jest.fn(() => Object.freeze({ toArray }));
const collection = Object.freeze({ aggregate });

const collectionName = "product_categories";
const imageUrlPrefix = "https://techland.com/images";
const categoryProjectStages = makeCategoryProjectStages({ imageUrlPrefix });

const findSubCategories = makeFindSubCategories({
  deepFreeze,
  collectionName,
  categoryProjectStages,
  collection: <any>collection,
});

beforeEach(() => {
  toArray.mockClear();
  aggregate.mockClear();
});

describe("Functionality", () => {
  const id = "a";

  it.each([
    {
      arg: { id, formatDocumentAs: "public" },
      expectedMatchStage: { $match: { _id: id } },
      expectedProjectStage: { $project: categoryProjectStages["public"] },
    },
    {
      arg: { id, formatDocumentAs: "private" },
      expectedMatchStage: { $match: { _id: id } },
      expectedProjectStage: { $project: categoryProjectStages["private"] },
    },
  ] as const)(
    `calls the aggregate method with the right pipeline`,
    async ({ arg, expectedMatchStage, expectedProjectStage }) => {
      const fakeResponse = [{ a: 1 }];
      toArray.mockResolvedValueOnce(fakeResponse);

      const result = await findSubCategories(arg);
      expect(result).toEqual(fakeResponse);
      expect(Object.isFrozen(fakeResponse)).toBeTruthy();

      expect(aggregate).toHaveBeenCalledTimes(1);
      expect(aggregate).toHaveBeenCalledWith(expect.any(Array), {});

      // @ts-ignore
      const pipeline = aggregate.mock.calls[0][0] as any[];

      const matchStage = pipeline.find((stage) => "$match" in stage);
      expect(matchStage).toEqual(expectedMatchStage);

      const lastProjectStage = (() => {
        for (let i = pipeline.length - 1; i > -1; i--) {
          const stage = pipeline[i];
          if ("$project" in stage) return stage;
        }
      })();

      expect(lastProjectStage).toEqual(expectedProjectStage);
    }
  );

  it(`passes the transaction session to the db method`, async () => {
    const fakeResponse = [{ a: 1 }];
    toArray.mockResolvedValueOnce(fakeResponse);

    const session: any = "my transaction session";
    const arg = Object.freeze({ id, formatDocumentAs: "private" });
    await findSubCategories(arg, { session });

    expect(aggregate).toHaveBeenCalledTimes(1);
    expect(aggregate).toHaveBeenCalledWith(expect.any(Array), { session });
  });
});
