import { makeUrl } from ".";

describe("makeUrl", () => {
  it.each([
    {
      arg: { protocol: "ftp", host: "abc.com" },
      url: "ftp://abc.com",
    },
    {
      arg: {
        protocol: "ftp",
        host: "abc.com",
        searchParams: { a: "1", b: "2" },
      },
      url: "ftp://abc.com?a=1&b=2",
    },
    {
      arg: {
        host: "abc.com",
        protocol: "ftp",
        searchParams: { a: "1", b: "2" },
        auth: { username: "al ex", password: "pa ss" },
      },
      url: `ftp://${encodeURIComponent("al ex")}:${encodeURIComponent(
        "pa ss"
      )}@abc.com?a=1&b=2`,
    },
  ])(`return "$url" for arg: $arg`, ({ url, arg }) => {
    expect(makeUrl(arg)).toEqual(url);
  });
});
