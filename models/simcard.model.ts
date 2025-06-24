export type SimCard = {
  id: string;
  createAt: string;
  updateAt: string;
  phoneNumber: string;
  portNumber: string;
  imsi: string;
  iccid: string;
  number: number;
  status: StatusSimCard;
  simCardNote: string;
  deviceUserId: string;
  lastUsedAt: string;
  portStatus: StatusPort;
  isActive: boolean;
  expireAt: Date;
  provider: string;
};

export type StatusSimCard = "active" | "inactive";

export type DeviceUser = {
  id: string;
  createAt: string;
  updateAt: string;
  portNumber: string;
  url: string;
  country: string;
  username: string;
  password: string;
};

export type SimCardOnPartner = {
  id: string;
  createAt: string;
  updateAt: string;
  partnerId: string;
  simCardId: string;
};

export type TagOnSimcard = {
  id: string;
  createAt: Date;
  updateAt: Date;
  tag: string;
  icon: string;
  simCardId: string;
};

export type MessageOnSimcard = {
  id: string;
  createAt: Date;
  updateAt: Date;
  message: string;
  isRead: boolean;
  sender: string;
  recipient: string;
  status: number;
  timestamp: number;
  simCardId: string;
};

export type StatusPort =
  | "no card"
  | "free card"
  | "SIM card in registration"
  | "SIM card register successful"
  | "Talking"
  | "no balance or alarm"
  | "SIM card register fail"
  | "SIM card is locked (program behavior)"
  | "SIM card is locked (operator behavior)"
  | "SIM card read error"
  | "SIM card inserted"
  | "user lock"
  | "port not match"
  | "preparing";

export type FavoriteOnSimCard = {
  id: string;
  createAt: string;
  updateAt: string;
  userId: string;
  simCardId: string;
};
