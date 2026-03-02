import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 chars'),
  JWT_EXPIRES_IN: z.string().default('1d'),
});

export type EnvVars = z.infer<typeof envSchema>;
