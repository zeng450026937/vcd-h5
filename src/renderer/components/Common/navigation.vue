<template>
  <div v-show="!searchText">
    <calendar-nav v-if="useCalendar"/>
    <div v-else>
      <div v-for="(nav, index) in navs"
           class="flex items-center h-12 px-4 cursor-pointer"
           :class="{'bg-list-select':currentNav === nav,'hover:bg-list-hover': currentNav !== nav}"
           :key="index"
           @click="handleClick(nav)">
        <a-iconfont :type="nav.icon" class="text-base text-indigo-dark"></a-iconfont>
        <span class="ml-3 text-sm">{{nav.text}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import CalendarNav from '../Main/Calendar/CalendarNav.vue';

export default {
  name   : 'navigation',
  sketch : {
    ns    : 'main',
    props : [ 'searchText', 'currentNav' ],
  },
  props : {
    useCalendar : {
      type    : Boolean,
      default : false,
    },
    navs : {
      type : Array,
      default() {
        return false;
      },
    },
    show : {
      type    : Boolean,
      default : false,
    },

  },
  components : {
    CalendarNav,
  },
  methods : {
    handleClick(nav) {
      this.$emit('nav-click', nav);
    },
  },
};
</script>

<style scoped>

</style>
