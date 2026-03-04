import pino from 'pino';
import path from 'path';
import fs from 'fs-extra';

const logDir = path.join(process.cwd(), 'logs');
fs.ensureDirSync(logDir);

const transport = pino.transport({
  targets: [
    {
      level: 'info',
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    },
    {
      level: 'debug',
      target: 'pino/file',
      options: {
        destination: path.join(logDir, 'app.log'),
      },
    },
    {
      level: 'error',
      target: 'pino/file',
      options: {
        destination: path.join(logDir, 'error.log'),
      },
    },
  ],
});

export const logger = pino(transport);