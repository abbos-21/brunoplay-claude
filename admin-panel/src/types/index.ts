export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR';

export interface Admin {
  id: number;
  username: string;
  role: AdminRole;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  admin: Admin;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface User {
  id: number;
  telegramId: string;
  username: string;
  firstName: string;
  lastName: string;
  language: 'EN' | 'RU';
  isBlocked: boolean;
  coins: number;
  totalCoinsEarned: number;
  starsBalance: number;
  level: number;
  coinCapacityLevel: number;
  miningRateLevel: number;
  isFishing: boolean;
  fishingStartedAt: string | null;
  tankCoins: number;
  tankCapacity: number;
  miningRate: number;
  lastLoginDate: string | null;
  loginStreak: number;
  lastComboDate: string | null;
  lastComboResult: number | null;
  referredById: number | null;
  referralEarnings: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    referrals: number;
  };
}

export type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Withdrawal {
  id: number;
  userId: number;
  amountCoins: number;
  amountTon: number;
  targetAddress: string;
  status: WithdrawalStatus;
  txHash: string | null;
  errorMessage: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface WithdrawalStats {
  totalPending: number;
  totalPendingAmount: number;
  totalCompleted: number;
  totalCompletedAmount: number;
  totalFailed: number;
  todayCount: number;
  todayAmount: number;
}

export type TaskCategory = 'MAIN' | 'OTHER';
export type TaskType = 'CHANNEL_JOIN' | 'INVITE_FRIENDS';

export interface Task {
  id: number;
  category: TaskCategory;
  type: TaskType;
  title: string;
  description: string;
  channelUsername: string | null;
  requiredInvites: number | null;
  rewardCoins: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    completions: number;
  };
}

export interface DailyCombo {
  id: number;
  date: string;
  correctItems: number[];
  createdAt: string;
}

export interface Tournament {
  id: number;
  name: string;
  description: string;
  startAt: string;
  endAt: string;
  isActive: boolean;
  rewards: Record<string, number>;
  createdAt: string;
  updatedAt: string;
  _count?: {
    entries: number;
  };
}

export interface Season {
  id: number;
  name: string;
  start: string;
  end: string;
}

export interface CardRequirement {
  id: number;
  cardName: 'COIN_CAPACITY' | 'MINING_RATE';
  level: number;
  description: string;
  requirementType: string;
  requirementValue: string;
}

export interface AuditLogEntry {
  id: number;
  adminId: number;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, unknown> | null;
  ip: string;
  createdAt: string;
  admin?: {
    username: string;
    role: AdminRole;
  };
}

export interface UserAction {
  id: number;
  userId: number;
  type: string;
  ip: string;
  time: string;
  data: Record<string, unknown>;
}

export interface OverviewAnalytics {
  totalUsers: number;
  activeUsersToday: number;
  activeUsersWeek: number;
  newUsersToday: number;
  newUsersWeek: number;
  totalCoinsInCirculation: number;
  totalCoinsEverEarned: number;
  totalWithdrawalsCompleted: number;
  totalWithdrawalsTon: number;
  totalStarsInCirculation: number;
}

export interface RegistrationAnalytics {
  daily: { date: string; count: number }[];
  total: number;
}

export interface EconomyAnalytics {
  totalCoinsInCirculation: number;
  totalCoinsEverEarned: number;
  totalWithdrawnCoins: number;
  totalWithdrawnTon: number;
  dailyEarnings: { date: string; amount: number }[];
}

export interface GamesAnalytics {
  spin: { totalPlayed: number; totalStarsSpent: number };
  roulette: { totalPlayed: number; totalStarsSpent: number };
  brunosRide: { totalPlayed: number; totalStarsSpent: number; cheatersDetected: number };
  totalStarsRevenue: number;
}

export interface ReferralAnalytics {
  totalReferrals: number;
  totalReferralRewardsPaid: number;
  topReferrers: { userId: number; username: string; count: number }[];
}

export interface GameSettings {
  fishingDurationSeconds: number;
  coinToTonRate: number;
  minimumCoinWithdrawal: number;
  maximumCoinWithdrawal: number;
  withdrawalFeeTon: number;
  rouletteCostStars: number;
  rideCostStars: number;
  rideMaxCoinsPerSecond: number;
  tonToStarsRate: number;
  tonToStarsBonusPercent: number;
  cardUpgradeValues: Record<string, number[]>;
  boosterPrices: Record<string, number>;
  spinTiers: SpinTier[];
  roulettePrizes: RoulettePrize[];
  comboRewards: Record<string, number>;
  loginStreakRewards: Record<string, number>;
  referralRewards: Record<string, number>;
}

export interface SpinTier {
  name: string;
  costStars: number;
  prizes: { type: string; value: number; weight: number }[];
}

export interface RoulettePrize {
  type: string;
  value: number;
  weight: number;
  label: string;
}
