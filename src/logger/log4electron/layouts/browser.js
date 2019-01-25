import util from 'util';
import dateFormat from 'date-format';
//  VERSION 1 BY yl1730
//  日志结构定义
//  日志分成三个部分: (1) 日志描述信息 (2) 日志内容 (3) 日志样式信息
//  日志描述信息定义
//  (1)组成部分 : 日期 + 日志类型 + 日志来源
//  (2)样例 : [2019-01-10T14:48:12.351] - VUE[ERROR]
//  日志内容信息定义
//  (1)内容类型: Boolean Number String Array Object
//  (2)其他 : 多内容中间以空格隔开, 如 log('a','b') => a b
//  日志样式定义
//  (1)简述 : 不同级别的日志以不同颜色的前缀进行区分
//           不同类型的日志以不同颜色的内容来区分
//  (2)不同级别的日志颜色定义如下
//  |-- 类别 -- |  -- 颜色   --|
//  |   ALL     |    grey     |
//  |   TRACE   |    blue     |
//  |   DEBUG   |    purple   |
//  |   INFO    |    green    |
//  |   WARN    |    orange   |
//  |   ERROR   |    red      |
//  |   FATAL   |    magenta  |
//  |   MARK    |    grey     |
//  |   OFF     |    grey     |
//  (2)不同类型的日志内容颜色定义如下
//  |-- 类型 -- |  -- 颜色   --|
//  |   Boolean   |    green    |
//  |   Number    |    blue     |
//  |   String    |    #333     |
//  |   Array     |    default  |
//  |   Object    |    default  |
//
//  VERSION 1 BY yl1730
//  新增内容 : 输出LOG的时候支持占位符 模板占位符 %t

const TEXT_STYLE = {
  number : {
    color    : 'blue',
    template : '%d',
  },
  float : {
    color    : 'blue',
    template : '%f',
  },
  string : {
    color    : '#333',
    template : '%s',
  },
  boolean : {
    color    : 'green',
    template : '%s',
  },
  object : {
    color    : '',
    template : '%o',
  },
};

const genLogHeader = (loggingEvent, timezoneOffset) => {
  const formatTemplate = '[%s] - %s[%s] :';
  const time = dateFormat.asString(loggingEvent.startTime, timezoneOffset);
  const result = util.format(
    formatTemplate,
    time,
    loggingEvent.context.ns || loggingEvent.categoryName,
    loggingEvent.level.levelContent,
  );

  return {
    templates : [ '%c', '%s' ],
    params    : [ `color: ${loggingEvent.level.color}`, result ],
  };
};

const genLogContent = (contents) => {
  const templateList = [];
  const paramList = [];

  contents.forEach((c) => {
    const type = typeof c === 'number' && !Number.isInteger(c) ? 'float' : typeof c;
    const style = TEXT_STYLE[type];

    templateList.push('%c', style.template);
    paramList.push(`color: ${style.color}`, c);
  });

  return {
    templates : templateList,
    params    : paramList,
  };
};

// const genFormatContent = (contents) => {
//   const unFormatContent = contents[0];
//
//   if (typeof unFormatContent !== 'string') return contents;
//
//
// };

const genFormatContent = (contents) => {
  const unFormatContent = contents[0];
  let start = 0;
  const resultList = [];

  if (typeof unFormatContent === 'string') {
    const list = unFormatContent.split(/%[tsdofi]/g);

    start++;
    list.forEach((l, index) => {
      if (index < list.length - 1) {
        if (start < contents.length) {
          resultList.push(l, contents[start++]);
        }
        else {
          resultList.push(`${l}%t`);
        }
      }
      else {
        resultList.push(l);
      }
    });
  }
  if (start < contents.length) {
    contents.slice(start).forEach((c) => resultList.push(' ', c));
  }

  return resultList.filter((r) => r !== '');
};

const browserLayout = (loggingEvent, timezoneOffset) => {
  const list = genFormatContent(loggingEvent.data || []);

  const templateList = [];
  const paramList = [];
  const header = genLogHeader(loggingEvent, timezoneOffset);
  const content = genLogContent(list || []);

  templateList.push(...header.templates, ...content.templates);
  paramList.push(...header.params, ...content.params);

  return {
    templates : templateList,
    params    : paramList,
  };
};

export default browserLayout;
