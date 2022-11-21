export type IsAdminAndPermissions =
  | { isAdmin: true; permissions: Partial<AdminPermissions> }
  | { isAdmin: false; permissions: Partial<EmployeePermissions> };

export type EmployeePublicInterface = {
  _id: string;
  name: string;
  email: string;
  createdAt: number;
} & IsAdminAndPermissions;

export type EmployeePrivateInterface = EmployeePublicInterface & {
  password: string;
  isDeleted: boolean;
};

export interface EmployeeConfig {
  MAX_NAME_LENGTH: number;
  MIN_PASSWORD_LENGTH: number;
  MAX_PASSWORD_LENGTH: number;
}

export interface EmployeePermissions {
  addProducts: boolean;
  editProducts: boolean;
  deleteProducts: boolean;

  replyToChats: boolean;
  answerQuestions: boolean;

  manageOrders: boolean;
}

export interface AdminPermissions {
  readAdmins: boolean;
  deleteAdmins: boolean;

  addEmployees: boolean;
  editEmployees: boolean;
  deleteEmployees: boolean;
}
