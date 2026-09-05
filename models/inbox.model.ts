export interface MailboxSummary {
  id: string;
  localPart: string;
  label: string | null;
  unreadCount: number;
  lastReceivedAt: string | null;
}

export interface InboxDomainGroup {
  domainId: string;
  domainName: string;
  mailboxes: MailboxSummary[];
}

export interface InboundEmailRow {
  id: string;
  createAt: string;
  fromAddress: string;
  fromName: string | null;
  subject: string | null;
  isRead: boolean;
  sizeBytes: number;
}

export interface InboundEmailAttachmentView {
  id: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  downloadUrl: string;
}

export interface InboundEmailDetail extends InboundEmailRow {
  toAddress: string;
  localPart: string;
  textBody: string | null;
  htmlBody: string | null;
  attachments: InboundEmailAttachmentView[];
}
