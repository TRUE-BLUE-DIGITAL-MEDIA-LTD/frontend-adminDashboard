export type BonusRate = {
  id: string;
  createAt: Date;
  updateAt: Date;
  from: number;
  to: number;
  rate: number;
  userId: string;
};
