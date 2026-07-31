export type Customer = {
  id: string;
  createAt: Date;
  updateAt: Date;
  email: string | null;
  ip: string | null;
  /** Country name resolved server-side from the IP at submit time (ip-api.com). */
  country: string | null;
  /** Multi-step form answers keyed by each step's answer key (gender, age, …). */
  formAnswers: Record<string, string> | null;
  landingPageId: string;
  isValidate: boolean;
};
