import { makeUserEntity } from "./make-user-entity";
import { getEntityConfig } from "../../config/index";
import { hashPassword } from "../../common/util/password";
import { currentTimeMs, makeId } from "../../common/util/index";

export const User = makeUserEntity({
  makeId,
  hashPassword,
  currentTimeMs,
  config: getEntityConfig({ entity: "user" }),
});
