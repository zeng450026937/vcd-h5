<template>
  <a-layout id="calendar-nav" class="flex-col bg-white h-full select-none border-r">
    <div class="flex px-3 items-center h-14 border-b">
        <a-input
            v-model="searchText"
            placeholder='搜索联系人'
        >
          <a-iconfont slot="suffix" type='icon-sousuo' class="text-lg text-grey"/>
        </a-input>
    </div>
    <div>
      <plain-calendar ref="calendar"
                      class="calendar-nav-calendar"
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
    </div>
    <div class="flex flex-col items-center mt-4 px-3">
      <a-button type="primary" block
                class="cursor-pointer h-9"
                @click="reserveMeeting">
        <a-iconfont type="icon-yuyuehuiyi" class="text-base"/>
        预约会议
      </a-button>
    </div>
  </a-layout>
</template>

<script>

import plainCalendar from '../../Common/CommonCalendar';
import { MAIN } from '../../../router/constants';

export default {
  name       : 'CalendarNav',
  components : {
    plainCalendar,
  },
  data() {
    return {
      searchText : '',
    };
  },
  computed : {
    eventList() {
      return this.$model.calendar.formatCalendar || [];
    },
  },
  mounted() {
    this.$nextTick(() => {
      // TODO TMP
      // this.$refs.calendar.$children[0].$children[0].$children[0].$children[0].onToday();
    });
  },
  methods : {
    reserveMeeting() {
      this.$router.push(MAIN.CALENDAR_RESERVE);
    },
    getNoticeInfo(value) {
      let noticeInfo;

      if (this.eventList.some((e) => this.isDateMatched(e.startTime, value))) {
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
      this.$model.calendar.currentDateEvents = [];
      this.eventList.forEach((e) => {
        if (e.startTime.toDate() >= date.raw.toDate() || this.isDateMatched(e.startTime, date.raw)) {
          this.$model.calendar.currentDateEvents.push(...e.events);
        }
      });
    },
  },
  watch : {
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
