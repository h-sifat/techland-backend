interface EPP_Argument {
  code: string;
  message: string;
  [key: string]: any;
}

export class EPP extends Error {
  code: string;
  constructor(arg: EPP_Argument) {
    const { message, code, ...rest } = arg;
    super(message);

    this.code = code;
    Object.assign(this, rest);
  }
}
