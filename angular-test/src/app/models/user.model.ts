export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  rewardsPoints: number;
  memberSince: Date;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface RewardsTransaction {
  id: number;
  userId: number;
  points: number;
  type: 'earned' | 'redeemed';
  description: string;
  date: Date;
  orderId?: number;
}
