import type { AddressConfigInterface } from "../entities/address/interface";

interface EntityConfig {
  address: AddressConfigInterface;
}

const entityConfig: EntityConfig = {
  address: {
    phoneLength: 15,
    zipCodeLength: 4,
    maxCityLength: 50,
    maxStreetLength: 50,
    maxDistrictLength: 50,
  },
};

export function getEntityConfig<entity extends keyof EntityConfig>(arg: {
  entity: entity;
}): EntityConfig[entity] {
  const { entity } = arg;

  return Object.freeze({ ...entityConfig[entity] });
}
