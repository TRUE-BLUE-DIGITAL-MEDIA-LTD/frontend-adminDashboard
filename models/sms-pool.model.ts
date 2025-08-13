export type SMSPool = {
  id: string;
  createAt: string;
  updateAt: string;
  country: string;
  isComplete: boolean;
  isGetSms: boolean;
  price: number;
  orderId: string;
  phoneNumber: string;
  expireAt: string;
  serviceCode: string;
  userId: string;
};
export type Country = {
  ID: number;
  name: string;
  short_name: string;
  cc: string;
  region: string;
};

export type Service = {
  ID: number;
  name: string;
  favourite: number;
};

export type SmsPoolAccount = {
  id: string;
  createAt: Date;
  updateAt: Date;
  username: string;
  isActive: boolean;
  lastActiveAt: Date;
};
