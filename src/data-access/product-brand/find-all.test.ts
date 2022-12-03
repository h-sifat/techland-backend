import { deepFreeze } from "../../common/util/deep-freeze";
import { makeFindAll } from "./find-all";

const toArray = jest.fn();
const find = jest.fn(() => ({ toArray }));
const collection = Object.freeze({ find });

const findAll = makeFindAll({
  deepFreeze: deepFreeze,
  collection: <any>collection,
});

beforeEach(() => {
  find.mockClear();
  toArray.mockClear();
});

describe("Functionality", () => {
  it(`calls the collection.find method and returns the result`, async () => {
    const fakeResponse = [{ _id: 1 }];
    toArray.mockResolvedValueOnce(fakeResponse);

    const result = await findAll();
    expect(result).toEqual(fakeResponse);
    expect(Object.isFrozen(result)).toBeTruthy();

    expect(collection.find).toHaveBeenCalledTimes(1);
    expect(collection.find).toHaveBeenCalledWith({}, {});
  });

  it(`passes the transaction session to the find method`, async () => {
    const fakeResponse = [{ _id: 1 }];
    toArray.mockResolvedValueOnce(fakeResponse);

    const session: any = "my transaction session";
    await findAll({ session });

    expect(collection.find).toHaveBeenCalledTimes(1);
    expect(collection.find).toHaveBeenCalledWith({}, { session });
  });
});
