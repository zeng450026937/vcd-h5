<template>
  <div id="conference-header" class="bg-indigo-darker h-9">
    <div class="px-4 flex h-full select-none">
      <div class="flex items-center flex-grow dragable my-1 mr-12" @dblclick="maxAppContent">
        <a-iconfont type="icon-tonghuabaohu"
                    title="通话保护"
                    class="text-white text-base no-dragable mr-4"/>
        <a-iconfont :type="`icon-wangluozhuangtai_${signal}`"
                    title="信号"
                    class="text-white no-dragable text-base mr-4 cursor-pointer"/>
        <span class="text-white text-xs leading-tight truncate mr-4">{{duration}}</span>
        <div class="w-1 flex flex-grow">
          <span class="text-white text-xs leading-tight truncate">{{subject}}（ID：{{conferenceId}}）</span>
        </div>
      </div>
      <div class="flex items-center">
        <a-iconfont type="icon-zuixiaohua"
                    title="最小化"
                    class="text-base mr-3 text-white hover:text-indigo no-dragable cursor-pointer"
                    @click="clickMinimize"/>
        <a-iconfont type="icon-zuidahua" class="text-base mx-1 text-white hover:text-indigo no-dragable cursor-pointer"
                    title="最大化"
                    @click="clickMaximize"/>
        <a-iconfont type="icon-guanbi" class="text-base ml-3 text-white hover:text-red no-dragable cursor-pointer"
                    title="关闭"
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
  methods : {
    maxAppContent() {
      console.warn('MAX');
    },
    clickMinimize() {
      this.$dispatch('sys.minimize');
    },
    clickMaximize() {
      // screenfull.toggle(document.getElementById('app'));
      this.$dispatch('sys.maximize');
    },
    clickClose() {
      this.$dispatch('sys.close');
    },
  },
};
</script>

<style scoped>

</style>
