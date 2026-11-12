export interface Tracker {
  id: string;
  repositoryId: string;
  name: string;
  prefix: string;
  color: string;
  isActive: boolean;
  displayOrder: number;
  nextSequence: number;
}
export interface TrackerInput {
  name: string;
  prefix: string;
  color: string;
  displayOrder: number;
}
