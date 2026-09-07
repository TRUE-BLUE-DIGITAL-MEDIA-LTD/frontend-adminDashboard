export type SmsVirtualsmsMessage = {
  id: string;
  createAt: string;
  updateAt: string;
  smsVirtualsmsId: string;
  sender: string | null;
  content: string;
  receivedAt: string;
};

export type SmsVirtualsms = {
  id: string;
  createAt: string;
  updateAt: string;
  userId: string;
  isComplete: boolean;
  isGetSms: boolean;
  price: number;
  orderId: string;
  phoneNumber: string;
  expireAt: string;
  country: string;
  serviceCode: string;
  messages: SmsVirtualsmsMessage[];
  smsVirtualsmsAccountId: string;
};

export type SmsVirtualsmsAccount = {
  id: string;
  createAt: string;
  updateAt: string;
  username: string;
  apiKey: string;
  webhookSecret: string | null;
  isActive: boolean;
  lastActiveAt: string;
};

export type SmsVirtualsmsServiceItem = {
  service_id: string;
  service_name: string;
  base_price: number;
};

export type SmsVirtualsmsCountryItem = {
  country_id: string;
  country_name: string;
  price: number;
  service_id: string;
};
