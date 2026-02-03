export interface Candidate {
  id: string;
  name: string;
  party: string;
  symbol: string;
  color: string;
  photoUrl?: string;
}

export interface CenterResult {
  centerId: number;
  centerName: string;
  totalVoters: number;
  votes: Record<string, number>;
  invalidVotes: number; // নতুন যুক্ত করা হয়েছে
  isReported: boolean;
}

export interface Seat {
  id: string;
  name: string;
  candidates: Candidate[];
  centers: CenterResult[];
}

export interface AppState {
  seats: Seat[];
  selectedSeatId: string | null;
}