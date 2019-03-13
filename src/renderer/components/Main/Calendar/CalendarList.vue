<template>
  <a-layout id="calendar-list" class="bg-white h-full">
    <div class="px-2 h-full bg-white">
      <div v-for="(event, index) in eventList" :key="index" class="mt-2">
        <div class="flex flex-col p-3
                    cursor-pointer rounded border hover:border-indigo"
             :class="{
               'border-indigo': event.scheduleId === currentEvent.scheduleId,
               'bg-expired': event.status.isEnded,
               'bg-white': !event.status.isEnded,
               'border-l-4 border-l-indigo': event.status.isRunning,
             }"
             @click="clickCalendar(event)">
          <div class="text-sm flex w-full">
            <div class="flex flex-grow w-1">
              <span class="truncate">{{event.subject}}</span>
            </div>
            <div class="ml-1 text-base text-indigo">
              <a-iconfont v-if="event.isRecurrence" title="周期会议" type="icon-xunhuanhuiyi"/>
              <a-iconfont v-if="event.isLive" title="直播" type="icon-zhibo" class="ml-3"/>
            </div>
          </div>
          <div class="mt-3 text-xs truncate">ID: {{event.conferenceNumber}}</div>
          <div class="mt-2 text-xs truncate">{{event.startTime}} - {{event.expiryTime}}</div>
        </div>
      </div>
      <div v-if="!eventList || eventList.length <= 0" class="h-full flex items-center justify-center">
        <common-empty class="text-grey" text="暂未选择日程信息"/>
      </div>
    </div>
  </a-layout>
</template>

<script>
import CommonEmpty from '../../Shared/CommonEmpty.vue';

export default {
  name       : 'CalendarList',
  components : {
    CommonEmpty,
  },
  data() {
    return {

    };
  },
  computed : {
    eventList() {
      return this.$model.calendar.currentDateEvents;
    },
    currentEvent : {
      get() {
        return this.$model.calendar.currentEvent;
      },
      set(val) {
        this.$model.calendar.currentEvent = val;
      },
    },
  },
  mounted() {
  },
  methods : {
    clickCalendar(event) {
      this.$model.calendar.currentEvent = event;
    },
  },
  watch : {
    eventList(val, once) {
      if ((!once || once.length <= 0) && !this.currentEvent.scheduleId) {
        this.currentEvent = this.eventList[0] || {};
      }
      else if (!val || val.length <= 0) {
        this.currentEvent = {};
      }
    },
  },
};
</script>

<style lang="less">
  .border-l-indigo {
    border-left-color: #4a5fc4 !important;
  }
</style>
