import { getConfig, modifyConfig } from ".";

describe("modifyConfig", () => {
  it(`can modify the config but cannot set unknown variable`, () => {
    const configBefore = getConfig();

    const knownKey = "PORT";
    const change = "00";
    const unknownKey = "$$$i_hope_this_does_not_exist_in_config$$$";

    expect(configBefore).toHaveProperty(knownKey);
    expect(configBefore).not.toHaveProperty(unknownKey);

    modifyConfig({
      changes: {
        [knownKey]: configBefore[knownKey] + change,
        [unknownKey]: "hi",
      },
    });

    const configAfter = getConfig();

    expect(configAfter[knownKey]).toBe(configBefore[knownKey] + change);
    expect(configBefore).not.toHaveProperty(unknownKey);
  });
});
