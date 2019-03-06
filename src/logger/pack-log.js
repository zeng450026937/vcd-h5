import archiver from 'archiver';
import { createWriteStream, ensureDir } from 'fs-extra';
import { resolve as resolvePath } from 'path';
import { getLogDirectoryPath, getNetLogDirectoryPath } from './get-log-path';
import { newPlainUUID } from '../utils/uuid';

export function packLog(filename = newPlainUUID(), format = 'tar', gzip = true) {
  const dir = getLogDirectoryPath();

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

      archive.directory(dir, '/', (entry) => (/.log/.test(entry.name) ? entry : false));

      archive.finalize();
    }));
}

export function packNetlog(filename = newPlainUUID(), format = 'tar', gzip = true) {
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

      archive.directory(dir, '/', (entry) => (/.json/.test(entry.name) ? entry : false));

      archive.finalize();
    }));
}
