<template>
  <a-layout id="calendar-list" class="bg-white h-full">
    <div class="p-2 h-full bg-white">
      <div v-for="(event, index) in displaySchedules" :key="index"
           class="py-2 hover:bg-list-hover"
           :class="{
                  'bg-list-select': event.uuid === selectedSchedule.uuid,
                  'border-b': index !== displaySchedules.length - 1,
                  'bg-expired': event.status.isEnded && event.uuid !== selectedSchedule.uuid,
                  'bg-white': !event.status.isEnded,
               }">
        <div class="flex flex-col p-3 cursor-pointer"
             :class="{
               'border-l-4 border-l-indigo': event.status.isRunning,
             }"
             @click="clickCalendar(event)">
          <div class="text-sm flex w-full leading-none">
            <div class="flex flex-grow w-1">
              <span class="truncate"
                    :title="event.subject">{{event.subject}}</span>
            </div>
            <div class="ml-1 text-base text-indigo">
              <a-iconfont v-if="event.isRecurrence" :title="$t('schedule.cycleMeeting')" type="icon-xunhuanhuiyi"/>
              <a-iconfont v-if="event.isRTMP" :title="$t('schedule.live')" type="icon-zhibo" class="ml-3"/>
            </div>
          </div>
          <div class="mt-3 text-xs truncate">ID: {{event.number}}</div>
          <div class="mt-2 text-xs truncate">{{event.startTime}} - {{event.endTime}}</div>
        </div>
      </div>
      <div v-if="!displaySchedules || displaySchedules.length <= 0" class="h-full flex items-center justify-center">
        <common-empty class="text-grey" :text="$t('schedule.emptySchedule')"/>
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
  sketch : {
    ns    : 'schedule',
    props : [ 'selectedSchedule', 'displaySchedules' ],
  },
  mounted() {
  },
  methods : {
    clickCalendar(event) {
      this.selectedSchedule = event;
    },
  },
  watch : {
    displaySchedules(val, once) {
      if ((!once || once.length <= 0) && !this.selectedSchedule.planId) {
        this.selectedSchedule = this.displaySchedules[0] || {};
      }
      else if (!val || val.length <= 0) {
        this.selectedSchedule = {};
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
