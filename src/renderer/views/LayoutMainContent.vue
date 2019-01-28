<template>
  <a-layout id="main-contact" class="h-full">
    <a-row class="h-full">
      <a-col v-if="!hideNav" :span="6" class="h-full bg-grey-lighter">
        <component :is="currentNav"/>
      </a-col>
      <a-col :span="hideNav ? 24 : 18" class="h-full bg-white">
        <router-view/>
      </a-col>
    </a-row>
  </a-layout>
</template>

<script>
import MainNav from '../components/Main/MainNav.vue';
import CalendarNav from '../components/Main/Calendar/CalendarNav.vue';
import { MODULE_NAME, MAIN } from '../router/constants';

export default {
  name       : 'MainContact',
  components : {
    MainNav,
  },
  data() {
    return {
      currentNav : MainNav,
      hideNav    : false,
    };
  },
  computed : {
  },
  mounted() {
  },
  watch : {
    $route : {
      handler(val) {
        this.currentNav = val.meta.owner === MODULE_NAME.CALENDAR ? CalendarNav : MainNav;
        this.hideNav = val.path === MAIN.CALENDAR_RESERVE;
      },
      immediate : true,
    },
  },
};
</script>

<style scoped>

</style>
