<template>
  <a-layout id="calendar-view" class="h-full w-full">
    <div class="flex flex-col h-full w-full">
      <div class="h-14">
        <div class="flex bg-white dragable h-full">
          <div class="flex items-center h-full px-4 text-base">
            <span>会议日程</span>
          </div>
          <div class="flex flex-grow"></div>
          <app-header/>
        </div>
      </div>
      <a-divider class="my-0"/>
      <a-row class="flex h-full m-4 border">
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
import AppHeader from '../MainHeader.vue';
import CalendarInfo from './CalendarInfo.vue';
import CalendarList from './CalendarList.vue';
import CalendarNav from './CalendarNav.vue';

export default {
  name       : 'CalendarView',
  components : {
    AppHeader,
    CalendarInfo,
    CalendarList,
    CalendarNav,
  },
  computed : {
  },
};
</script>

