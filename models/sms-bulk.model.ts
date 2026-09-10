export type SmsBulkAccount = {
  id: string;
  createAt: string;
  updateAt: string;
  username: string;
  apiKey: string;
  webhookSecret: string | null;
  isActive: boolean;
  lastActiveAt: string;
};

export type SmsBulkMessage = {
  id: string;
  createAt: string;
  updateAt: string;
  smsBulkId: string;
  code: string | null;
  content: string;
  receivedAt: string;
};

export type SmsBulk = {
  id: string;
  createAt: string;
  updateAt: string;
  userId: string;
  isComplete: boolean;
  isGetSms: boolean;
  price: number;
  activationId: string;
  phoneNumber: string;
  expireAt: string;
  cancellableAt: string | null;
  country: string;
  serviceCode: string;
  messages: SmsBulkMessage[];
  smsBulkAccountId: string;
};

export type SmsBulkServiceItem = {
  code: string;
  slug: string;
  name: string;
  iconUrl?: string | null;
  minPrice?: string;
};

export type SmsBulkCountryItem = {
  isoCode: string;
  name: string;
  flagEmoji?: string | null;
  price: string;
  currency: string;
  stock: number;
  speedTier?: string;
};

export type SmsBulkEmail = {
  id: string;
  createAt: string;
  updateAt: string;
  userId: string;
  isComplete: boolean;
  isGetSms: boolean;
  price: number;
  activationId: string;
  site: string;
  domain: string;
  emailAddress: string | null;
  otpValue: string | null;
  htmlMessage: string | null;
  receivedAt: string | null;
  expireAt: string;
  smsBulkAccountId: string;
};

export type SmsBulkEmailDomainItem = {
  name: string;
  price: number;
  count: number;
  currency: string;
};
