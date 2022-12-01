import deepFreeze from "deep-freeze-strict";
import { makeGetSearchSuggestions } from "./get-search-suggestions";
import { makeMainImageUrlGeneratorStage } from "./util";

const toArray = jest.fn();
const aggregate = jest.fn(() => Object.freeze({ toArray }));
const collection = Object.freeze({ aggregate });

const imageUrlPrefix = "https://techland.com/imgaes";

const getSearchSuggestions = makeGetSearchSuggestions({
  deepFreeze,
  imageUrlPrefix,
  makeMainImageUrlGeneratorStage,
  getCollection: () => <any>collection,
});

beforeEach(() => {
  toArray.mockClear();
  aggregate.mockClear();
});

describe("Functionality", () => {
  it(`calls the aggregate method and returns the result of toArray`, async () => {
    const fakeSuggestions = [{ v: "a" }, { v: "b" }];
    toArray.mockResolvedValueOnce(fakeSuggestions);

    const arg = Object.freeze({
      count: 5,
      query: "Logitech",
    });

    const suggestions = await getSearchSuggestions(arg);
    expect(suggestions).toEqual(fakeSuggestions);
    expect(Object.isFrozen(suggestions)).toBeTruthy();

    const aggregationPipeline = (<object[][]>aggregate.mock.calls[0])[0];

    const firstStage = aggregationPipeline[0];
    expect(firstStage).toMatchObject({
      $search: { autocomplete: { query: arg.query, path: "name" } },
    });

    const limitStage = aggregationPipeline.find((stage) => "$limit" in stage);
    expect(limitStage).toBeDefined();
    expect(limitStage).toEqual({ $limit: arg.count });
  });
});
