export type RequestMethod = "get" | "post" | "patch" | "delete";

export interface HttpRequest {
  body: any;
  ip: string;
  path: string;
  method: RequestMethod;
  query: Record<string, string>;
  params: Record<string, string>;
  headers: Record<string, string | undefined>;
}

export type HttpResponseError =
  | {
      errorType: "validation";
      error: { formErrors: string[]; fieldErrors: Record<string, string[]> };
    }
  | {
      errorType: "msgAndCode";
      error: { message: string; code?: string; [key: string]: any };
    };

export interface HttpResponse {
  body: { success: true; data: any } | ({ success: false } & HttpResponseError);

  statusCode: number;
  headers: { "Content-Type": "application/json"; [key: string]: string };
}
