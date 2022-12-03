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
  collection: <any>collection,
  makeMainImageUrlGeneratorStage,
});

beforeEach(() => {
  toArray.mockClear();
  aggregate.mockClear();
});

describe("Functionality", () => {
  const fakeSuggestions = [{ v: "a" }, { v: "b" }];

  const arg = Object.freeze({
    count: 5,
    query: "Logitech",
  });

  beforeEach(() => {
    toArray.mockResolvedValueOnce(fakeSuggestions);
  });

  it(`calls the aggregate method and returns the result of toArray`, async () => {
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

    expect(aggregate).toHaveBeenCalledTimes(1);
    expect(aggregate).toHaveBeenCalledWith(expect.any(Array), {});
  });

  it(`passes the transaction session to the db method`, async () => {
    const session: any = "my transaction session";

    await getSearchSuggestions(arg, { session });

    expect(aggregate).toHaveBeenCalledTimes(1);
    expect(aggregate).toHaveBeenCalledWith(expect.any(Array), { session });
  });
});
