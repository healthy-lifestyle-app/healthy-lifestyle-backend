import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 chars'),

  // AuthService.parseExpiresInToSeconds ile uyumlu: 30s / 15m / 2h / 7d
  JWT_EXPIRES_IN: z
    .string()
    .regex(/^\d+(s|m|h|d)$/i, 'JWT_EXPIRES_IN must match: 30s, 15m, 2h, 7d')
    .default('1d'),
});

export type EnvVars = z.infer<typeof envSchema>;
