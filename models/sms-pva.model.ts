export type SmsPool = {
  id: string;
  createAt: string;
  updateAt: string;
  orderId: string;
  phoneNumber: string;
  expireAt: string;
  price: number;
  serviceCode: string;
  country: string;
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
