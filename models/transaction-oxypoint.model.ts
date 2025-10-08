export enum TransactionType {
  TOPUP = "TOPUP",
  REFUND = "REFUND",
  SPEND = "SPEND",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

// A TypeScript type for our transaction data
export type Transaction = {
  id: string;
  createAt: string;
  amount: number; // Represented in cents to avoid floating point issues
  type: TransactionType;
  status: TransactionStatus;
  detail: string;
  fee: number; // Also in cents
};
