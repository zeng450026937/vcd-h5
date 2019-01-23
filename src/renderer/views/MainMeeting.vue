<template>
  <a-layout id="main-meeting" class="h-full">
    <a-row class="h-full">
      <a-col :span="6" class="h-full bg-grey-lighter">
        <meeting-nav/>
      </a-col>
      <a-col :span="18" class="h-full bg-white">
        <router-view/>
      </a-col>
    </a-row>
  </a-layout>
</template>

<script>

import MeetingNav from '../components/main/MainNav.vue';

export default {
  name       : 'MainMeeting',
  components : {
    MeetingNav,
  },
  mounted() {
    this.$router.push('/main/meeting/instance');
  },
};
</script>

<style scoped>

</style>
