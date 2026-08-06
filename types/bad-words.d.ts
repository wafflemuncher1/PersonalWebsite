declare module "bad-words" {
  export default class Filter {
    constructor(options?: { emptyList?: boolean; list?: string[]; placeHolder?: string });
    isProfane(text: string): boolean;
    clean(text: string): string;
    addWords(...words: string[]): void;
    removeWords(...words: string[]): void;
  }
}
