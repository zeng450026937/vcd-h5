import about from './about';
import video from './video';
import conference from './conference';
import audio from './audio';
import common from './common';
import device from './device';
import { nextTick } from '../utils';

// 提取vuem构造器中的数据键的数组
const getModelDataList = (model) => {
  const data = model.mixins[0].data;

  // 判断当前vuem构造器中data的类型，大部分应该为立即执行函数
  if (typeof data === 'function') { return data(); }
  else if (typeof data === 'object') { return data; }
  else return {};
};

const array = [
  { name: 'about', model: about },
  { name: 'video', model: video },
  { name: 'conference', model: conference },
  { name: 'audio', model: audio },
  { name: 'device', model: device },
  { name: 'common', model: common },
];

nextTick(() => {
  array.forEach((item) => {
    item.model.vm._storageList = item.model._storageList;
    item.model.vm._keyList = getModelDataList(item.model);
  });
});


export default array;
