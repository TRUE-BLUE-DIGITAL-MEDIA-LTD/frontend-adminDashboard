export type Announcement = {
  id: string;
  createAt: string;
  updateAt: string;
  title: string;
  description: string;
  status: AnnouncementStatus;
  expireAt: string;
  beginAt: string;
};

export type AnnouncementStatus = "info" | "success" | "warning" | "error";
