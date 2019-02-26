<template>
  <div id="conference-header" class="bg-indigo-darker h-9">
    <div class="px-4 flex h-full select-none">
      <div class="flex items-center flex-grow dragable w-1 my-1 mr-12" @dblclick="maxAppContent">
        <a-iconfont type="icon-tonghuabaohu" class="text-white text-base mr-4"/>
        <a-iconfont :type="`icon-wangluozhuangtai_${signal}`"
                    class="text-white no-dragable text-base mr-4 cursor-pointer"/>
        <span class="text-white text-xs leading-tight truncate mr-4">{{duration}}</span>
        <span class="text-white text-xs leading-tight truncate">{{subject}}（ID：{{conferenceId}}）</span>
      </div>
      <div class="flex items-center">
        <a-iconfont type="icon-zuixiaohua"
                    class="text-base mr-3 text-white hover:text-indigo no-dragable cursor-pointer"
                    @click="clickMinimize"/>
        <a-iconfont type="icon-zuidahua" class="text-base mx-1 text-white hover:text-indigo no-dragable cursor-pointer"
                    @click="clickMaximize"/>
        <a-iconfont type="icon-guanbi" class="text-base ml-3 text-white hover:text-red no-dragable cursor-pointer"
                    @click="clickClose"/>
      </div>
    </div>
  </div>
</template>

<script>
import screenfull from 'screenfull';

export default {
  name     : 'ConferenceHeader',
  computed : {
    description() {
      return this.$rtc.conference.information.description;
    },
    conferenceId() {
      return this.description.conferenceId;
    },
    subject() {
      return this.description.subject;
    },
    duration() {
      return this.$model.confState.duration;
    },
    signal() {
      return this.$model.confState.signal;
    },
  },
  mounted() {
  },
  destroyed() {
    if (this.durationTimer) clearInterval(this.durationTimer);
  },
  methods : {
    maxAppContent() {
      console.warn('MAX');
    },
    clickMinimize() {
      this.$dispatch('sys.minimize');
    },
    clickMaximize() {
      screenfull.toggle(document.getElementById('app'));
      // this.$dispatch('sys.maximize');
    },
    clickClose() {
      this.$dispatch('sys.close');
    },
  },
};
</script>

<style scoped>

</style>
