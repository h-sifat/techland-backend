export interface ParseQuery_Argument {
  query: string;
}
export function parseQuery(arg: ParseQuery_Argument): object {
  const { query } = arg;

  const jsonQuery = Buffer.from(decodeURIComponent(query), "base64").toString(
    "utf8"
  );

  return JSON.parse(jsonQuery);
}
