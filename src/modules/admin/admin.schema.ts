import { z } from 'zod';

// ─── ADMIN AUTH ───

export const loginSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(128),
});

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(8).max(128),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'MODERATOR']).default('ADMIN'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
});

// ─── USER MANAGEMENT ───

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'coins', 'level', 'totalCoinsEarned']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  isBlocked: z
    .string()
    .optional()
    .transform((v) => (v === 'true' ? true : v === 'false' ? false : undefined)),
  level: z.coerce.number().int().min(1).max(13).optional(),
});

export const userIdParamSchema = z.object({
  userId: z.coerce.number().int().positive(),
});

export const adjustCoinsSchema = z.object({
  amount: z.number(),
  reason: z.string().min(1).max(500),
});

export const adjustStarsSchema = z.object({
  amount: z.number().int(),
  reason: z.string().min(1).max(500),
});

export const userActionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.string().optional(),
});

// ─── SETTINGS ───

export const updateSettingsSchema = z
  .object({
    fishingDurationSeconds: z.number().int().positive().optional(),
    rouletteCostStars: z.number().int().nonnegative().optional(),
    rideCostStars: z.number().int().nonnegative().optional(),
    rideMaxCoinsPerSecond: z.number().int().positive().optional(),
    coinToTonRate: z.number().int().positive().optional(),
    minimumCoinWithdrawal: z.number().int().positive().optional(),
    maximumCoinWithdrawal: z.number().int().positive().optional(),
    withdrawalFeeTon: z.number().nonnegative().optional(),
    tonToStarsRate: z.number().positive().optional(),
    tonToStarsBonusPercent: z.number().int().min(0).max(100).optional(),
  })
  .strict();

export const updateCardValuesSchema = z.object({
  cardUpgradeValues: z.record(
    z.enum(['COIN_CAPACITY', 'MINING_RATE']),
    z.array(z.number().nonnegative()).length(13),
  ),
});

export const updateReferralRewardsSchema = z.object({
  referralRewards: z.record(z.string(), z.number().nonnegative()),
});

export const updateSpinTiersSchema = z.object({
  spinTiers: z.array(
    z.object({
      tier: z.enum(['TIER_1', 'TIER_2', 'TIER_3', 'TIER_4', 'TIER_5']),
      costStars: z.number().int().nonnegative(),
      spinsCount: z.number().int().positive(),
      prizes: z.array(
        z.object({
          type: z.string(),
          value: z.number(),
          weight: z.number().positive(),
        }),
      ),
    }),
  ),
});

export const updateRouletteSchema = z.object({
  rouletteCostStars: z.number().int().nonnegative(),
  roulettePrizes: z.array(
    z.object({
      type: z.string(),
      value: z.number(),
      weight: z.number().positive(),
      label: z.string().optional(),
    }),
  ),
});

export const updateEconomySchema = z
  .object({
    coinToTonRate: z.number().int().positive().optional(),
    minimumCoinWithdrawal: z.number().int().positive().optional(),
    maximumCoinWithdrawal: z.number().int().positive().optional(),
    withdrawalFeeTon: z.number().nonnegative().optional(),
    tonToStarsRate: z.number().positive().optional(),
    tonToStarsBonusPercent: z.number().int().min(0).max(100).optional(),
  })
  .strict();

export const updateBoostersSchema = z.object({
  boosterPrices: z.record(z.enum(['MINING_BOOST_1_5X', 'AUTO_MINING']), z.number().int().nonnegative()),
});

export const updateComboRewardsSchema = z.object({
  comboRewards: z.record(z.string(), z.number().nonnegative()),
});

export const updateLoginStreakRewardsSchema = z.object({
  loginStreakRewards: z.record(z.string(), z.number().nonnegative()),
});

// ─── WITHDRAWALS ───

export const listWithdrawalsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
  userId: z.coerce.number().int().positive().optional(),
  sortBy: z.enum(['createdAt', 'amountCoins', 'amountTon']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const withdrawalIdParamSchema = z.object({
  withdrawalId: z.coerce.number().int().positive(),
});

export const rejectWithdrawalSchema = z.object({
  reason: z.string().min(1).max(500),
});

// ─── TASKS ───

export const createTaskSchema = z.object({
  category: z.enum(['MAIN', 'OTHER']),
  type: z.enum(['CHANNEL_JOIN', 'INVITE_FRIENDS']),
  title: z.string().min(1).max(200),
  description: z.string().max(500).default(''),
  channelUsername: z.string().optional(),
  requiredInvites: z.number().int().positive().optional(),
  rewardCoins: z.number().int().nonnegative(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const updateTaskSchema = z
  .object({
    category: z.enum(['MAIN', 'OTHER']).optional(),
    type: z.enum(['CHANNEL_JOIN', 'INVITE_FRIENDS']).optional(),
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(500).optional(),
    channelUsername: z.string().nullable().optional(),
    requiredInvites: z.number().int().positive().nullable().optional(),
    rewardCoins: z.number().int().nonnegative().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  })
  .strict();

export const taskIdParamSchema = z.object({
  taskId: z.coerce.number().int().positive(),
});

// ─── DAILY COMBO ───

export const createDailyComboSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  correctItems: z.array(z.number().int().min(1).max(8)).length(4),
});

export const bulkCreateDailyComboSchema = z.object({
  combos: z
    .array(
      z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
        correctItems: z.array(z.number().int().min(1).max(8)).length(4),
      }),
    )
    .min(1)
    .max(90),
});

// ─── TOURNAMENTS ───

export const createTournamentSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).default(''),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  rewards: z.record(z.string(), z.number().nonnegative()),
  isActive: z.boolean().default(true),
});

export const updateTournamentSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().max(500).optional(),
    startAt: z.string().datetime().optional(),
    endAt: z.string().datetime().optional(),
    rewards: z.record(z.string(), z.number().nonnegative()).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const tournamentIdParamSchema = z.object({
  tournamentId: z.coerce.number().int().positive(),
});

// ─── CARD REQUIREMENTS ───

export const createCardRequirementSchema = z.object({
  cardName: z.enum(['COIN_CAPACITY', 'MINING_RATE']),
  level: z.number().int().min(1).max(13),
  description: z.string().min(1).max(500),
  requirementType: z.string().min(1).max(100),
  requirementValue: z.string().min(1).max(500),
});

export const updateCardRequirementSchema = z
  .object({
    description: z.string().min(1).max(500).optional(),
    requirementType: z.string().min(1).max(100).optional(),
    requirementValue: z.string().min(1).max(500).optional(),
  })
  .strict();

export const cardRequirementIdParamSchema = z.object({
  requirementId: z.coerce.number().int().positive(),
});

// ─── BROADCAST ───

export const broadcastMessageSchema = z.object({
  text: z.string().min(1).max(4096),
  parseMode: z.enum(['HTML', 'Markdown', 'MarkdownV2']).optional(),
});

// ─── AUDIT LOG ───

export const auditLogQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  adminId: z.coerce.number().int().positive().optional(),
  action: z.string().optional(),
  targetType: z.string().optional(),
  targetId: z.string().optional(),
});

// ─── SEASONS ───

export const createSeasonSchema = z.object({
  name: z.string().min(1),
  start: z.string(),
  end: z.string(),
});

export const updateSeasonSchema = createSeasonSchema.partial();

// ─── TYPE EXPORTS ───

export type LoginBody = z.infer<typeof loginSchema>;
export type RegisterBody = z.infer<typeof registerSchema>;
export type ChangePasswordBody = z.infer<typeof changePasswordSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type AdjustCoinsBody = z.infer<typeof adjustCoinsSchema>;
export type AdjustStarsBody = z.infer<typeof adjustStarsSchema>;
export type UserActionsQuery = z.infer<typeof userActionsQuerySchema>;
export type ListWithdrawalsQuery = z.infer<typeof listWithdrawalsQuerySchema>;
export type WithdrawalIdParam = z.infer<typeof withdrawalIdParamSchema>;
export type RejectWithdrawalBody = z.infer<typeof rejectWithdrawalSchema>;
export type CreateTaskBody = z.infer<typeof createTaskSchema>;
export type UpdateTaskBody = z.infer<typeof updateTaskSchema>;
export type TaskIdParam = z.infer<typeof taskIdParamSchema>;
export type CreateDailyComboBody = z.infer<typeof createDailyComboSchema>;
export type BulkCreateDailyComboBody = z.infer<typeof bulkCreateDailyComboSchema>;
export type CreateTournamentBody = z.infer<typeof createTournamentSchema>;
export type UpdateTournamentBody = z.infer<typeof updateTournamentSchema>;
export type TournamentIdParam = z.infer<typeof tournamentIdParamSchema>;
export type CreateCardRequirementBody = z.infer<typeof createCardRequirementSchema>;
export type UpdateCardRequirementBody = z.infer<typeof updateCardRequirementSchema>;
export type CardRequirementIdParam = z.infer<typeof cardRequirementIdParamSchema>;
export type BroadcastMessageBody = z.infer<typeof broadcastMessageSchema>;
export type AuditLogQuery = z.infer<typeof auditLogQuerySchema>;
