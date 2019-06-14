/** *
 * author:1494
 * date:2019/4/1
 * description:
 * use：
 */
import moment from 'moment';

import Paging from './extend/Paging';

import RecurrenceType from './model/RecurrenceType';
import DailyGenerator from './generator/DailyGenerator';
import WeeklyGenerator from './generator/WeeklyGenerator';
import MonthlyGenerator from './generator/MonthlyGenerator';
import OnceGenerator from './generator/OnceGenerator';

import Daylight from './extend/Daylight';

class Conference {
  /** *
   * 会议日程展开类
   * @param scheduleds 未展开的原始数据
   * @param exceptions 变更的数据
   * @param dstEnable 是否开启夏令时
   * @param utcOffset 当前浏览器时间偏移量
   */
  constructor({ scheduleds, exceptions, utcOffset, dstEnable, serverTime, queryEndTime, queryStartTime } = {
    dstEnable  : true,
    scheduleds : [],
    exceptions : {},
  }) {
    console.time('Conference total');

    /**
     * 是否开启夏令时
     */
    this.dstEnable = typeof dstEnable === 'boolean' ? dstEnable : true;

    /**
     * 服务器时间
     */
    this.serverTime = serverTime;

    /**
     * 截止查询时间
     */
    this.queryEndTime = queryEndTime;

    /**
     * 开始查询时间
     */
    this.queryStartTime = queryStartTime;

    /**
     * 结果集的Map
     */
    this.plans = new Map();

    /**
     * 备份生成的结果，暂未用到
     * @type {Array}
     */
    this.generates = [];

    /**
     * 原始数据
     * @type {Array}
     */
    this.scheduleds = Array.isArray(scheduleds) ? scheduleds : [ scheduleds ];

    /**
     * 原始变更数据
     * @type {Array}
     */
    this.exceptions = exceptions;

    /**
     * 结果集
     * @type {Array}
     */
    this.result = [];

    /**
     * 处理数据时的时间偏移量
     * @type {number}
     */
    this.utcOffset = utcOffset || moment().utcOffset();

    /** *
     * 展开原始数据
     */
    this._rawScheduledData();

    /** *
     * 过滤变更数据
     */
    this._filterScheduledData();

    /** *
     * 夏令时处理
     */
    // 夏令时规则不再处理，20190614
    // if (this.dstEnable) this._daylightData();

    /** *
     * 按照时间排序
     */
    this._sortScheduledData();

    console.timeEnd('Conference total');
  }

  /** *
   * 获取页面展示需要的数据格式,按照时间排序
   * @returns {Array}
   */
  getResult() {
    return this.result;
  }

  getTimeRangeResult(start = 0, end = 0) {
    if (!start && !end) return this.result;

    return this.result.filter((r) => {
      const notInRange = (r.endDateTime < start) || (r.startDateTime > end);

      return !notInRange;
    });
  }

  /** *
   * 获取已预约的会议
   * @param serverTime 服务器时间
   * @param duplicate 周期会议只显示一条
   * @returns {any[]}
   */
  getReadyResult({ serverTime, duplicate } = { duplicate: false }) {
    const _serverTime = serverTime || this.serverTime || new Date().valueOf();
    const _result = this.result.filter((x) => x.endDateTime > _serverTime);

    if (duplicate) {
      const map = new Map();
      const len = _result.length;

      for (let i = 0; i < len; i++) {
        const plan = _result[i];

        if (!map.has(plan.planId)) {
          map.set(plan.planId, plan);
        }
      }

      return Array.from(map.values());
    }

    return _result;
  }

  /** *
   * 获取指定utcOffset下面的时间展示 [未实现]
   * @param utcOffset
   * @param format
   * @returns {Array}
   */
  getUtcResult(utcOffset = this.utcOffset, format) {
    const len = this.result.length;

    for (let i = 0; i < len; i++) {
      const plan = this.result[i];

      plan.startDateTime = this._getUtcOffset(plan.startDateTime, utcOffset, format);
      plan.endDateTime = this._getUtcOffset(plan.endDateTime, utcOffset, format);
    }

    return this.result;
  }

  /** *
   * 获取指定时间的前{number}条数据 [未实现]
   * @param number
   * @param time
   * @param utcOffset
   * @returns {Array}
   */
  getNowResult(number = -1, time = new Date().valueOf()) {
    const len = this.result.length;

    let temp = 0;

    const _result = [];

    for (let i = 0; i < len; i++) {
      if (moment(this.result[i].startDateTime).isBefore(moment(time))) {
        _result.push(this.result[i]);
        temp++;
      }
      if (temp === number) break;
    }

    return _result;
  }

  /**
   * 结果集排序
   */
  _sortScheduledData() {
    this.result.sort((a, b) => a.startDateTime - b.startDateTime);
  }

  /**
   * 结果集过滤变更数据
   */
  _filterScheduledData() {
    if (this.exceptions) {
      for (const field in this.exceptions) {
        this.exceptions[field].forEach((exception) => {
          const key = exception.planId + exception.sequence;

          if (this.plans.has(key)) {
            if (exception.isDeleted === true) {
              this.plans.delete(key);
            }
            else {
              Object.assign(this.plans.get(key), exception, { _exception: exception });
            }
          }
        });
      }
    }

    this.result = [ ...this.plans.values() ];
  }

  static getDateValue(date, offsetDisplayName) {
    return moment(date + offsetDisplayName).valueOf();
  }

  /**
   * 展开原始的数据
   */
  _rawScheduledData() {
    let generate = null;

    for (let i = 0; i < this.scheduleds.length; i++) {
      const scheduled = this.scheduleds[i];

      switch (scheduled.recurrenceType) {
        case RecurrenceType.DAILY:
          generate = new DailyGenerator(scheduled);
          break;
        case RecurrenceType.WEEKLY:
          generate = new WeeklyGenerator(scheduled);
          break;
        case RecurrenceType.MONTHLY:
          generate = new MonthlyGenerator(scheduled);
          break;
        default:
          generate = new OnceGenerator(scheduled);
      }
      this._addPlanMap(generate.doGenerate());
      this.generates.push(generate);
    }
  }

  /** *
   * 夏令时处理
   * @private
   */
  _daylightData() {
    const len = this.result.length;

    for (let i = 0; i < len; i++) {
      const plan = this.result[i];

      if (plan.timeZoneConfig && Array.isArray(plan.timeZoneConfig.rule)) {
        Daylight.filterDaylightDate(plan);
      }
    }
  }

  _addPlanMap(list) {
    for (let i = 0; i < list.length; i++) {
      const plan = list[i];

      this.plans.set(plan.planId + plan.sequence, plan);
    }
  }

  _getUtcOffset(time, utcOffset, format = 'YYYY-MM-DD HH:mm') {
    const _time = moment(time);

    _time.utcOffset(utcOffset);

    return _time.format(format);
  }

  _destroy() {

  }
}

export default Conference;
export {
  Conference,
  Paging,
};
