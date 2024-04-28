export type Partner = {
  id: string;
  createAt: string;
  updateAt: string;
  affiliateId: string;
  userId: string;
  name: string;
};

export type ResponsibilityOnPartner = {
  id: string;
  createAt: Date;
  updateAt: Date;
  partnerId: string;
  domainId: string;
};
