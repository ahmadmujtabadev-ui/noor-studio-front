export type PageType = "text" | "image" | "mixed" | "blank" | "title" | "copyright";

export interface PageBlock {
  type?: string;
  content?: string;
  imageUrl?: string;
}

export interface PageLayoutItem {
  pageNumber: number;
  type: PageType;
  position?: "left" | "right";
  chapterNumber?: number;
  chapterTitle?: string;
  blocks: PageBlock[];
}

export interface SpreadLayoutItem {
  id?: string;
  leftPage: PageLayoutItem;
  rightPage: PageLayoutItem;
}

export interface LayoutArtifactContent {
  pageCount: number;
  spreads: SpreadLayoutItem[];
  settings: {
    trimSize?: string;
    [key: string]: unknown;
  };
}
