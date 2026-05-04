export interface ScoreData {
  title: string;
  description: string;
  value: number | null;
  prefix?: string | null;
}

export type InvestorJourneyItem = {
  title: string;
  description: string;
  date: string;
  color: 'blue' | 'green' | 'red';
};