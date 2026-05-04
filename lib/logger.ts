export type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function isTruthyEnv(value: string | undefined): boolean {
  const v = value?.trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

function parseMinLevel(raw: string | undefined): LogLevel {
  const v = raw?.trim().toLowerCase();
  if (v === "info" || v === "warn" || v === "error") return v;
  return "debug";
}

/**
 * True when debug logging is enabled.
 * Server: set `DEBUG_LOG=true`
 * Client components: set `NEXT_PUBLIC_DEBUG_LOG=true` (and restart dev server).
 */
export function isDebugLogEnabled(): boolean {
  return isTruthyEnv(
    process.env.DEBUG_LOG ?? process.env.NEXT_PUBLIC_DEBUG_LOG,
  );
}

function getMinLevel(): LogLevel {
  return parseMinLevel(
    process.env.DEBUG_LOG_LEVEL ?? process.env.NEXT_PUBLIC_DEBUG_LOG_LEVEL,
  );
}

function shouldEmit(level: LogLevel): boolean {
  if (!isDebugLogEnabled()) return false;
  return LEVEL_ORDER[level] >= LEVEL_ORDER[getMinLevel()];
}

const CONSOLE: Record<LogLevel, (...args: unknown[]) => void> = {
  debug: (...a) => console.debug(...a),
  info: (...a) => console.info(...a),
  warn: (...a) => console.warn(...a),
  error: (...a) => console.error(...a),
};

export type ScopedLogger = {
  [K in LogLevel]: (...args: unknown[]) => void;
};

const noop: ScopedLogger = {
  debug() {},
  info() {},
  warn() {},
  error() {},
};

function makeScopedLogger(scope: string): ScopedLogger {
  const prefix = `[${scope}]`;
  return {
    debug: (...args: unknown[]) => {
      if (!shouldEmit("debug")) return;
      CONSOLE.debug(prefix, ...args);
    },
    info: (...args: unknown[]) => {
      if (!shouldEmit("info")) return;
      CONSOLE.info(prefix, ...args);
    },
    warn: (...args: unknown[]) => {
      if (!shouldEmit("warn")) return;
      CONSOLE.warn(prefix, ...args);
    },
    error: (...args: unknown[]) => {
      if (!shouldEmit("error")) return;
      CONSOLE.error(prefix, ...args);
    },
  };
}

const loggerCache = new Map<string, ScopedLogger>();

/**
 * Reusable scoped logger. No output unless `DEBUG_LOG` / `NEXT_PUBLIC_DEBUG_LOG` is truthy.
 *
 * Optional minimum level: `DEBUG_LOG_LEVEL` or `NEXT_PUBLIC_DEBUG_LOG_LEVEL`
 * (`debug` | `info` | `warn` | `error`) — only this level and above print.
 */
export function createLogger(scope: string): ScopedLogger {
  if (!isDebugLogEnabled()) {
    return noop;
  }
  let existing = loggerCache.get(scope);
  if (!existing) {
    existing = makeScopedLogger(scope);
    loggerCache.set(scope, existing);
  }
  return existing;
}
