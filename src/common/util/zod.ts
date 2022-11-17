import { get } from "lodash";
import { ZodErrorMap, ZodIssueCode } from "zod";

interface MakeZodErrorMapForObjectSchema_Argument {
  labels?: object;
  objectName: string;
}

export function makeZodErrorMap(
  arg: MakeZodErrorMapForObjectSchema_Argument
): ZodErrorMap {
  const { labels = {}, objectName } = arg;

  const errorMap: ZodErrorMap = (error, ctx) => {
    const label = error.path.length
      ? get(labels, error.path) ||
        `"${makeLabelFromPath([objectName, ...error.path])}"`
      : objectName;

    switch (error.code) {
      case ZodIssueCode.invalid_type: {
        const message =
          `Expected ${label} to be ${error.expected}` +
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

function makeLabelFromPath(pathArray: (string | number)[]) {
  let label = pathArray.shift();
  for (const path of pathArray)
    label += typeof path === "number" ? `[${path}]` : `.${path}`;

  return label;
}
