import type { HttpRequest, HttpResponse } from "./interface";

export interface NotFound_Argument {
  httpRequest: HttpRequest;
}
export async function notFound(arg: NotFound_Argument): Promise<HttpResponse> {
  const { httpRequest } = arg;

  return {
    body: {
      success: false,
      errorType: "msgAndCode",
      error: { message: `Unknown route: "${httpRequest.path}"` },
    },
    statusCode: 404,
    headers: { "Content-Type": "application/json" },
  };
}
