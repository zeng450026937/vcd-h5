<template>
  <a-layout id="calendar-nav" class="flex-col bg-white h-full select-none">
    <div>
      <plain-calendar ref="calendar"
                      :disabledDate="disabledStartDate"
                      class="calendar-nav-calendar"
                      :showToday="false"
                      @select="selectDate"
      >
        <template slot="dateRender" slot-scope="current, today">
          <div class="relative">
            <div class="ant-calendar-date rounded-full text-xs">
              {{current.date()}}
            </div>
            <a-badge class="event-pointer" :status="getNoticeInfo(current).type" />
          </div>
        </template>
      </plain-calendar>
      <div class="text-center text-xs text-indigo">
        <span class="cursor-pointer" @click="onToday">回到今天</span>
      </div>
    </div>
    <div class="flex flex-col items-center mt-4 px-3">
      <a-button type="primary" block
                class="h-9"
                @click="reserveMeeting">
        <a-iconfont type="icon-yuyuehuiyi" class="text-base"/>
        预约会议
      </a-button>
    </div>
  </a-layout>
</template>

<script>

import moment from 'moment';
import plainCalendar from '../../Common/CommonCalendar';
import { MAIN } from '../../../router/constants';
import 'moment/locale/zh-cn';

export default {
  name       : 'CalendarNav',
  components : {
    plainCalendar,
  },
  data() {
    return {
      // searchText : '',
    };
  },
  computed : {
    eventList() {
      return this.$model.schedule.calendar || [];
    },
    selectedDate : {
      get() {
        return this.$model.schedule.selectedDate || new Date();
      },
      set(val) {
        this.$model.schedule.selectedDate = val;
      },
    },
  },
  methods : {
    disabledStartDate(startValue) {
      const preWeek = new Date().setHours(-7 * 24);
      const afterWeek = new Date().setHours(7 * 24);

      return !startValue.isBetween(preWeek, afterWeek);
    },
    onToday() {
      this.$refs.calendar.onToday();
    },
    reserveMeeting() {
      this.$router.push({ name: 'reservation' });
    },
    getNoticeInfo(value) {
      let noticeInfo;

      if (this.eventList.some((e) => this.isDateMatched(e.startMoment, value))) {
        noticeInfo = { type: 'error' };
      }

      return noticeInfo || {};
    },
    isDateMatched(date1, date2) {
      return date1.date() === date2.date()
        && date1.month() === date2.month()
        && date1.year() === date2.year();
    },
    selectDate(date) {
      this.selectedDate = date.raw;
      this.$model.schedule.currentDateEvents = [];
      this.eventList.forEach((e) => {
        if (e.expiryMoment.toDate() >= this.selectedDate.toDate()
          || e.startMoment.toDate() >= this.selectedDate.toDate()) {
          this.$model.schedule.currentDateEvents.push(e);
        }
      });
    },
  },
  watch : {
    eventList : {
      async handler(val) {
        await this.$nextTick();
        await this.$refs.calendar.$nextTick();
        this.$refs.calendar.setDate(this.selectedDate);
      },
      immediate : true,
    },
  },
};
</script>

<style lang="less">
  #calendar-nav {
    .calendar-nav-calendar {
      .ant-calendar {
        box-shadow: none;
        width: auto;
        font-size: 12px;

        .ant-calendar-disabled-cell {
          .ant-calendar-date {
            background: transparent !important;
          }
        }
        .ant-calendar-input-wrap{
          display: none;
        }
        .ant-calendar-header {
          border-bottom: none;
        }
        .ant-calendar-body {

        }
        .ant-calendar-footer {
          border-top: none;
          line-height: normal;
        }
        .event-pointer {
          position: absolute;
          top: 0;
          left: 100%;
          display: inline-block;
          transform: translateX(-100%);
          .ant-badge-status-dot {
            position: absolute;
            top: 0;
          }
        }
      }
    }
  }
</style>
