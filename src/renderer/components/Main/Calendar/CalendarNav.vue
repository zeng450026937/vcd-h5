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
            <a-badge class="event-pointer" :status="getNoticeType(current)" />
          </div>
        </template>
      </plain-calendar>
      <div class="text-center text-xs text-indigo">
        <span class="cursor-pointer" @click="onToday">{{$t('schedule.backToday')}}</span>
      </div>
    </div>
    <div class="flex flex-col items-center mt-4 px-3">
      <a-button type="primary" block
                class="h-9"
                @click="reserveMeeting">
        <a-iconfont type="icon-yuyuehuiyi" class="text-base"/>
        {{$t('schedule.reservation')}}
      </a-button>
    </div>
  </a-layout>
</template>

<script>

import moment from 'moment';
import plainCalendar from '../../Common/CommonCalendar';
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
    schedules() {
      return this.$model.schedule.schedules || [];
    },
    selectedDate : {
      get() {
        return this.$model.schedule.selectedDate || Date.now();
      },
      set(val) {
        this.$model.schedule.selectedDate = val;
      },
    },
  },
  methods : {
    disabledStartDate(startValue) {
      startValue = moment(`${startValue.format('YYYY-MM-DD')} 00:00`);
      const preWeek = new Date().setHours(-8 * 24);
      const afterWeek = new Date().setHours(7 * 24);

      return !startValue.isBetween(preWeek, afterWeek);
    },
    onToday() {
      this.$refs.calendar.onToday();
    },
    reserveMeeting() {
      this.$router.push({ name: 'reservation' });
    },
    getNoticeType(value) {
      if (value < new Date().setHours(-8 * 24) || value > new Date().setHours(7 * 24)) return;

      if (this.schedules.some((s) => value.isSame(s.startTime, 'day'))) {
        return 'error';
      }
    },
    selectDate(date) {
      this.selectedDate = date.raw.toDate().getTime();
      this.$model.schedule.displaySchedules = [];
      this.schedules.forEach((schedule) => {
        if (schedule.endTime >= this.selectedDate || schedule.startTime >= this.selectedDate) {
          this.$model.schedule.displaySchedules.push(schedule);
        }
      });
    },
  },
  mounted() {
    const { planId } = this.$route.query;

    if (this.$route.name === 'schedule' && planId) {
      this.onToday();
    }
  },
  watch : {
    schedules : {
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
