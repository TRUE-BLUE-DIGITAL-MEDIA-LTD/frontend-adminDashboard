export type SmsGetatext = {
  id: string;
  createAt: string;
  updateAt: string;
  isComplete: boolean;
  isGetSms: boolean;
  price: number;
  activationId: string;
  phoneNumber: string;
  expireAt: string;
  country: string;
  serviceCode: string;
  smsGetatextAccountId: string;
  userId: string;
};

export type SmsGetatextMessage = {
  id: string;
  createAt: string;
  updateAt: string;
  text?: string;
  receviedAt: string;
  phoneNumber: string;
  smsGetatextId: string;
};

export type SmsGetatextBalance = {
  status: string;
  balance: number;
  errors: string | null;
};

export type GetatextPrice = {
  service_name: string;
  api_name: string;
  multiple_sms: string;
  price: string;
  ttl: number;
  stock: number;
};

export type SmsGetatextAccount = {
  id: string;
  createAt: string;
  updateAt: string;
  username: string;
  isActive: boolean;
  lastActiveAt: string;
};

export type SmsGetatextDelayedMessage = {
  phoneNumber: string;
  serviceCode: string | null;
  code: string | null;
  receviedAt: string;
  createAt: string;
  delaySeconds: number;
  activationId: string | null;
};
