export interface MailTmDomain {
  id: string;
  domain: string;
  isActive: boolean;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MailTmAccount {
  id: string;
  address: string;
  quota: number;
  used: number;
  isDisabled: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MailTmTokenResponse {
  id: string;
  token: string;
}

export interface MailTmUserRef {
  address: string;
  name: string;
}

export interface MailTmMiniMessage {
  id: string;
  accountId: string;
  msgid: string;
  from: MailTmUserRef;
  to: MailTmUserRef[];
  subject: string;
  intro: string;
  seen: boolean;
  isDeleted: boolean;
  hasAttachments: boolean;
  size: number;
  downloadUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface MailTmAttachment {
  id: string;
  filename: string;
  contentType: string;
  disposition: string;
  transferEncoding: string;
  related: boolean;
  size: number;
  downloadUrl: string;
}

export interface MailTmFullMessage extends MailTmMiniMessage {
  text: string;
  html: string[];
  attachments: MailTmAttachment[];
}

export interface MailboxSession {
  sessionId: string;
  address: string;
  token: string;
  accountId: string;
  createdAt: string;
}
