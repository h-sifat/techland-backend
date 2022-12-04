import { HttpRequest, HttpResponse } from ".";

interface RequestArg {
  httpRequest: HttpRequest;
}

export interface ProductCategoryController {
  get(arg: RequestArg): Promise<HttpResponse>;
}
