import fs from 'fs-extra';
import path from 'path';
import archiver from 'archiver';
import FormData from 'form-data';
import { getSystemInfo } from '../utils/systemInfo';
import { uploadLog } from '../api-service/api/fileUpload';
import { getLogDirectoryPath } from '../logger/get-log-path';


const RECORD_FILE_NAME = 'report-record.json';

const isToday = (date) => new Date() - new Date(date).valueOf() < 86400000;

export default class logReporter {
  constructor() {
    this.setClientId();
    this.logDirectory = getLogDirectoryPath();
    this.checkRecordFile();
  }

  report() {
    const reportList = this.record.reportRecord.filter((file) => !file.isReported && !isToday(file.logDate));

    reportList.forEach(async(file) => {
      try {
        await this.zipFile(file.fileName);
        await this.startReport(file.fileName);
        this.record.reportRecord.forEach((item) => {
          if (file.fileName === item.fileName) {
            item.isReported = true;
            item.reportDate = new Date().valueOf();
          }
        });

        await this.writeRecordFile(this.record);
      }
      catch (e) {
        console.log(e);
      }
    });
  }

  setClientId() {
    getSystemInfo().then((systemInfo) => {
      this.clientId = systemInfo.clientId;
    });
  }

  startReport(fileName) {
    const form = new FormData();

    form.append('file', fs.createReadStream(path.join(this.logDirectory, `/${fileName}.zip`)));

    return uploadLog(this.clientId, form, { headers: form.getHeaders() });
  }

  removeZipFile(file) {
    fs.remove(path.join(this.logDirectory, `/${file}`));
  }

  zipFile(file) {
    return new Promise((resolve, reject) => {
      const archive = archiver('zip', {
        zlib : { level: 9 },
      });

      const output = fs.createWriteStream(path.join(this.logDirectory, `/${file}.zip`));

      output.on('close', () => {
        console.log(`${archive.pointer()} total bytes`);
        resolve();
      });

      archive.pipe(output);

      archive.append(
        fs.createReadStream(path.join(this.logDirectory, `/${file}`)),
        { name: file },
      );

      archive.finalize();
    });
  }

  async checkRecordFile() {
    const recordData = await this.readRecordFile().catch((e) => console.log('Failed to read record file or record file does not exist'));

    if (!recordData) {
      await this.createRecordFile();
    }
    else {
      await this.updateRecordFile(recordData);
    }

    this.report();
  }

  async createRecordFile() {
    let logFiles = await this.readLogfileList().catch((e) => console.log('Failed to read record file list'));

    if (!Array.isArray(logFiles)) logFiles = [];

    const record = logFiles.map((fileName) => ({
      fileName,
      isReported : false,
      reportDate : null,
      logDate    : new Date(`${fileName.split('.')[2]} 00:00`).valueOf(),
    }));

    this.record = {
      reportRecord : record,
    };

    return this.writeRecordFile(this.record).catch((e) => { console.log(e); });
  }

  async updateRecordFile(recordData) {
    const logFiles = await this.readLogfileList().catch((e) => console.log('Failed to read record file list'));
    const recordFiles = recordData.reportRecord.map((record) => record.fileName);

    recordData.reportRecord = recordData.reportRecord.filter((file) => logFiles.indexOf(file.fileName) > -1);

    logFiles.forEach((file) => {
      if (recordFiles.indexOf(file) === -1) {
        recordData.reportRecord.push({
          fileName   : file,
          isReported : false,
          reportDate : null,
          logDate    : new Date(`${file.split('.')[2]} 00:00`).valueOf(),
        });
      }
    });

    this.record = recordData;

    return this.writeRecordFile(recordData).catch(() => {});
  }

  writeRecordFile(data) {
    console.log('start to write record data to json');
    console.log('record data is:', data);
    console.log('record path is:', path.join(this.logDirectory, `/${RECORD_FILE_NAME}`));

    return fs.outputJson(path.join(this.logDirectory, `/${RECORD_FILE_NAME}`), data, { spaces: 2 });
  }

  readRecordFile() {
    return new Promise((resolve, reject) => {
      fs.readJSON(path.join(this.logDirectory, `/${RECORD_FILE_NAME}`), (err, data) => {
        if (err) {
          console.log('read record file error');

          return reject(err);
        }
        resolve(data);
      });
    });
  }

  readLogfileList() {
    return new Promise((resolve, reject) => {
      fs.readdir(this.logDirectory, (err, files) => {
        if (err) return reject(err);

        const logFiles = files.filter((file) => path.extname(file) === '.log');

        console.log('log file list is:', logFiles);
        resolve(logFiles);
      });
    });
  }
}
