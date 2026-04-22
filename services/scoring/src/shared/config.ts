import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRY_SECONDS: z.coerce.number().min(60).default(3600),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
});

export type EnvironmentConfig = z.infer<typeof envSchema>;

let config: EnvironmentConfig | null = null;

export function loadConfig(): EnvironmentConfig {
  if (config) return config;

  config = envSchema.parse({
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-change-in-production-min-32-chars',
    JWT_EXPIRY_SECONDS: process.env.JWT_EXPIRY_SECONDS,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
  });

  return config;
}

export function getConfig(): EnvironmentConfig {
  if (!config) return loadConfig();
  return config;
}
