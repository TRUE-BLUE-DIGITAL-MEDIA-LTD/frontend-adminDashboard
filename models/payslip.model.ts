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
  note: string;
  userId: string;
};

export type Deduction = {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  value: number;
  payslipId: string;
};
