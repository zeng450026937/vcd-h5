const xlsx = require('node-xlsx');
const path = require('path');
const fs = require('fs');
const stringify = require('json-stringify-pretty-compact');
const { ouputExcelName } = require('../config');

const configFilePath = './config/index.js';
const modulesDirPath = './modules/';

try {
  const array = [ ...xlsx.parse(path.resolve(__dirname, '../', ouputExcelName))[0].data, [] ];
  
  // 提取日期信息
  const exportDate = getExportDateString(array.splice(0, 1)[0][0])[0];

  // 提取表格中的语言列表
  const langList = getLangConfig(array.splice(0, 1)[0]);

  // 生成config/index.js中的信息
  const langConfig = {
    langList,
    ouputExcelName,
  };

  
  const langModuleList = [];

  let langModule = {
    name : '',
    lang : {},
  };


  // 遍历加下去的每行，生成对应的模块数组
  array.forEach((row) => {
    // 若当前行的长度为1，则改行为模块名
    if (row.length === 1) {
      langModule.name = row[0];
    }
    else if (row.length === 0) {
      // 若改行长度为0，说明一个模块遍历结束
      langModuleList.push(langModule);
      langModule = {
        name : '',
        lang : {},
      };
    }
    else {
      // 遍历当前行，将当前行中的不同语言的句子添加到模块不同语言的句子当中
      Object.keys(langList).forEach((langName, langIndex) => {
        if (row[langIndex + 2]) {
          if (!langModule.lang[langName]) {
            langModule.lang[langName] = {};
          }
          langModule.lang[langName][row[1]] = row[langIndex + 2];
        }
      });
    }
  });
  // 输出lang config的内容
  writeFile(path.resolve(getI18nDirPath(), configFilePath), `// 最后导出excel时间为 ${exportDate}\n// 最后导入excel时间为 ${getDateString()}\nmodule.exports=${stringify(langConfig)}`);

  // 输出各个模块的文件
  langModuleList.forEach((item) => {
    writeFile(path.resolve(getI18nDirPath(), modulesDirPath, `${item.name}.js`), `// 最新导入时间为 ${getDateString()} \nmodule.exports = ${stringify(item)}`);
  });
  
  // 输出模块的集成文件 /modules/index.js
  writeFile(path.resolve(getI18nDirPath(), modulesDirPath, 'index.js'), `${langModuleList.map((item) => `const ${item.name} = require('./${item.name}');\n`).join('')}module.exports=[${langModuleList.map((item) => item.name).join(',')}]`);
}
catch (error) {
  console.log(error);
}

/**
 * 获取表格首行中导出表格的时间信息
 */
function getExportDateString(str) {
  return str.match(/[\d]{4}-[\d]{1,2}-[\d]{1,2} [\d]{2}:[\d]{2}:[\d]{2}/);
}

/**
 * 获取excel中的语言信息
 */
function getLangConfig([ , , ...langList ]) {
  const config = {};

  langList.forEach((item) => {
    const arr = item.split(' ');

    config[arr[2]] = {
      locale : arr[1],
      remark : arr[0],
    };
  });
  
  return config;
}

/**
 * 将输入的数据写入指定目录的文件中
 */
function writeFile(filepath, data) {
  fs.writeFile(filepath, data, (err) => {
    if (err) {
      console.log('导出失败，失败原因为：');
      console.log(err);
    }
    else {
      console.log(`${filepath} 导出成功！`);
    }
  });
}

/**
 * 获取当前时间字符串
 */
function getDateString() {
  return (new Date()).toLocaleString();
}

/**
 * 获取当前I18n的目录路径
 */
function getI18nDirPath() {
  return path.resolve(__dirname, '../');
}
