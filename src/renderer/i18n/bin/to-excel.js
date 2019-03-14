const xlsx = require('node-xlsx');
const fs = require('fs');
const path = require('path');
const { langList:langNameObj, ouputExcelName } = require('../config');

const langNameList = Object.keys(langNameObj);
const langModuleList = require('../modules');


try {
  // 输出表格行首信息，以及字段名和当前config当中的语言
  const outputData = [
    [ `最新导出时间: ${(new Date()).toLocaleString()} , 要导入的时候记得把excel关了。` ],
    [ ' 模块名 ', ' 字段名 ', ...Object.entries(langNameObj).map((item) => `${item[1].remark} ${item[1].locale} ${item[0]}`) ],
  ];

  // 遍历当前的语言模块，将模块当中的每条的语句的不同语言版本按照config当中的顺序整合成一行( sentence : {zh : '' , en: ''}  )
  langModuleList.forEach((langModule) => {
  // 输出模块名
    outputData.push([ langModule.name ]);

    const moduleObj = {};

    // 遍历当前config当中配置的语言（按顺序）
    langNameList.forEach((langName) => {
      let sentences = langModule.lang[langName];

      // 只在当前模块针对当前遍历的语言有翻译时，也有可能出现当前模块还没有该种语言的翻译
      if (sentences) {
        sentences = Object.entries(sentences);
        sentences.forEach(([ sentenceName, sentenceText ]) => {
          if (!moduleObj[sentenceName]) {
            moduleObj[sentenceName] = {};
          }
          moduleObj[sentenceName][langName] = sentenceText;
        });
      }
    });
    Object.entries(moduleObj).forEach(([ sentenceName, sentenceLang ]) => {
      const rowArray = [ '', sentenceName ];

      langNameList.forEach((langName) => {
        rowArray.push(sentenceLang[langName]);
      });
      outputData.push(rowArray);
    });
    // 输出间隔
    outputData.push([]);
  });
  // 设置写入流（sheet名，数据，每列宽度）
  const buffer = xlsx.build(
    [ { name: 'i18n国际化', data: outputData } ],
    { '!cols': [ { wch: 15 }, { wch: 30 }, ...langNameList.map(() => ({ wch: 20 })) ] }
  );


  fs.writeFileSync(path.resolve(__dirname, '../', ouputExcelName), buffer);
  console.log(`${path.resolve(__dirname, '../', ouputExcelName)}导出成功！`);
}
catch (e) {
  console.log(e);
}
