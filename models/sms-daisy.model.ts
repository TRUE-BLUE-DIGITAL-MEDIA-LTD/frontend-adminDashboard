export type SmsDaisy = {
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
  userId: string;
  smsDaisyAccountId: string;
};

export type SmsDaisyAccount = {
  id: string;
  createAt: string;
  updateAt: string;
  username: string;
  apiKey: string;
  isActive: boolean;
  lastActiveAt: string;
};

export type SmsDaisyMessage = {
  id: string;
  createAt: string;
  updateAt: string;
  activationId: string;
  code: string;
  text: string;
  messageId: string;
  receviedAt: string;
  smsDaisyId: string;
};
