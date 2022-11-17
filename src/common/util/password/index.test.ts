import { hashPassword, matchPassword } from "./index";

it(`works`, async () => {
  const password = "weak_pass";
  const hash: string = await hashPassword(password);

  expect(hash).not.toBe(password);
  expect(await matchPassword({ password, hash })).toBeTruthy();
  expect(await matchPassword({ password: password + "1", hash })).toBeFalsy();
});
