export interface Product {
  id: string;
  name: string;
  icon: string;
  shortDescription: string;
  voiceoverText: string;
  audioFile: string | null;
  url: string;
  tweetUrl?: string | null;
  username?: string | null;
  dateAdded: string;
}

export interface ProductInput {
  id?: string;
  name?: string;
  icon?: string;
  shortDescription?: string;
  voiceoverText?: string;
  audioFile?: string | null;
  url?: string;
  tweetUrl?: string | null;
  username?: string | null;
}
