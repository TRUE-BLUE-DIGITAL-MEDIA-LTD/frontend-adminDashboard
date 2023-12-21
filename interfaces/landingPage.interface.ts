export interface LandingPage {
  id: string;
  createAt: string;
  updateAt: string;
  name: string;
  title: string;
  description: string;
  backgroundImage: string;
  icon: string | null;
  googleAnalyticsId: string | null;
  language: string;
  html: string;
  json: string;
  viewCount: number | null;
  mainButton: string;
  backClick: number | null;
  popUpUnder: string;
  percent: number;
  creatorId: string;
  domainId: string | null;
}
