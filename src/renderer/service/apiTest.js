import { ipcRenderer } from 'electron';
import { deviceManagement, enterprise, feedBack, fileUpload } from './index';
import { uploadMultiFile } from './api/fileUpload';

async function getSystemInfo() {
  ipcRenderer.send('request-system-info', '');

  return new Promise((resolve) => {
    ipcRenderer.once('system-info', (event, arg) => {
      resolve(arg);
    });
  });
}

const getRegistData = (clientId) => ({
  account       : 'hei123',
  clientId,
  clientName    : '张三的VCM',
  clientOs      : 'win32',
  clientRemarks : [
    '张三的软终端',
  ],
  clientType     : 'VCD',
  cpuCore        : 1,
  cpuModel       : 'Qualcomm 855',
  enterpriseId   : 0,
  ip             : '192.168.0.1',
  mac            : 'E0-D5-5E-BF-E6-06',
  memory         : '8G',
  packageVersion : '22',
  serviceAddr    : 'www.localhost.com',
});

const getUpdateData = (clientId) => ({
  account       : '66668',
  clientId,
  clientOs      : 'win32',
  clientRemarks : [
    '张三的软终端',
  ],
  clientType     : 1,
  cpuCore        : 1,
  cpuModel       : 'Qualcomm 855',
  enterpriseId   : 0,
  ip             : '192.168.0.1',
  mac            : 'E0-D5-5E-BF-E6-06',
  memory         : '8G',
  packageVersion : '22',
  serviceAddr    : 'www.localhost.com',
});

const getFeedbackInfo = () => ({
  feedBackContent : '<html></html>',
  feedbackId      : '123456',
});

const getUploadFile = () => document.getElementById('myfile').files[0];

const getFormData = () => {
  const form = new FormData();

  form.append('file', getUploadFile());
  form.append('name', 'a.txt');
  console.log(form);

  return form;
};

const startUpload = () => {
  fileUpload.uploadMultiFile(window.clientId, getFormData());
};

window.startUpload = startUpload;

export default async() => {
  const [ system, cpu, network, memory ] = await getSystemInfo();

  const clientId = system.uuid.replace(/-/g, '');

  window.clientId = clientId;

  const enterpriseInfo = await enterprise.getEnterpriseInfo();

  const registerInfo = await deviceManagement.clientRegister(getRegistData(clientId));

  const updateInfo = await deviceManagement.clientUpdate(clientId, getUpdateData(clientId));

  await deviceManagement.clientHeart(clientId);

  await feedBack.feedBackReport(clientId, getFeedbackInfo());

  return {
    enterpriseInfo,
    registerInfo,
    updateInfo,
  };
};
