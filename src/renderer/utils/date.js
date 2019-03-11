import { flow as pipe } from 'lodash';

function genDouble(num) {
  return num < 10 ? `0${num}` : `${num}`;
}

export function isToday(time) {
  return new Date().valueOf() - time.valueOf() < 1000 * 60 * 60 * 24;
}

export function isTomorrow(time) {
  const diff = new Date(time).valueOf() - new Date(new Date().toDateString()).valueOf();

  
  return 24 * 60 * 60 * 1000 < diff && diff < 24 * 60 * 60 * 1000 * 2;
}

export function isYesterday(time) {
  const diff = new Date(new Date().toDateString()).valueOf() - new Date(time).valueOf();

  return diff > 0 && diff < 24 * 60 * 60 * 1000;
}

export function getDate(date = new Date()) {
  date = new Date(date);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  return `${year}-${genDouble(month)}-${genDouble(day)}`;
}

export function getTime(time) {
  time = new Date(time);
  const hours = genDouble(time.getHours());
  const minutes = genDouble(time.getMinutes());

  return `${hours}:${minutes}`;
}

export function getDateTime(time) {
  time = new Date(time);

  return `${getDate(time)} ${getTime(time)}`;
}


export function genDurationTime(start, end) {
  start = new Date(start).valueOf();
  end = new Date(end).valueOf();
  const diff = end - start;
  const format = pipe(Math.floor, Math.abs, genDouble);
  const seconds = format((Math.abs(diff) / 1000) % 60);
  const minutes = format((Math.abs(diff) / 1000 / 60) % 60);
  const hours = format((Math.abs(diff) / (1000 * 60 * 60)));

  if (!hours) return `${minutes}:${seconds}`;

  return `${hours}:${minutes}:${seconds}`;
}

export function genDateString(time) {
  time = new Date(time);
  if (isToday(time)) return '今天';
  if (isYesterday(time)) return '昨天';

  return getDate(time);
}

export function genStartTime(time) {
  time = new Date(time);

  return isToday(time) ? `今天 ${getTime(time)}`
    : isYesterday(time)
      ? `昨天 ${getTime(time)}`
      : getDateTime(time);
}
