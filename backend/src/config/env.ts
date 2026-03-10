import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  JWT_SECRET_KEY: z.string().min(1),
  ORACLE_USER: z.string().optional(),
  ORACLE_PASSWORD: z.string().optional(),
  ORACLE_CONNECT_STRING: z.string().optional(),
  ORACLE_HOST: z.string().optional(),
  ORACLE_PORT: z.coerce.number().optional(),
  ORACLE_SERVICE_NAME: z.string().optional(),
  ORACLE_POOL_MIN: z.coerce.number().default(1),
  ORACLE_POOL_MAX: z.coerce.number().default(10),
  ORACLE_POOL_INCREMENT: z.coerce.number().default(1),
  ORACLE_POOL_ALIAS: z.string().default("sgqPool"),
  ORACLE_STMT_CACHE_SIZE: z.coerce.number().default(30),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  UPLOAD_MAX_FILES: z.coerce.number().default(10),
  UPLOAD_MAX_FILE_SIZE_MB: z.coerce.number().default(25),
  AUTH_STATIC_PASSWORD: z.string().default("123456"),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);

export function hasOracleConfig(): boolean {
  return Boolean(env.ORACLE_USER && env.ORACLE_PASSWORD && (env.ORACLE_CONNECT_STRING || (env.ORACLE_HOST && env.ORACLE_PORT && env.ORACLE_SERVICE_NAME)));
}

export function getOracleConnectString(): string {
  if (env.ORACLE_CONNECT_STRING) return env.ORACLE_CONNECT_STRING;
  return `${env.ORACLE_HOST}:${env.ORACLE_PORT}/${env.ORACLE_SERVICE_NAME}`;
}
