import deepFreezeStrict from "deep-freeze-strict";
import { makeFindAll } from "./make-find-all";
import { makeCategoryProjectStages } from "./util";

const toArray = jest.fn();
const aggregate = jest.fn(() => Object.freeze({ toArray }));
const collection = Object.freeze({ aggregate });

const imageUrlPrefix = "https://techland.com/images";
const projectStages = makeCategoryProjectStages({ imageUrlPrefix });

const findAll = makeFindAll({
  deepFreeze: deepFreezeStrict,
  categoryProjectStages: projectStages,
  getCollection: () => <any>collection,
});

beforeEach(() => {
  toArray.mockClear();
  aggregate.mockClear();
});

describe("Functionality", () => {
  it.each([
    {
      arg: { formatDocumentAs: "public" },
      expectedAggregationPipeline: [{ $project: projectStages["public"] }],
    },
    {
      arg: { formatDocumentAs: "private" },
      expectedAggregationPipeline: [{ $project: projectStages["private"] }],
    },
  ] as const)(
    `calls the aggregate method with the right pipeline`,
    async ({ arg, expectedAggregationPipeline }) => {
      const fakeResponse = [{ a: 1 }];
      toArray.mockResolvedValueOnce(fakeResponse);

      const result = await findAll(arg);
      expect(result).toEqual(fakeResponse);
      expect(Object.isFrozen(fakeResponse)).toBeTruthy();

      expect(aggregate).toHaveBeenCalledTimes(1);
      expect(aggregate).toHaveBeenCalledWith(expectedAggregationPipeline);
    }
  );
});
