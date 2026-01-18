
export interface Verse {
  number: number;
  text: string;
}

export interface Chapter {
  number: number;
  verses: Verse[];
}

export interface BibleBook {
  id: string;
  name: string;
  testament: 'Old' | 'New';
  chaptersCount: number;
  description?: string;
}

export interface SearchResult {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SEPIA = 'sepia'
}
