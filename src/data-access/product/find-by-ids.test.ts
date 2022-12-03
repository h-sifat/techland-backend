import { findByIdsProjectObjects, makeFindByIds } from "./find-by-ids";

const toArray = jest.fn();
const aggregate = jest.fn(() => Object.freeze({ toArray }));
const collection = Object.freeze({ aggregate });

const findByIds = makeFindByIds({ collection: <any>collection });

beforeEach(() => {
  toArray.mockClear();
  aggregate.mockClear();
});

describe("Functionality", () => {
  const sampleResultDocs = Object.freeze([{ _id: "1", name: "A" }]);
  const ids = Object.freeze(["a"]) as string[];

  it.each(["public", "private"] as const)(
    `retrieves docs as %p`,
    async (formatDocumentAs) => {
      toArray.mockResolvedValueOnce(sampleResultDocs);

      const products = await findByIds({ ids, formatDocumentAs });
      expect(products).toEqual(sampleResultDocs);

      expect(aggregate).toHaveBeenCalledTimes(1);
      expect(aggregate).toHaveBeenCalledWith(
        [
          { $match: { _id: { $in: ids } } },
          { $project: findByIdsProjectObjects[formatDocumentAs] },
        ],
        {}
      );
    }
  );

  it(`passes the transaction session to the db method`, async () => {
    const session: any = "my transaction session";

    toArray.mockResolvedValueOnce(sampleResultDocs);

    const formatDocumentAs = "public";
    await findByIds({ ids, formatDocumentAs }, { session });

    expect(aggregate).toHaveBeenCalledTimes(1);
    expect(aggregate).toHaveBeenCalledWith(
      [
        { $match: { _id: { $in: ids } } },
        { $project: findByIdsProjectObjects[formatDocumentAs] },
      ],
      { session }
    );
  });
});
