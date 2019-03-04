import fs from 'fs-extra';
import path from 'path';
import FormData from 'form-data';
import { uploadLog } from '../api-service/api/fileUpload';
import LogProvider from '../log-provider/provider';

const RECORD_FILE_NAME = 'report-record.json';

export default class LogReporter extends LogProvider {
  constructor(api) {
    super();

    this.api = api;
    this.checkRecordFile();
  }

  report() {
    const reportList = this.record.reportRecord.filter((file) => !file.isReported && !this.isToday(file.logDate));
    const reportFile = this.reportFile.bind(this);

    reportList.forEach(reportFile);
  }

  async reportFile(file) {
    try {
      const formData = new FormData();
      const logfile = await this.provideLogFile(file);

      formData.append('log', logfile, file.fileName);

      const res = await this.startReport(formData);

      if (!res) throw new Error('upload log file failed');

      this.record.reportRecord.forEach((item) => {
        if (file.fileName === item.fileName) {
          item.isReported = true;
          item.reportDate = new Date().valueOf();
        }
      });

      await this.writeRecordFile(this.record);
    }
    catch (e) {
      console.log('erroris', e);
    }

    this.removeZipFile(`${file.fileName}.zip`);
  }

  startReport(form) {
    return this.api.uploadLogs(form);
  }

  async checkRecordFile() {
    const recordData = await this.readRecordFile().catch((e) => console.log('Failed to read record file or record file does not exist')); // 读取日志记录文件

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


  /*
  * recordData : 日志记录文件 {fileName, isReported, reportDate, logDate}
  *
  * */
  async updateRecordFile(recordData) { // 更新日志记录文件
    const logFiles = await this.readLogfileList();
    const logFilesName = logFiles.map((file) => file.fileName); // 当前日志目录下所有日志文件名

    const recordFilesName = recordData.reportRecord.map((record) => record.fileName); // 日志记录文件下记录的所有文件名

    recordData.reportRecord = recordData.reportRecord // 去除日志记录中 已经不存在目录中的文件
      .filter((file) => logFilesName.indexOf(file.fileName) > -1);

    logFiles.forEach((file) => {
      if (recordFilesName.indexOf(file.fileName) === -1) { // 添加新增的 日志文件 到记录中
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
