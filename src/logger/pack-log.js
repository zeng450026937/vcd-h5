import archiver from 'archiver';
import { createWriteStream, ensureDir, copy } from 'fs-extra';
import { resolve as resolvePath } from 'path';
import { getLogDirectoryPath, getNetLogDirectoryPath } from './get-log-path';
import { newPlainUUID } from '../shared/uuid';

export function packLog(filename = newPlainUUID(), format = 'zip', gzip = false) {
  const dir = getLogDirectoryPath();
  const copyDir = resolvePath(dir, '../logs-backup');

  return ensureDir(dir)
    .then(() => copy(dir, copyDir))
    .then(() => new Promise((resolve, reject) => {
      const name = `${filename}.${format}${gzip ? '.gz' : ''}`;
      const path = resolvePath(copyDir, name);
      const output = createWriteStream(path);

      const archive = archiver(format, {
        zlib : { level: 9 }, // Sets the compression level.
        gzip,
      });

      archive.on('error', reject);
      archive.on('end', () => resolve(path));

      archive.pipe(output);

      archive.directory(copyDir, '/', (entry) => (/\.log/.test(entry.name) ? entry : false));

      archive.finalize();
    }));
}

export function packNetlog(filename = newPlainUUID(), format = 'zip', gzip = false) {
  const dir = getNetLogDirectoryPath();

  return ensureDir(dir)
    .then(() => new Promise((resolve, reject) => {
      const name = `${filename}.${format}${gzip ? '.gz' : ''}`;
      const path = resolvePath(dir, name);
      const output = createWriteStream(path);

      const archive = archiver(format, {
        zlib : { level: 9 }, // Sets the compression level.
        gzip,
      });

      archive.on('error', reject);
      archive.on('end', () => resolve(path));

      archive.pipe(output);

      archive.directory(dir, '/', (entry) => (/\.json/.test(entry.name) ? entry : false));

      archive.finalize();
    }));
}
