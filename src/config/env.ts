import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  PORT: z.coerce.number().default(8080),
  BOT_TOKEN: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  ADMIN_JWT_SECRET: z.string().min(32),
  WEB_APP_URL: z.string().url(),
  BOT_USERNAME: z.string().min(1),
  HOT_WALLET_MNEMONIC: z.string().min(1),
  TON_API_ENDPOINT: z.string().url(),
  TON_API_TOKEN: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  SUPPORT_LINK: z.string().url().optional(),
  NEWS_CHANNEL: z.string().optional(),
  FAQ_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
