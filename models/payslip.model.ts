export type Payslip = {
  id: string;
  createAt: Date;
  updateAt: Date;
  recordDate: Date;
  name: string;
  startDate: string;
  salary: number;
  socialSecurity: number;
  bonus: number;
  tax: number;
  deduction: number;
  note: string;
  userId: string;
};
