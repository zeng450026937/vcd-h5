import fs from 'fs-extra';
import path from 'path';
import { uploadLog } from '../api-service/api/fileUpload';
import LogProvider from '../log-provider/provider';

const RECORD_FILE_NAME = 'report-record.json';

export default class logReporter extends LogProvider {
  constructor() {
    super();

    this.checkRecordFile();
  }

  report() {
    const reportList = this.record.reportRecord.filter((file) => !file.isReported && !this.isToday(file.logDate));
    const reportFile = this.reportFile.bind(this);

    reportList.forEach(reportFile);
  }

  async reportFile(file) {
    try {
      const form = await this.provideLogFile(file.fileName);

      const res = await this.startReport(form);

      if (res.data.ret === -1) throw res.data;

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

    this.removeZipFile(`${file.fileName}.zip`);
  }

  startReport(form) {
    return uploadLog(this.clientId, form, { headers: form.getHeaders() });
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
    const logFiles = await this.readLogfileList();

    this.record = {
      reportRecord : logFiles,
    };

    return this.writeRecordFile(this.record).catch((e) => { console.log(e); });
  }

  async updateRecordFile(recordData) {
    const logFiles = await this.readLogfileList();
    const recordFiles = recordData.reportRecord.map((record) => record.fileName);

    recordData.reportRecord = recordData.reportRecord.filter((file) => logFiles.indexOf(file.fileName) > -1);

    logFiles.forEach((file) => {
      if (recordFiles.indexOf(file) === -1) {
        recordData.reportRecord.push({
          fileName   : file.fileName,
          isReported : false,
          reportDate : null,
          logDate    : new Date(`${file.fileName.split('.')[1]} 00:00`).valueOf(),
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


}
