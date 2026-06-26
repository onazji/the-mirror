export type WorkLog = {
  app: boolean;
  game: boolean;
  output: boolean;
  creative?: boolean;
  physical?: boolean;
  customActivity?: string;
  sessions: 1 | 2 | 3;
  note: string;
};
