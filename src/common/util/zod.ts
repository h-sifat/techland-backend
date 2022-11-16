import { get } from "lodash";
import { ZodErrorMap, ZodIssueCode } from "zod";

interface MakeZodErrorMapForObjectSchema_Argument {
  labels?: object;
  objectName: string;
}

export function makeZodErrorMapForObjectSchema(
  arg: MakeZodErrorMapForObjectSchema_Argument
): ZodErrorMap {
  const { labels, objectName = {} } = arg;

  const errorMap: ZodErrorMap = (error, ctx) => {
    const label = error.path.length
      ? get(labels, error.path) || `"${objectName}.${error.path.join(".")}"`
      : objectName;

    switch (error.code) {
      case ZodIssueCode.invalid_type: {
        const message =
          `Expected "${label}" to be ${error.expected}` +
          ` but received ${error.received}`;
        return { message };
      }

      case ZodIssueCode.unrecognized_keys: {
        const unknownProps = error.keys.map((key) => `'${key}'`).join(", ");
        const message = `Unrecognized key(s) in ${objectName}: ${unknownProps}`;
        return { message };
      }

      case ZodIssueCode.invalid_string: {
        let message = "";
        switch (error.validation) {
          case "email":
            message = `${label} must be a valid email`;
            break;

          default:
            message = ctx.defaultError;
        }

        return { message };
      }

      default:
        return { message: ctx.defaultError };
    }
  };

  return errorMap;
}
