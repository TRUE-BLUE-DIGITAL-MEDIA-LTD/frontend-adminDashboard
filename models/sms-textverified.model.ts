export type SmsTextVerified = {
  id: string;
  createAt: Date;
  updateAt: Date;
  isComplete: boolean;
  isGetSms: boolean;
  price: number;
  orderId: string;
  phoneNumber: string;
  expireAt: Date;
  country: string;
  serviceCode: string;
  userId: string;
};

export type Sms = {
  id: string;
  from: string | null;
  to: string;
  createdAt: string; // ISO 8601 date-time string
  smsContent: string | null;
  parsedCode: string | null;
  encrypted: boolean;
};

/**
 * Represents a link with an HTTP method and location.
 */
type Link = {
  method: string | null;
  href: string | null;
};

/**
 * Represents the possible states of the verification process.
 */
type VerificationState =
  | "verificationPending"
  | "verificationCompleted"
  | "verificationCanceled"
  | "verificationTimedOut"
  | "verificationReported"
  | "verificationRefunded"
  | "verificationReused"
  | "verificationReactivated"
  | "renewableActive"
  | "renewableOverdue"
  | "renewableExpired"
  | "renewableRefunded"
  | "nonrenewableActive"
  | "nonrenewableExpired"
  | "nonrenewableRefunded";

/**
 * Describes the structure of the main verification object.
 */
export type VerificationDetails = {
  number: string;
  sms: Link;
  calls: Link;
  createdAt: string; // ISO 8601 date-time string
  endsAt: string; // ISO 8601 date-time string
  id: string;
  cancel: {
    canCancel: boolean;
    link: Link;
  };
  reactivate: {
    canReactivate: boolean;
    link: Link;
  };
  report: {
    canReport: boolean;
    link: Link;
  };
  reuse: {
    link: Link;
    reusableUntil: string | null; // ISO 8601 date-time string or null
  };
  sale: Link;
  serviceName: string;
  state: VerificationState;
  totalCost: number;
};
