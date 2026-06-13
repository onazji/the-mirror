export type WorkLog = {
  app: boolean;
  game: boolean;
  output: boolean;
  creative?: boolean;
  physical?: boolean;
  sessions: 1 | 2 | 3;
  note: string;
};
