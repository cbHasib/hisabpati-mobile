export interface IUserProfile {
  image: string | null;
  address: string;
  dob: string;
  gender: string;
}

export interface IUserSettings {
  language: string;
  discreetMode: boolean;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profile: IUserProfile;
  settings: IUserSettings;
  isVerified: boolean;
  isAdmin: boolean;
  package: 'free' | 'basic' | 'premium';
  smsBalance: number;
  accounts: string[];
  categories: string[];
  pushToken?: string[];
}
