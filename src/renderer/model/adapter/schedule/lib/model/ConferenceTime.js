/** *
 * author:1494
 * date:2019/4/1
 * description:
 * use： 未展开，单条记录的会议计划的模型，通过该模型的单条记录此规则展开
 */

import moment from 'moment';


class ConferenceTime {
  constructor({ startDateTime, endDateTime, zoneId, timeZoneConfig, recurrenceType, dailyType, recurrenceInterval, dayOfWeek, dayOfMonth, dayOfWeekIndex, monthOfYear, rangeStartDate, rangeEndDate, rangeType, rangeOccurrences, expectedStartTime, expectedEndTime } = {}) {
    /**
     * 单次会议的开始时间（包含日期）
     */
    this.startDateTime = startDateTime;

    /**
     * 单次会议的结束时间（包含日期）
     */
    this.endDateTime = endDateTime;

    /**
     * 时区配置ID
     */
    this.zoneId = zoneId;

    /**
     * 时区配置
     * "zoneId": "China_Standard_Time",
     * "utcOffset": 28800,
     * "offsetDisplayName": "+08:00",
     * "cnZoneName": "(UTC+08:00) 北京，重庆，香港特别行政区，乌鲁木齐",
     * "usZoneName": "(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi",
     * "rule": null
     */
    this.timeZoneConfig = timeZoneConfig || {
      offsetDisplayName : '+08:00',
    };

    /**
     * 周期会议的循环模式类型，
     * 0 = 按天循环，1 = 按周循环，
     * 2 = 按月循环第一种模式，每几个月的第几天，
     * 3 = 按月循环第二种模式，每几个月的第几个日子/工作日/周末，
     * 4 = 按年循环第一种模式，每年的第几月第几天，
     * 5 = 按年循环第二种模式，每年的第几月的第几个日子/工作日/周末
     */
    this.recurrenceType = recurrenceType;

    /**
     * 按天循环模式类型，1 = 表示每几天，2 = 表示每个工作日。当type为按天循环（0）时，必须输入
     */
    this.dailyType = dailyType;

    /**
     * 时间间隔，例如按周循环时，表示间隔X周。除按工作日循环模式（recurrenceType=0 && dailyType=2）以外，其他循环模式下，必须输入。数据必须大于0
     */
    this.recurrenceInterval = recurrenceInterval;

    /**
     * 表示一周中的某天，存在多个时使用“,”分隔。
     * 例如：周一和周五表示为2,6。当type为按周循环（1）、按月循环第二种模式（3）和按年循环第二种模式（5）时，必须输入。可取值：-3 = 日子，-2 = 工作日，-1 = 周末，1 = 星期天，2 = 星期一，3 = 星期二，4 = 星期三，5 = 星期四，6 = 星期五，7 = 星期六。特别的当type = 1时，可选值为[1, 7]。
     */
    this.dayOfWeek = dayOfWeek;

    /**
     * 每个月的第几天。数据范围为[1, 31]。当type为按月循环的第一种模式（2）时，必须输入。如果数值为31，但是当月没有31天时，自动转换为当月的最后一天
     */
    this.dayOfMonth = dayOfMonth;

    /**
     * 第几个dayOfWeek。当type为按月循环第二种模式（3）和按年循环第二种模式（5）时，必须输入。1 = 第一个，2 = 第二个，3 = 第三个，4 = 第四个，-1 = 最后一个
     */
    this.dayOfWeekIndex = dayOfWeekIndex;

    /**
     * 第X个月。取值范围为[0, 11]，分别表示一月到十二月。当type为按年循环第一种模式（4）和按年循环第二种模式（5）时，必须输入。
     */
    this.monthOfYear = monthOfYear;

    /**
     * 周期开始日期，当地时间的0点转换为时间戳
     */
    this.rangeStartDate = rangeStartDate;

    /**
     * 周期结束日期，当地时间的0点转换为时间戳。当rangeType为在具体日期后结束（3）时，必须输入。
     */
    this.rangeEndDate = rangeEndDate;

    /**
     * 周期重复类型，1 = 无结束日期，2 = 重复几次后结束，3 = 在具体日期后结束
     */
    this.rangeType = rangeType;

    /**
     * 重复次数，数据大于0。当rangeType为在具体日期后结束（2）时，必须输入。
     */
    this.rangeOccurrences = rangeOccurrences;

    /**
     * 期望查询的开始时间
     */
    this.expectedStartTime = expectedStartTime;

    /**
     * 期望查询的结束时间
     */
    this.expectedEndTime = expectedEndTime;

    /*
    * 会议时长
    * */
    this._duration = this.endDateTime - this.startDateTime;

    /**
     * 预约会议偏移量下的时间,结束时间新增一天
     */
    if (this.rangeEndDate) {
      this._rangeEndDate = moment(this.rangeEndDate).utcOffset(this.timeZoneConfig.offsetDisplayName);
    }
  }

  /**
   * 校验参数
   * @returns {boolean}
   */
  check() {
    [ 'startDateTime', 'endDateTime', 'timeZoneConfig' ].forEach((key) => {
      if (!this[key]) {
        console.error(`${key} require`);
        
        return false;
      }
    });

    if (!this.timeZoneConfig.offsetDisplayName) {
      console.error(' offsetDisplayName require ');
      
      return false;
    }

    // 周期会议为天或者为按周的情况下 有间隔时间
    if (Number.isNaN(this.recurrenceInterval)) {
      console.error('recurrenceInterval require');
      
      return false;
    }

    return true;
  }
}


export default ConferenceTime;
