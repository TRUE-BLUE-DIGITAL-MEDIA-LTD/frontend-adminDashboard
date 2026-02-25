export type SmsBerry = {
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
  allocationRequestId: string;
  userId: string;
};

export type SmsBerryMessage = {
  id: string;
  createAt: string;
  updateAt: string;
  text?: string;
  receviedAt: string;
  phoneNumber: string;
  smsBerryId: string;
};
