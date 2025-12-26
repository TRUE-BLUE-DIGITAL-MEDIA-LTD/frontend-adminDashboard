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
  proxyNumber?: number;
  proxyInformation?: string;
  refreshUrl?: string;
  mobileRegion?: string;
  mobileProvince?: string;
  mobileCity?: string;
  dynamicProxy?: string;
  dynamicProxyLocation?: string;
  mobileLanguage?: string;
  profileGroup?: string;
  profileTags?: string[];
  profileNote?: string;
  surfaceBrandName?: string;
  surfaceModelName?: string;
  netType?: number;
  phoneNumber?: string;
}
export interface CheckProxyResponseData {
  detectStatus: boolean;
  message: string;
  outboundIP: string;
  countryCode: string;
  countryName: string;
  subdivision: string;
  city: string;
  timezone: string;
  isp: string;
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

export interface CreateProxyDto {
  scheme: string;
  server: string;
  port: number;
  username?: string;
  password?: string;
}

export interface UpdateProxyDto extends CreateProxyDto {
  id: string;
}

export interface DeleteProxyDto {
  id: string;
}

export interface GpsData {
  id: string;
  latitude: number;
  longitude: number;
}

export interface GetGpsDto {
  id: string;
}

export interface SetGpsDto {
  list: GpsData[];
}

export interface ProxyConfigDto {
  typeId: number;
  useProxyCfg?: boolean;
  protocol?: number;
  server?: string;
  port?: number;
  username?: string;
  password?: string;
  country?: string;
  region?: string;
  city?: string;
}

export interface UpdateCloudPhoneDto {
  id: string;
  name?: string;
  remark?: string;
  groupID?: string;
  tagIDs?: string[];
  proxyConfig?: ProxyConfigDto;
  proxyId?: string;
}

export interface GpsData {
  id: string;
  latitude: number;
  longitude: number;
}

export interface GetGpsResponseData {
  totalAmount: number;
  successAmount: number;
  failAmount: number;
  list: GpsData[];
}

export interface GetGpsResponse {
  traceId: string;
  code: number;
  msg: string;
  data: GetGpsResponseData;
}

export interface SetGpsRequest {
  list: GpsData[];
}
