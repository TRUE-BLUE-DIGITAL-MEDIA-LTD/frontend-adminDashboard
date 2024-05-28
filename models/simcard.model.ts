export type SimCard = {
  id: string;
  createAt: string;
  updateAt: string;
  phoneNumber: string;
  portNumber: string;
  imsi: string;
  iccid: string;
  status: StatusSimCard;
  simCardNote: string;
  deviceUserId: string;
};

export type StatusSimCard = "active" | "inactive";

export type DeviceUser = {
  id: string;
  createAt: string;
  updateAt: string;
  portNumber: string;
};

export type SimCardOnPartner = {
  id: string;
  createAt: string;
  updateAt: string;
  partnerId: string;
  simCardId: string;
};
