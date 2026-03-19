// === Auth ===
export interface AuthResponse {
  token: string;
  user: User;
  isNew: boolean;
}

// === User ===
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
}

// === Fishing ===
export interface FishingStatus {
  isFishing: boolean;
  fishingStartedAt: string | null;
  tankCoins: number;
  tankCapacity: number;
  miningRate: number;
  effectiveMiningRate: number;
  isComplete: boolean;
  elapsedSeconds: number;
  fishingDurationSeconds: number;
}

export interface CollectResult {
  coinsCollected: number;
  newBalance: number;
  autoRestarted: boolean;
}

// === Cards ===
export type CardName = 'COIN_CAPACITY' | 'MINING_RATE';

export interface CardInfo {
  cardName: CardName;
  currentLevel: number;
  currentValue: number;
  nextLevel: number | null;
  nextValue: number | null;
  upgradeCost: number | null;
  canUpgrade: boolean;
  requirements: CardRequirement[];
}

export interface CardRequirement {
  description: string;
  requirementType: string;
  requirementValue: string;
  met: boolean;
}

export interface UpgradeResult {
  newLevel: number;
  newValue: number;
  newUserLevel: number;
}

// === Boosters ===
export type BoosterType = 'MINING_BOOST_1_5X' | 'AUTO_MINING';

export interface BoosterInfo {
  type: BoosterType;
  name: string;
  description: string;
  costStars: number;
  durationMinutes: number;
  isActive: boolean;
  expiresAt: string | null;
}

// === Spin ===
export type SpinTier = 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4' | 'TIER_5';

export interface SpinTierInfo {
  tier: SpinTier;
  name: string;
  costStars: number;
  prizes: SpinPrize[];
}

export interface SpinPrize {
  type: 'coins' | 'stars' | 'gift';
  value: number;
  weight: number;
  label?: string;
}

export interface SpinResult {
  results: SpinPrize[];
  totalCoinsWon: number;
  totalStarsWon: number;
}

export interface LiveWin {
  id: number;
  username: string;
  prizeType: string;
  prizeValue: number;
  game: string;
  createdAt: string;
}

// === Roulette ===
export interface RoulettePrize {
  type: string;
  value: number;
  weight: number;
  label: string;
}

export interface RouletteResult {
  prize: RoulettePrize;
  coinsWon: number;
  starsWon: number;
}

// === Bruno's Ride ===
export interface RideSession {
  sessionId: string;
  startTime: string;
  expiresAt: string;
}

export interface RideClaimResult {
  coinsEarned: number;
  newBalance: number;
  score: number;
}

// === Daily Combo ===
export interface DailyComboStatus {
  items: ComboItem[];
  alreadyAttempted: boolean;
  lastResult: number | null;
  resetsAt: string;
}

export interface ComboItem {
  id: number;
  name: string;
  icon: string;
}

export interface ComboSubmitResult {
  correctCount: number;
  reward: number;
  correctAnswer: number[];
}

// === Daily Activity ===
export interface DailyActivityStatus {
  currentStreak: number;
  canClaim: boolean;
  todayReward: number;
  rewards: DayReward[];
  resetsAt: string;
}

export interface DayReward {
  day: number;
  reward: number;
  claimed: boolean;
  isToday: boolean;
}

export interface DailyClaimResult {
  reward: number;
  newStreak: number;
  newBalance: number;
}

// === Tasks ===
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
  isCompleted: boolean;
  progress?: number;
}

export interface TaskCheckResult {
  completed: boolean;
  reward: number;
  error?: string;
}

// === Friends ===
export interface FriendsStats {
  totalReferrals: number;
  referralEarnings: number;
}

export interface ReferralInfo {
  id: number;
  username: string;
  firstName: string;
  level: number;
  createdAt: string;
}

export interface RewardTier {
  level: number;
  reward: number;
}

// === Withdrawals ===
export type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface WithdrawalInfo {
  coinToTonRate: number;
  minimumCoinWithdrawal: number;
  maximumCoinWithdrawal: number;
  withdrawalFeeTon: number;
  balance: number;
}

export interface Withdrawal {
  id: number;
  amountCoins: number;
  amountTon: number;
  targetAddress: string;
  status: WithdrawalStatus;
  txHash: string | null;
  createdAt: string;
}

// === Stars ===
export interface StarsBalance {
  starsBalance: number;
  topUpOptions: TopUpOption[];
}

export interface TopUpOption {
  amountTon: number;
  baseStars: number;
  bonusStars: number;
  totalStars: number;
}

// === Tournaments ===
export interface Tournament {
  id: number;
  name: string;
  description: string;
  startAt: string;
  endAt: string;
  isActive: boolean;
  rewards: Record<string, number>;
  timeRemainingMs: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  firstName: string;
  starsSpent: number;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  total: number;
  userRank: number | null;
  userStarsSpent: number | null;
}

// === Paginated ===
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

// === App Info ===
export interface AppInfo {
  supportUrl: string;
  communityUrl: string;
  version: string;
}
