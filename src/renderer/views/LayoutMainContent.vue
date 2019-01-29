<template>
  <a-layout id="main-contact" class="h-full">
    <div class="flex h-full">
      <div v-if="!hideNav" class="h-full bg-grey-lighter">
        <component style="width: 240px;" :is="currentNav"/>
      </div>
      <div class="flex w-full h-full bg-white">
        <router-view/>
      </div>
    </div>
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
