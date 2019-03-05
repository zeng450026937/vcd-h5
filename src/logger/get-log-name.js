import moment from 'moment';

export function getLogName() {
  return moment().format('[vc-desktop.]YYYY-MM-DD[.log]');
}
