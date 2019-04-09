<template>
  <a-modal
      :visible="visible"
      style="top: 70px;left: 32px"
      :getContainer="getContainer"
      :width=780
      :closable=false
      @ok="handleShare"
      @cancel="handleCancel"
      wrapClassName="screen-share-modal"
  >
    <div class="h-14 flex items-center justify-center" slot="footer">
      <div class="absolute pin-t pin-l ml-5 h-full">
        <div class="text-left flex flex-col justify-center h-full">
          <div>
            <a-checkbox class="text-xs">
              共享电脑声音
            </a-checkbox>
          </div>
          <div class="flex items-center mt-1">
            <a-checkbox class="text-xs" :checked="shareSmoothMode" @change="shareSmoothMode = !shareSmoothMode">
              视频流畅度优先
            </a-checkbox>
            <a-iconfont type="icon-tishi" class="text-indigo text-base ml-2"/>
          </div>
        </div>
      </div>
      <a-button key="submit"
                type="primary"
                :disabled="!selectedWindow.id"
                @click="handleShare">
        确定
      </a-button>
      <a-button key="back" @click="handleCancel" class="ml-4">取消</a-button>
    </div>
    <div class="flex flex-col">
      <div class="flex justify-center items-center h-12 border-b">
        <span class="text-base leading-loose text-black">选择一个您想要共享的窗口或程序</span>
      </div>


      <div class="flex flex-col overflow-y-auto"
           style="padding-left:30px; padding-right: 30px; padding-top: 10px ;height: 424px">

        <div class="flex flex-wrap">
          <div class="text-center hover:border hover:border-indigo"
               style="width: 178px;height: 140px;padding: 10px;"
               v-for="item in windowList" :key="item.id"
               :class="{'border border-indigo': selectedWindow.id === item.id}">
            <div class="flex justify-center h-full w-full">
              <div class="rounded w-full h-full cursor-pointer hover:text-indigo">
                <div class="flex flex-col justify-center items-center h-full"
                     @click="selectWindow(item)">
                  <img
                      :src="item.url"
                      style="width: 160px;height: 90px;border: 1px solid #ccc;"
                  />
                  <div class="truncate w-full mt-2">
                    <span class="truncate leading-normal">{{item.name}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  </a-modal>
</template>

<script>

export default {
  name  : 'ScreenShareModal',
  props : {
    source : {
      type    : String,
      default : 'conference', // conference call
    },
    getContainer : {
      type    : Function,
      default : () => document.body,
    },
  },
  data() {
    return {
      visible         : false,
      screenList      : [],
      applicationList : [],
      timer           : null,
      selectedWindow  : {},
    };
  },
  sketch : {
    ns    : 'setting',
    props : [ 'shareSmoothMode' ],
  },

  computed : {
    share() {
      return this.$model.conference.share;
    },
    windowList() {
      return this.share.windowList;
    },
  },
  mounted() {
    if (this.windowList.length > 0) {
      this.selectedWindow = this.windowList[0];
    }
  },
  methods : {
    selectWindow(item) {
      this.selectedWindow = item;
    },
    handleCancel() {
      this.visible = false;
    },
    handleShare() {
      if (!this.selectedWindow.id) return;
      // 分享辅流
      this.$rtc.media.selectScreen(
        this.selectedWindow.id, false /* audio */, this.shareSmoothMode /* smooth mode */
      )
        .then((val) => {
          this.visible = false;

          if (this.source === 'conference') {
            return this.$rtc.conference.shareChannel.connect();
          }
          else {
            return this.$rtc.call.share.connect('send');
          }
        });
    },
    onOpen() {
      this.share.getSources();
      this.timer = setInterval(() => this.share.getSources(), 3000);
    },
  },
  watch : {
    visible(val) {
      if (val) {
        this.onOpen();
      }
      else {
        clearInterval(this.timer);
      }
    },
  },
};
</script>
<style lang="less">
  .screen-share-modal {
    .ant-modal-body {
      padding: 0;
      .ant-tabs-top-bar {
        margin: 0;
      }
    }
    .ant-modal-footer {
      position: relative;
      text-align: center;
      padding: 0;
    }
    .inviting-tabs{
      .ant-tabs-nav-scroll {
        text-align: center;
      }
    }
  }
</style>
