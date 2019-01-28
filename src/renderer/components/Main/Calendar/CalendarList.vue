<template>
  <a-layout id="calendar-list" class="bg-white h-full">
    <div class="px-2">
      <div v-for="(event, index) in eventList" :key="index" class="mt-2">
        <div class="flex flex-col p-3
                    cursor-pointer rounded border hover:border-indigo"
             :class="{
               'border-indigo': event.scheduleId === currentEvent.scheduleId,
               'bg-grey-lighter': meetingStatus(event.startTime, event.expiryTime).isEnded,
               'bg-white': !meetingStatus(event.startTime, event.expiryTime).isEnded,
               'border-l-4': meetingStatus(event.startTime, event.expiryTime).isRunning,
             }"
             @click="clickCalendar(event)">
          <div class="text-sm truncate">{{event.subject}}</div>
          <div class="mt-3 text-sm truncate">ID: {{event.conferenceNumber}}</div>
          <div class="mt-2 text-xs truncate">{{event.startTime}} - {{event.expiryTime}}</div>
        </div>
      </div>
    </div>
  </a-layout>
</template>

<script>
export default {
  name : 'CalendarList',
  data() {
    return {

    };
  },
  computed : {
    eventList() {
      return this.$model.calendar.currentDateEvents;
    },
    currentEvent() {
      return this.$model.calendar.currentEvent;
    },
  },
  methods : {
    meetingStatus(startTime, expiryTime) {
      const currentTime = new Date().getTime();

      startTime = new Date(startTime).getTime();
      expiryTime = new Date(expiryTime).getTime();

      const isPrepared = currentTime < startTime;
      const isEnded = currentTime >= expiryTime;
      const isRunning = !isPrepared && !isEnded;

      return { isPrepared, isEnded, isRunning };
    },
    clickCalendar(event) {
      this.$model.calendar.currentEvent = event;
    },
  },
};
</script>

<style scoped>

</style>
