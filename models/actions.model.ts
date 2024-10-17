type UserActions = {
  create: "user.create";
  update: "user.update";
  delete: "user.delete";
  get: "user.get";
};
type UserActionsKey = UserActions[keyof UserActions];

type PartnerActions = {
  create: "partner.create";
  update: "partner.update";
  delete: "partner.delete";
  get: "partner.get";
};

type PartnerActionsKey = PartnerActions[keyof PartnerActions];

type BonusRateActions = {
  create: "bonus-rate.create";
  update: "bonus-rate.update";
  delete: "bonus-rate.delete";
  get: "bonus-rate.get";
};

type BonusRateActionsKey = BonusRateActions[keyof BonusRateActions];

type ResponsibilityOnPartnerActions = {
  create: "responsibility-on-partner.create";
  update: "responsibility-on-partner.update";
  delete: "responsibility-on-partner.delete";
  get: "responsibility-on-partner.get";
};

type ResponsibilityOnPartnerActionsKey =
  ResponsibilityOnPartnerActions[keyof ResponsibilityOnPartnerActions];

type SimCardActions = {
  create: "simcard.create";
  update: "simcard.update";
  delete: "simcard.delete";
  get: "simcard.get";
};

type SimCardActionsKey = SimCardActions[keyof SimCardActions];

type LandingPageActions = {
  create: "landing-page.create";
  update: "landing-page.update";
  delete: "landing-page.delete";
  get: "landing-page.get";
};

type LandingPageActionsKey = LandingPageActions[keyof LandingPageActions];

type DomainActions = {
  create: "domain.create";
  update: "domain.update";
  delete: "domain.delete";
  get: "domain.get";
};

type DomainActionsKey = DomainActions[keyof DomainActions];

type CategoryActions = {
  create: "category.create";
  update: "category.update";
  delete: "category.delete";
  get: "category.get";
};

type CategoryActionsKey = CategoryActions[keyof CategoryActions];

type EmailActions = {
  create: "email.create";
  update: "email.update";
  delete: "email.delete";
  get: "email.get";
};

type EmailActionsKey = EmailActions[keyof EmailActions];

type PayslipActions = {
  create: "payslip.create";
  update: "payslip.update";
  delete: "payslip.delete";
  get: "payslip.get";
};

type PayslipActionsKey = PayslipActions[keyof PayslipActions];

type DeductionOnPayslipActions = {
  create: "deduction-on-payslip.create";
  update: "deduction-on-payslip.update";
  delete: "deduction-on-payslip.delete";
  get: "deduction-on-payslip.get";
};

type DeductionOnPayslipActionsKey =
  DeductionOnPayslipActions[keyof DeductionOnPayslipActions];

type DeviceUserActions = {
  create: "device-user.create";
  update: "device-user.update";
  delete: "device-user.delete";
  get: "device-user.get";
};

type DeviceUserActionsKey = DeviceUserActions[keyof DeviceUserActions];

type MessageOnSimcardActions = {
  create: "message-on-simcard.create";
  update: "message-on-simcard.update";
  delete: "message-on-simcard.delete";
  get: "message-on-simcard.get";
};

type MessageOnSimcardActionsKey =
  MessageOnSimcardActions[keyof MessageOnSimcardActions];

type TagOnSimCardActions = {
  create: "tag-on-simcard.create";
  update: "tag-on-simcard.update";
  delete: "tag-on-simcard.delete";
  get: "tag-on-simcard.get";
};

type TagOnSimCardActionsKey = TagOnSimCardActions[keyof TagOnSimCardActions];

type SimCardOnPartnerActions = {
  create: "simcard-on-partner.create";
  update: "simcard-on-partner.update";
  delete: "simcard-on-partner.delete";
  get: "simcard-on-partner.get";
};

type SimCardOnPartnerActionsKey =
  SimCardOnPartnerActions[keyof SimCardOnPartnerActions];

type CategoryOnPartnerActions = {
  create: "category-on-partner.create";
  update: "category-on-partner.update";
  delete: "category-on-partner.delete";
  get: "category-on-partner.get";
};

type CategoryOnPartnerActionsKey =
  CategoryOnPartnerActions[keyof CategoryOnPartnerActions];

type ImageLibraryActions = {
  create: "image-library.create";
  update: "image-library.update";
  delete: "image-library.delete";
  get: "image-library.get";
};

type ImageLibraryActionsKey = ImageLibraryActions[keyof ImageLibraryActions];

export type Action = {
  user: UserActionsKey;
  partner: PartnerActionsKey;
  bonusRate: BonusRateActionsKey;
  responsibilityOnPartner: ResponsibilityOnPartnerActionsKey;
  simCard: SimCardActionsKey;
  landingPage: LandingPageActionsKey;
  domain: DomainActionsKey;
  category: CategoryActionsKey;
  email: EmailActionsKey;
  payslip: PayslipActionsKey;
  deductionOnPayslip: DeductionOnPayslipActionsKey;
  deviceUser: DeviceUserActionsKey;
  messageOnSimcard: MessageOnSimcardActionsKey;
  tagOnSimCard: TagOnSimCardActionsKey;
  simCardOnPartner: SimCardOnPartnerActionsKey;
  categoryOnPartner: CategoryOnPartnerActionsKey;
  imageLibrary: ImageLibraryActionsKey;
};

export type ActionKey = Action[keyof Action];
export type ModelKey = keyof Action;
