import { getEntityConfig } from "../../config";
import { currentTimeMs, makeId } from "../../common/util";
import { hashPassword } from "../../common/util/password";
import { makeEmployeeEntity } from "./make-employee-entity";

export const Employee = makeEmployeeEntity({
  makeId,
  hashPassword,
  currentTimeMs,
  config: getEntityConfig({ entity: "employee" }),
});
