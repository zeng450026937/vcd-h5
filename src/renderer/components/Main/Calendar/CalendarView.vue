<template>
  <a-layout id="calendar-view" class="h-full w-full">
    <div class="flex flex-col h-full w-full">
      <!--<app-header title="会议日程"/>-->
      <main-header title="会议日程"/>
      <a-row class="flex h-full m-4 border bg-white">
        <a-col :span="9" class="h-full overflow-y-auto border-r">
          <calendar-list/>
        </a-col>
        <a-col :span="15" class="h-full overflow-y-auto">
          <calendar-info/>
        </a-col>
      </a-row>
    </div>
  </a-layout>
</template>

<script>
import MainHeader from '../MainHeader.vue';
import CalendarInfo from './CalendarInfo.vue';
import CalendarList from './CalendarList.vue';
import CalendarNav from './CalendarNav.vue';

export default {
  name       : 'CalendarView',
  components : {
    MainHeader,
    CalendarInfo,
    CalendarList,
    CalendarNav,
  },
  computed : {
  },
};
</script>

