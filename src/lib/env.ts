import { z } from 'zod';

/**
 * Environment variable validation schema
 * This ensures all required env variables are present at build/runtime
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // JWT Secrets
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Optional
  PORT: z.string().optional().default('3000'),
  VERCEL_URL: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates and parses environment variables
 * Throws an error if required variables are missing or invalid
 */
function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    parsed.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    });
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
}

// Export validated env (will throw if invalid)
export const env = validateEnv();

/**
 * Type-safe environment variable getter
 * Use this instead of process.env for type safety
 */
export function getEnv<K extends keyof Env>(key: K): Env[K] {
  return env[key];
}
