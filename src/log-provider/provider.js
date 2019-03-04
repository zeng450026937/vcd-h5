import archiver from 'archiver';
import fs from 'fs-extra';
import path from 'path';
import { gzip } from 'zlib';
import { getLogDirectoryPath } from '../logger/get-log-path';


export default class LogProvider {
  constructor() {
    this.logDirectory = getLogDirectoryPath();
  }

  async provideLogFile(file) {
    if (!file) return null;

    return this.zipFile(file.fileName);
  }

  async getTodayLogFile() {
    const logFiles = await this.readLogfileList();

    return logFiles.find((file) => this.isToday(file.logDate));
  }

  async provideTodayLog() {
    const todayLogFile = await this.getTodayLogFile();

    return {
      directory : this.logDirectory,
      fileInfo  : {
        ...todayLogFile,
      },

    };
  }

  removeZipFile(fileName) {
    fs.remove(path.join(this.logDirectory, `/${fileName}`));
    console.log('remove *.zip file:', path.join(this.logDirectory, `/${fileName}`));
  }

  zipFile(fileName) {
    return new Promise(async(resolve, reject) => {
      const input = await fs.readFile(path.join(this.logDirectory, `/${fileName}`));

      gzip(input, (error, buffer) => {
        if (error) return reject(error);
        resolve(buffer);
      });
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
