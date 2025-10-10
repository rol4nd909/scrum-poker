import type { Participant } from './participant.model';

export interface Room {
  id: string;
  participants: Participant[];
  revealed: boolean;
}
