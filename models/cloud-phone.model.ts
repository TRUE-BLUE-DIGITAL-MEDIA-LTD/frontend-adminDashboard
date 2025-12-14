export type MobileType =
  | "Android 9"
  | "Android 10"
  | "Android 11"
  | "Android 12"
  | "Android 13"
  | "Android 14"
  | "Android 15";

export interface CreateCloudPhoneDto {
  mobileType: MobileType;
  profileName: string;
  proxyNumber: number;
}

export interface CloudPhone {
  id: string;
  createAt: string | Date;
  updateAt: string | Date;

  geelarkId: string;
  serialName: string;
  serialNo: string;
  countryName: string;
  phoneNumber: string;
  imei: string;
  timeZone: string;
  status: string;

  userId: string;
}

export interface EquipmentInfo {
  countryName?: string;
  phoneNumber?: string;
  enableSim?: number;
  imei?: string;
  osVersion?: string;
  wifiBssid?: string;
  mac?: string;
  bluetoothMac?: string;
  timeZone?: string;
  deviceBrand?: string;
  deviceModel?: string;
}

export interface PhoneGroup {
  id: string;
  name: string;
  remark: string;
}

export interface PhoneTag {
  name: string;
}

export interface PhoneProxy {
  type: string;
  server: string;
  port: number;
  username: string;
  password: string;
}

export interface Phone {
  id: string;
  serialName: string;
  serialNo: string;
  group: PhoneGroup;
  remark: string;
  status: number;
  tags: PhoneTag[];
  equipmentInfo: EquipmentInfo;
  proxy: PhoneProxy;
  chargeMode: number;
  hasBind: boolean;
  monthlyExpire: number;
}

export type CloudPhoneWithDetails = CloudPhone & {
  geelark: Phone[];
  status: "Started" | "Starting" | "Shut down" | "Expired";
};

export interface ProxyItem {
  id: string;
  serialNo: number;
  scheme: string;
  server: string;
  port: number;
  username: string;
  password: string;
}

export interface GetProxiesDto {
  page: number;
  limit: number;
}
