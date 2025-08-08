import { type BaseSchema } from "../common/dto/base.dto";

export interface IUser extends BaseSchema {
  stripeCustomerId: any;
  save(): unknown;
  // Required
  firstName: string;
  lastName: string;
  email: string;
  role: "USER" | "ADMIN";
  passportNumber: string;

  // Optional
  name?: string; 
  password?: string;
  refreshToken?: string;
  active?: boolean;
  blocked?: boolean;
  blockReason?: string;
  provider: ProviderType;
  facebookId?: string;
  linkedinId?: string;
  image?: string;

  userName?: string;
  securityNumber?: string;
  title?: string;
  country?: string;
  maritalStatus?: string;
  dob?: Date;
  arrivalDate?: Date;
  language?: string;
}

export enum ProviderType {
  GOOGLE = "google",
  MANUAL = "manual",
  FACEBOOK = "facebook",
  APPLE = "apple",
  LINKEDIN = "linkedin",
}
