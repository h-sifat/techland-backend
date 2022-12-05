import { deepFreeze } from "../common/util/deep-freeze";
import { parseQuery } from "./util";

describe("parseQuery", () => {
  it(`parses a base64 encoded json object`, () => {
    const object = deepFreeze({
      a: 1,
      b: [2, { c: 3 }, "hi"],
    });

    const query = encodeURIComponent(
      Buffer.from(JSON.stringify(object), "utf8").toString("base64")
    );

    const parsedQueryObject = parseQuery({ query });
    expect(parsedQueryObject).toEqual(object);
  });
});
