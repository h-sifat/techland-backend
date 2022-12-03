import { deepFreeze } from "../../common/util/deep-freeze";
import { makeFindById } from "./find-by-id";
import { makeCategoryProjectStages } from "./util";

const toArray = jest.fn();
const aggregate = jest.fn(() => Object.freeze({ toArray }));
const collection = Object.freeze({ aggregate });

const imageUrlPrefix = "https://techland.com/images";
const projectStages = makeCategoryProjectStages({ imageUrlPrefix });

const findById = makeFindById({
  collection: <any>collection,
  deepFreeze: deepFreeze,
  categoryProjectStages: projectStages,
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
      expectedAggregationPipeline: [
        { $match: { _id: id } },
        { $project: projectStages["public"] },
      ],
    },
    {
      arg: { id, formatDocumentAs: "private" },
      expectedAggregationPipeline: [
        { $match: { _id: id } },
        { $project: projectStages["private"] },
      ],
    },
  ] as const)(
    `calls the aggregate method with the right pipeline`,
    async ({ arg, expectedAggregationPipeline }) => {
      const fakeResponse = [{ a: 1 }];
      toArray.mockResolvedValueOnce(fakeResponse);

      const result = await findById(arg);
      expect(result).toEqual(fakeResponse[0]);
      expect(Object.isFrozen(fakeResponse[0])).toBeTruthy();

      expect(aggregate).toHaveBeenCalledTimes(1);
      expect(aggregate).toHaveBeenCalledWith(expectedAggregationPipeline, {});
    }
  );

  it(`passes the transaction session to the db method`, async () => {
    const fakeResponse = [{ a: 1 }];
    toArray.mockResolvedValueOnce(fakeResponse);

    const arg = Object.freeze({ id, formatDocumentAs: "private" });
    const expectedAggregationPipeline = deepFreeze([
      { $match: { _id: id } },
      { $project: projectStages["private"] },
    ]);
    const session: any = "my transaction session";

    await findById(arg, { session });

    expect(aggregate).toHaveBeenCalledTimes(1);
    expect(aggregate).toHaveBeenCalledWith(expectedAggregationPipeline, {
      session,
    });
  });
});
