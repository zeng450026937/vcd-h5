<template>
  <div>
    <table>
      <tr>
        <td>
          开始/结束时间
        </td>
        <td>
          <yl-date-picker
            v-model="form.startTime"
            type="datetime" value-format="timestamp"
            placeholder="选择日期时间">
          </yl-date-picker>
          <yl-date-picker
            v-model="form.endTime"
            type="datetime" value-format="timestamp"
            placeholder="选择日期时间">
          </yl-date-picker>
        </td>
        <td>
          时区
        </td>
        <td>
          <yl-select v-model="form.zoneId" placeholder="请选择">
            <yl-option
              v-for="item in timezoneList"
              :key="item.zoneId"
              :label="item.cnZoneName"
              :value="item.zoneId">
            </yl-option>
          </yl-select>
        </td>
      </tr>
      <tr>
        <td>
          周期开始/结束时间
        </td>
        <td>
          <yl-date-picker
            v-model="form.rangeStartDate"
            type="datetime" value-format="timestamp"
            placeholder="选择日期时间">
          </yl-date-picker>
          <yl-date-picker
            v-model="form.rangeEndDate"
            type="datetime" value-format="timestamp"
            placeholder="选择日期时间">
          </yl-date-picker>
        </td>
      </tr>
      <tr>
        <td>
          interval
        </td>
        <td>
          <yl-select v-model="form.interval" placeholder="请选择">
            <yl-option
              v-for="item in 100"
              :key="item"
              :label="item"
              :value="item">
            </yl-option>
          </yl-select>
        </td>
      </tr>
      <tr>
        <td>
          dayOfWeek("2,6")
        </td>
        <td>
          <yl-input v-model="form.dayOfWeek" placeholder="请输入内容"></yl-input>
        </td>
      </tr>
      <tr>
        <td>
          dayOfMonth
        </td>
        <td>
          <yl-input v-model="form.dayOfMonth" placeholder="请输入内容"></yl-input>
        </td>
      </tr>
      <tr>
        <td>
          type
        </td>
        <td>
          <yl-radio-group v-model="form.type">
            <yl-radio :label="0">按天循环</yl-radio>
            <yl-radio :label="1">按周循环</yl-radio>
            <yl-radio :label="2">按月</yl-radio>
          </yl-radio-group>
        </td>
      </tr>
      <tr>
        <td>
          开启夏令时
        </td>
        <td>
          <yl-switch v-model="form.dstEnable"></yl-switch>
        </td>
      </tr>
      <tr>
        <td>测试结果： <span :class="success?'success':'fail'">{{success?'成功':'失败'}}</span></td>
        <td></td>
      </tr>
    </table>
    <yl-button type="danger" @click="testing">测试</yl-button>
    <div style="overflow: auto;height: 500px">
      <table border="1">
        <tr>
          <td style="width: 50%;vertical-align: top">{{leftInfo.length}}<br>
            <div v-for="(item,index) in leftInfo" :key="index"> {{item._startTime}}</div>
            <br>{{leftInfo}}
          </td>
          <td style="width: 50%;vertical-align: top">{{rightInfo.length}}<br>
            <div v-for="(item,index) in rightInfo" :key="index"> {{item._startTime}}</div>
            <br>{{rightInfo}}
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import Conference from '../Conference';
import moment from 'moment';

import {getTimezoneList} from '@/api/modules/common';
import request from '@/api/request';

export default {
  name: "Test",
  data() {
    return {
      timezoneList: [],
      success: null,
      form: {
        "dstEnable": false,
        "planId": "91d9feb555fa48459bc353b53394bf03",
        "partyId": "418693e870d2424fa8c72e167ad7a0da",
        "startTime": 1557797400000,
        "endTime": 1557804600000,
        "zoneId": "China_Standard_Time",
        "type": 0,
        "dailyType": 1,
        "interval": 5,
        "dayOfWeek": "1,2,3,4,5,6",
        "dayOfMonth": "31",
        "dayOfWeekIndex": null,
        "monthOfYear": null,
        "rangeStartDate": 1557763200000,
        "rangeEndDate": 1559278800000,
        "rangeType": 3,
        "rangeOccurrences": null
      },
      leftInfo: '',
      rightInfo: '',
    };
  },
  async created() {
    const {data} = await getTimezoneList({withRule:true});
    this.timezoneList = data;
  },
  methods: {
    async testing() {

      let {startTime: startDateTime, endTime: endDateTime, zoneId, type, interval, dayOfWeek, dayOfMonth, rangeStartDate, rangeEndDate, planId,dstEnable} = this.form;
      const offsetDisplayName = this.timezoneList.find(x => x.zoneId === zoneId).offsetDisplayName;
      const timeZoneConfig = this.timezoneList.find(x => x.zoneId === zoneId);
      this.form.timeZoneConfig = timeZoneConfig;
      this.form.rangeStartDate = moment(moment(this.form.startTime).format('YYYY-MM-DD 00:00:00')+offsetDisplayName).valueOf();
      let ConferenceTime = {
        startDateTime,
        endDateTime,
        planId,
        timeZoneConfig: this.form.timeZoneConfig ,
        recurrenceType: type,
        recurrenceInterval: interval,
        dayOfWeek,
        dayOfMonth,
        rangeStartDate: rangeStartDate, rangeEndDate: rangeEndDate
      };

      const conference = new Conference({scheduleds:ConferenceTime,dstEnable});
      console.log(conference);
      const right = conference.getResult().map(({sequence, endDateTime, startDateTime}) => {
        return {
          startTime: startDateTime,
          endTime: endDateTime,
          sequence,
          _startTime: moment(startDateTime).format('YYYY-MM-DD HH:mm'),
          _endTime: moment(endDateTime).format('YYYY-MM-DD HH:mm')
        };
      });
      const res = await request.post('/cloud/conference-manager/api/v1/fragile/conference/scheduled/expansion', this.form);
      if (res.ret > -1) {
        res.data.forEach(item => {
          item._startTime = moment(item.startTime).format('YYYY-MM-DD HH:mm');
          item._endTime = moment(item.endTime).format('YYYY-MM-DD HH:mm');
        });
        this.leftInfo = res.data;
      } else {
        this.leftInfo = JSON.stringify(res);
      }
      this.rightInfo = right;
      /*
      this.success = true;
     for (let i = 0; i < right.length; i++) {
       for (let k in right[i]) {
         if (!this.leftInfo[i] || right[i][k] !== this.leftInfo[i][k]) {
           console.error(right[i], this.leftInfo[i]);
           this.success = false;
           break;
         }
       }
     }*/
      this.success = JSON.stringify(this.leftInfo) === JSON.stringify(right);
      if (this.leftInfo.length !== right.length) this.success = false;
    }
  }
};
</script>

<style scoped>
  .success {
    color: #4ccc6d;
  }

  .fail {
    color: red;
  }
</style>