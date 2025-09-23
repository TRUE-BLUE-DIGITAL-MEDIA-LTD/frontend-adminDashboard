export type SmsPinverify = {
  id: string;
  createAt: string;
  updateAt: string;
  userId: string;
  isComplete: boolean;
  isGetSms: boolean;
  price: number;
  n_id: string;
  key_id: string;
  phoneNumber: string;
  expireAt: string;
  country: string;
  serviceCode: string;
  message: string;
  smsPinverifyAccountId: string;
};

export type SmsPinverifyAccount = {
  id: string;
  createAt: string;
  updateAt: string;
  username: string;
  apiKey: string;
  isActive: boolean;
  lastActiveAt: string;
};
