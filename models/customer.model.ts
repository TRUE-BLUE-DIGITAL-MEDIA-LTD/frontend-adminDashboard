export type Customer = {
  name: string | null;
  id: string;
  createAt: Date;
  updateAt: Date;
  email: string | null;
  phone_number: string | null;
  birthday: string | null;
  company: string | null;
  website: string | null;
  zip_code: string | null;
  landingPageId: string;
  isValidate: boolean;
};
