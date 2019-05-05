<template>
  <a-modal
      :visible="visible"
      style="left: 32px"
      centered
      destroy-on-close
      :width=820
      :footer="null"
      wrapClassName="conference-statistics-modal"
      @cancel="visible = false"
  >
    <div class="flex flex-col">
      <div class="flex justify-center items-center h-12 border-b font-semibold">
        <a-iconfont type="icon-fuwuqi" class="text-base"/>
        <span class="text-base leading-loose text-black"
              style="margin-left: 10px">Yealink VC Desktop</span>
      </div>


      <div class="flex flex-col overflow-y-auto"
           style="padding:10px 30px; ;height: 476px">
        <div v-if="statistics.sectionInfo" class="flex flex-wrap h-full">
          <div v-for="sections in statistics.sectionInfo"
               :key="sections.title"
               class="w-1/2"
               style="padding: 10px">
            <div class="border h-full">
              <div class="h-8 border-b flex items-center px-5">
                <span class="w-2/5 font-semibold">{{sections.title}}</span>
                <span class="w-1/3">接收</span>
                <span class="w-1/3">发送</span>
              </div>
              <div class="flex flex-col px-5 py-1">
                <div v-for="(section, index) in sections.sections"
                     :key="index"
                     class="w-full flex text-xs leading-tight my-1">
                  <span class="w-2/5">{{section.name}}</span>
                  <span class="w-1/3">{{section.recv}}</span>
                  <span class="w-1/3">{{section.send}}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="w-1/2" style="padding: 10px">
              <div class="flex flex-col">
                <div v-for="(statistic, index) in statistics.statisticInfo"
                     :key="index"
                     class="h-8 border flex justify-between items-center px-5"
                     :class="{'mt-4': index !== 0}">
                  <span class="font-semibold">{{statistic.name}}</span>
                  <span class="text-xs">{{statistic.value}}</span>
                </div>
              </div>
          </div>
        </div>
        <div v-else class="flex h-full justify-center items-center">
          <a-spin />
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script>

export default {
  name  : 'ConferenceStatisticsModal',
  props : {
    content : {
      type    : String,
      default : 'conference', // conference call
      validator(val) {
        return [ 'conference', 'call' ].indexOf(val) !== -1;
      },
    },
  },
  data() {
    return {
      statistics  : {},
      staticTimer : null,
    };
  },
  computed : {
    visible : {
      get() {
        return this.$model[this.content].sketch.isStatisticsVisible;
      },
      set(val) {
        this.$model[this.content].sketch.isStatisticsVisible = val;
      },
    },
  },
  mounted() {
  },
  methods : {
    async getStats() {
      if (this.content === 'conference') {
        await this.$rtc.conference.getStats().then((val) => {
          this.statistics = this.$model.conference.statistics.getStatistics(val);
        });
      }
      else if (this.content === 'call') {
        await this.$rtc.call.getStats().then(async(media) => {
          await this.$rtc.call.share.channel.getStats().then((share) => {
            this.statistics = this.$model.conference.statistics.getStatistics({ media, share });
          });
        });
      }
    },
  },
  watch : {
    visible(val) {
      if (val) {
        this.staticTimer = setInterval(async() => {
          await this.getStats();
        }, 1000);
      }
      else if (this.staticTimer) {
        clearInterval(this.staticTimer);
        this.statistics = {};
      }
    },
  },
};
</script>
<style lang="less">
  .conference-statistics-modal {
    .ant-modal-close-x {
      width: 48px;
      height: 48px;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .ant-modal-body {
      padding: 0;
      .ant-tabs-top-bar {
        margin: 0;
      }
    }
  }
</style>
