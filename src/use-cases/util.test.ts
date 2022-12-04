import { makeGetDatabase } from "./util";

const __database__ = Object.freeze({
  useTransaction: jest.fn(),
});

const getDatabase = makeGetDatabase(__database__);

beforeEach(() => {
  Object.values(__database__).forEach((method) => method.mockReset());
});

it(`returns the original database if no transaction is passed`, () => {
  const db = getDatabase();
  expect(db).toEqual(__database__);
});

it(`returns the transactional database if "transaction" option is passed`, () => {
  const transaction: any = Math.random().toString();
  const fakeDb = Object.freeze({ find: () => {} });

  __database__.useTransaction.mockReturnValue(fakeDb);

  const db = getDatabase({ transaction });
  expect(db).toEqual(fakeDb);
});
