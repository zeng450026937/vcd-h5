<template>
  <div id="conference-header" class="bg-indigo-darker h-9">
    <div class="px-4 flex h-full select-none">
      <div class="flex items-center flex-grow dragable w-1 my-1 mr-12">
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
const secondsToHms = (d) => {
  d = Number(d);
  const h = Math.floor(d / 3600);
  const m = Math.floor((d % 3600) / 60);
  const s = Math.floor(d % 3600 % 60);

  return `${(h < 10 ? '0' : '') + h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
};

export default {
  name : 'ConferenceHeader',
  data() {
    return {
      duration : '00:00:00',
      signal   : 1,
    };
  },
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
  },
  mounted() {
    this.initSignal();
  },
  destroyed() {
    if (this.durationTimer) clearInterval(this.durationTimer);
  },
  methods : {
    initSignal() {
      // 初始化信号
      this.$rtc.conference.getStats().then((val) => {
        this.signal = val.media.quality;
      });

      // 设置会议进行时间
      const meetTime = new Date();

      this.durationTimer = setInterval(() => {
        const time = (new Date().getTime() - meetTime.getTime()) / 1000;

        this.duration = secondsToHms(time);
      }, 1000);
    },
    clickMinimize() {
      this.$dispatch('sys.minimize');
    },
    clickMaximize() {
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
