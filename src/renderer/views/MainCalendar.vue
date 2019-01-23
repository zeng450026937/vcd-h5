<template>
  <a-layout id="main-meeting" class="h-full">
    <a-row class="h-full">
      <a-col v-if="!hideNav" :span="6" class="h-full bg-grey-lighter">
        <calendar-nav/>
      </a-col>
      <a-col :span="hideNav ? 24 : 18" class="h-full bg-white overflow-auto">
        <router-view/>
      </a-col>
    </a-row>
  </a-layout>
</template>

<script>

import CalendarNav from '../components/calendar/CalendarNav.vue';

export default {
  name       : 'MainCalendar',
  components : {
    CalendarNav,
  },
  data() {
    return {
      hideNav : false,
    };
  },
  mounted() {
    this.$router.push('/main/calendar/view');
  },
  computed : {
    currentRoute() {
      return this.$router.currentRoute;
    },
  },
  watch : {
    currentRoute(val) {
      console.warn(val);
    },
    $route : {
      handler(val) {
        this.hideNav = !!val.path.endsWith('reserve');
      },
      immediate : true,
    },
  },
};
</script>

<style scoped>

</style>
