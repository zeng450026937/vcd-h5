<template>
  <div id="conference-header" class="bg-indigo-darker h-9">
    <div class="px-4 flex h-full select-none">
      <div class="flex items-center flex-grow dragable w-1 mr-12">
        <a-icon type="safety" class="text-white text-base mr-4"/>
        <a-icon type="wifi" class="text-white text-base mr-4"/>
        <span class="text-white text-xs leading-tight truncate">{{subject}}（ID：{{conferenceId}}）</span>
      </div>
      <div class="flex items-center">
        <a-icon type="minus" class="text-sm mr-3 text-white hover:text-indigo no-dragable cursor-pointer"
                @click="clickMinimize"/>
        <a-icon type="border" class="text-sm mx-2 text-white hover:text-indigo no-dragable cursor-pointer"
                @click="clickMaximize"/>
        <a-icon type="close" class="text-sm ml-3 text-white hover:text-red no-dragable cursor-pointer"
                @click="clickClose"/>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name : 'ConferenceHeader',
  date() {
    return {
    };
  },
  computed: {
    description() {
      return this.$rtc.conference.information.description;
    },
    conferenceId() {
      return this.description.conferenceId;
    },
    subject() {
      return this.description.subject;
    }
  },
  methods : {
    clickMinimize() {

    },
    clickMaximize() {

    },
    clickClose() {

    },
  },
};
</script>

<style scoped>

</style>
