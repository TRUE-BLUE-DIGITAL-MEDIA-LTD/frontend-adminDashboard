export type Partner = {
  id: string;
  createAt: Date;
  updateAt: Date;
  affiliateId: string;
  userId: string;
  isAllowUsingSMSPVA: boolean;
  isAllowUsingSMSPOOL: boolean;
  isAllowUsingSMS_TEXTVERIFIED: boolean;
  isAllowSmsPoolAccount: boolean;
  isAllowManageSmsOxy: boolean;
  isAllowManageAssignPhoneNumber: boolean;
  isAllowManageAssignDomain: boolean;
  isAllowManageAssginCategory: boolean;
  isAllowUsingSMS_Pinverify: boolean;
  isAllowSmsPinverifyAccount: boolean;
  dailyLimitSMSPVA: number;
  smartLink?: string | undefined;
  name: string;
};

export type ResponsibilityOnPartner = {
  id: string;
  createAt: Date;
  updateAt: Date;
  partnerId: string;
  domainId: string;
};
