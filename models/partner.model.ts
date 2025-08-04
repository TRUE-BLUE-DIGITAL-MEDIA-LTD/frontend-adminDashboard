export type Partner = {
  id: string;
  createAt: Date;
  updateAt: Date;
  affiliateId: string;
  userId: string;
  isAllowUsingSMSPVA: boolean;
  isAllowUsingSMSPOOL: boolean;
  isAllowUsingSMS_TEXTVERIFIED: boolean;
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
