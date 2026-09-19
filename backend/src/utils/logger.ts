/* Structured logger. Never log passwords, JWT secrets, OTP values or raw tokens. */
type LogMeta = Record<string, unknown> | undefined;

function timestamp(): string {
  return new Date().toISOString();
}

function write(level: string, message: string, meta?: LogMeta): void {
  if (process.env.NODE_ENV === "test") return;

  const line = { timestamp: timestamp(), level, message, ...(meta ? { meta } : {}) };
  if (level === "error") {
    console.error(JSON.stringify(line));
  } else {
    console.log(JSON.stringify(line));
  }
}

export const logger = {
  info: (message: string, meta?: LogMeta) => write("info", message, meta),
  warn: (message: string, meta?: LogMeta) => write("warn", message, meta),
  error: (message: string, error?: unknown) =>
    write("error", message, error instanceof Error ? { error: error.message, stack: error.stack } : { error }),
  http: (message: string, meta?: LogMeta) => write("http", message, meta),
};
