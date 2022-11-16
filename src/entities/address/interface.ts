export interface AddressConfigInterface {
  phoneLength: number;
  maxCityLength: number;
  zipCodeLength: number;
  maxStreetLength: number;
  maxDistrictLength: number;
}

export interface AddressPublicInterface {
  id: string;
  city: string;
  phone: string;
  street: string;
  zipCode: string;
  district: string;
  createdAt: number;
}

export type AddressPrivateInterface = AddressPublicInterface & {
  hash: string;
  userId: string;
  isDeleted: boolean;
};

export type AssertValidAddress = (
  address: unknown
) => asserts address is AddressPrivateInterface;
