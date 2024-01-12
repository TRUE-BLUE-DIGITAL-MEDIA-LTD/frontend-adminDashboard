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
  language: Language;
  html: string;
  json: string;
  viewCount: number | null;
  mainButton: string;
  backClick: number | null;
  popUpUnder: string;
  percent: number;
  categoryId: string | null;
  creatorId: string;
  domainId: string | null;
}

export type Language = "en" | "es" | "fr" | "de";
