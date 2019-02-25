<template>
  <div id="call-header" class="bg-indigo-darker h-9">
    <div class="px-4 flex h-full select-none">
      <div class="flex items-center flex-grow dragable w-1 my-1 mr-12">
        <template v-if="callStatus === 'connected'">
          <a-iconfont type="icon-tonghuabaohu" class="text-white text-base mr-4"/>
          <a-iconfont :type="`icon-wangluozhuangtai_${signal}`" class="text-white text-base mr-4"/>
          <span class="text-white text-xs leading-tight truncate mr-4">{{duration}}</span>
        </template>
        <span class="text-white text-xs leading-tight truncate">{{title}}</span>
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
  name : 'CallHeader',
  data() {
    return {
      targetUser : '',
      duration   : '00:00:00',
      signal     : 4,
    };
  },
  computed : {
    title() {
      const titleMap = {
        connecting   : `正在呼叫 ${this.userName}`,
        connected    : `与 ${this.userName} 通话中`,
        ringing      : `${this.userName} 正在来电`,
        disconnected : `与 ${this.userName} 的通话已结束`,
      };

      return titleMap[this.callStatus] || '当前通话已失效';
    },
    callStatus() {
      return this.$model.state.callStatus;
    },
    displayName() {
      const remoteIdentity = this.callStatus !== 'disconnected'
        ? this.$rtc.call.remoteIdentity
        || this.$rtc.call.incoming[0].remoteIdentity : null;

      return remoteIdentity && (remoteIdentity.display_name
        || remoteIdentity.uri.user);
    },
    userName() {
      return this.displayName || this.targetUser || '未知用户';
    },
  },
  mounted() {
  },
  destroyed() {
    if (this.durationTimer) clearInterval(this.durationTimer);
  },
  methods : {
    initSignal() {
      let checkInterval = 1; // 1 2 4 8 循环时长
      let checkTimes = 0;
      // 设置通话进行时间
      const callTime = new Date();

      this.durationTimer = setInterval(() => {
        const time = (new Date().getTime() - callTime.getTime()) / 1000;

        while (checkTimes++ === checkInterval) {
          this.$rtc.call.getStats().then((val) => {
            if (this.signal === val.quality) {
              checkInterval *= 2;
              checkInterval = (checkInterval * 2) % 15;
              checkTimes = 0;
            }
            this.signal = val.quality || '1';
          });
        }
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
  watch : {
    displayName(cur, once) {
      this.targetUser = cur || once;
    },
    callStatus : {
      handler(val) {
        if (val === 'connected') {
          this.initSignal();
        }
      },
      immediate : true,
    },
  },
};
</script>

<style scoped>

</style>
