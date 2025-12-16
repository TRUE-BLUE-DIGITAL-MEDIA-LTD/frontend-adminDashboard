export type SmsBower = {
  id: string;
  createAt: string;
  updateAt: string;
  isComplete: boolean;
  userId: string;
  smsBowerAccountId: string;
  phoneNumber: string;
  serviceCode: string;
  country: string;
  price: number;
  activationId: string;
  expireAt: string;
};

export type SmsBowerMessage = {
  id: string;
  createAt: string;
  updateAt: string;
  code: string;
  text: string;
  smsBowerId: string;
};

export type FlatPrice = {
  country: string;
  service: string;
  providerKey: string;
  count: number;
  price: number;
  provider_id: number;
};

export type SmsBowerAccount = {
  id: string;
  createAt: string;
  updateAt: string;
  username: string;
  isActive: boolean;
  lastActiveAt: string;
};
