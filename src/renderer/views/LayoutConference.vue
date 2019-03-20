<template>
  <a-layout id="layout-conference" class="h-full bg-transparent">
    <div class="flex h-full w-full">
      <router-view v-if="!isInAnonConference" name="sidebar"/>
      <div class="flex flex-col h-full w-full">
        <router-view name="header"/>
        <router-view/>
      </div>
    </div>
  </a-layout>
</template>

<script>
export default {
  name     : 'LayoutConference',
  computed : {
    isInAnonConference() {
      return this.$rtc.account.status === 'disconnected' && this.$rtc.conference.connected;
    },
  },
};
</script>
