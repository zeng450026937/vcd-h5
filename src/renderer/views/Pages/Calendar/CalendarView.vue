<template>
  <a-layout id="calendar-view" class="h-full w-full">
    <div class="flex flex-col h-full w-full">
      <main-header :title="$t('schedule.meetingSchedule')"/>
      <template v-if="currentDateEvents && currentDateEvents.length > 0">
      <a-row class="flex h-full m-4 border bg-white">
        <a-col :span="9" class="h-full overflow-y-auto border-r">
          <calendar-list/>
        </a-col>
        <a-col :span="15" class="h-full overflow-y-auto">
          <calendar-info/>
        </a-col>
      </a-row>
      </template>
      <template v-else>
        <div class="flex h-full w-full justify-center items-center m-4 border bg-white">
          <common-empty class="text-grey" :text="$t('schedule.emptySchedule')"/>
        </div>
      </template>
    </div>
  </a-layout>
</template>

<script>
import MainHeader from '../../../components/Main/MainHeader.vue';
import CalendarInfo from '../../../components/Main/Calendar/CalendarInfo.vue';
import CalendarList from '../../../components/Main/Calendar/CalendarList.vue';
import CommonEmpty from '../../../components/Shared/CommonEmpty.vue';

export default {
  name       : 'CalendarView',
  components : {
    MainHeader,
    CalendarInfo,
    CalendarList,
    CommonEmpty,
  },
  computed : {
    currentDateEvents() {
      return this.$model.schedule.currentDateEvents;
    }
  },
};
</script>
