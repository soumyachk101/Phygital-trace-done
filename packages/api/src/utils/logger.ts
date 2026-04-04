type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const colors: Record<LogLevel, string> = {
  info: '\x1b[32m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  debug: '\x1b[36m',
};

const reset = '\x1b[0m';

const log = (level: LogLevel, message: string, meta?: unknown) => {
  const ts = new Date().toISOString();
  const prefix = `${colors[level]}[${level.toUpperCase()}]${reset} ${ts}`;
  if (meta !== undefined) {
    console[level === 'error' ? 'error' : 'log'](`${prefix} ${message}`, JSON.stringify(meta));
  } else {
    console[level === 'error' ? 'error' : 'log'](`${prefix} ${message}`);
  }
};

export const logger = {
  info: (msg: string, meta?: unknown) => log('info', msg, meta),
  warn: (msg: string, meta?: unknown) => log('warn', msg, meta),
  error: (msg: string, meta?: unknown) => log('error', msg, meta),
  debug: (msg: string, meta?: unknown) => log('debug', msg, meta),
};
