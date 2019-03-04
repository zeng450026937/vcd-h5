import archiver from 'archiver';
import fs from 'fs-extra';
import path from 'path';
import { getLogDirectoryPath } from '../logger/get-log-path';


export default class LogProvider {
  constructor() {
    this.logDirectory = getLogDirectoryPath();
  }

  async provideLogFile(file) {
    if (!file) return null;

    await this.zipFile(file.fileName);

    return fs.createReadStream(path.join(this.logDirectory, `/${file.fileName}.zip`));
  }

  async getTodayLogFile() {
    const logFiles = await this.readLogfileList();

    return logFiles.find((file) => this.isToday(file.logDate));
  }

  async provideTodayLog() {
    const todayLogFile = await this.getTodayLogFile();
    const logfileStream = await this.provideLogFile(todayLogFile);

    return {
      directory : this.logDirectory,
      fileInfo  : {
        ...todayLogFile,
        path : logfileStream.path,
      },

    };
  }

  removeZipFile(fileName) {
    fs.remove(path.join(this.logDirectory, `/${fileName}`));
    console.log('remove *.zip file:', path.join(this.logDirectory, `/${fileName}`));
  }

  zipFile(fileName) {
    return new Promise((resolve) => {
      const archive = archiver('zip', {
        zlib : { level: 9 },
      });

      const output = fs.createWriteStream(path.join(this.logDirectory, `/${fileName}.zip`));

      output.on('close', () => {
        console.log(`${archive.pointer()} total bytes`);
        resolve();
      });

      archive.pipe(output);

      archive.append(
        fs.createReadStream(path.join(this.logDirectory, `/${fileName}`)),
        { name: fileName },
      );

      archive.finalize();
    });
  }

  genLogFilesJson(logFiles) {
    return logFiles.map((fileName) => ({
      fileName,
      isReported : false,
      reportDate : null,
      logDate    : new Date(`${fileName.split('.')[1]} 00:00`).valueOf(),
    }));
  }

  readLogfileList() {
    return new Promise((resolve, reject) => {
      try {
        fs.readdir(this.logDirectory, (err, files) => {
          if (err) return reject(err);

          const logFiles = files.filter((file) => path.extname(file) === '.log');

          console.log('log file list is:', logFiles);
          resolve(this.genLogFilesJson(logFiles));
        });
      }
      catch (e) {
        console.log('Failed to read record file list', e);
        resolve([]);
      }
    });
  }

  isToday(date) {
    return new Date() - new Date(date).valueOf() < 86400000;
  }
}
