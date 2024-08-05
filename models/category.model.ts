export type Category = {
  id: string;
  createAt: Date;
  updateAt: Date;
  title: string;
  description: string;
  background: string;
  isDeleted: boolean;
};

export type CategoryOnPartner = {
  id: string;
  createAt: Date;
  updateAt: Date;
  categoryId: string;
  partnerId: string;
};
