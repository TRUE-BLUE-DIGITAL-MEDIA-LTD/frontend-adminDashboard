export type TypeSmsReport =
  | "SMSPVA"
  | "SMSPOOL"
  | "SMSTEXTVERIFIED"
  | "SMSPINVERIFY"
  | "SMSDAISY";

export interface SmsReport {
  id: string;
  createAt: Date;
  updateAt: Date;
  sms_id: string;
  type: TypeSmsReport;
  userId: string;
  issue?: string;
}

export interface CreateSmsReportDto {
  type: TypeSmsReport;
  sms_id: string;
  issue?: string;
}

export interface UpdateSmsReportDto {
  type?: TypeSmsReport;
  sms_id?: string;
  issue?: string;
}

export interface PaginationDto {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDirection?: string;
}

export interface FindAllSmsReportDto extends PaginationDto {
  type?: TypeSmsReport;
  userId?: string;
  startDate: string;
  endDate: string;
}
