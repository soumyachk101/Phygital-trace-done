"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const colors = {
    info: '\x1b[32m',
    warn: '\x1b[33m',
    error: '\x1b[31m',
    debug: '\x1b[36m',
};
const reset = '\x1b[0m';
const log = (level, message, meta) => {
    const ts = new Date().toISOString();
    const prefix = `${colors[level]}[${level.toUpperCase()}]${reset} ${ts}`;
    if (meta !== undefined) {
        console[level === 'error' ? 'error' : 'log'](`${prefix} ${message}`, JSON.stringify(meta));
    }
    else {
        console[level === 'error' ? 'error' : 'log'](`${prefix} ${message}`);
    }
};
exports.logger = {
    info: (msg, meta) => log('info', msg, meta),
    warn: (msg, meta) => log('warn', msg, meta),
    error: (msg, meta) => log('error', msg, meta),
    debug: (msg, meta) => log('debug', msg, meta),
};
