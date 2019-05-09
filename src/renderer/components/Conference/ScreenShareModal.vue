<template>
  <a-modal
      :visible="visible"
      style="top: 70px;left: 32px"
      :getContainer="getContainer"
      :width=780
      :closable=false
      destroy-on-close
      @ok="handleShare"
      @cancel="handleCancel"
      wrapClassName="screen-share-modal"
  >
    <div class="h-14 flex items-center justify-center" slot="footer">
      <div class="absolute pin-t pin-l ml-5 h-full">
        <div class="text-left flex flex-col justify-center h-full">
          <div>
            <a-checkbox class="text-xs">
              {{$t('conversation.share.shareAudio')}}
            </a-checkbox>
          </div>
          <div class="flex items-center mt-1">
            <a-checkbox class="text-xs" :checked="shareSmoothMode" @change="shareSmoothMode = !shareSmoothMode">
              {{$t('conversation.share.preferVideoFluency')}}
            </a-checkbox>
            <a-tooltip placement="right" >
              <template slot="title">
                <span>{{$t('conversation.share.preferVideoFluencyTips')}}</span>
              </template>
              <a-iconfont type="icon-tishi" class="text-indigo text-base ml-2"/>
            </a-tooltip>
          </div>
        </div>
      </div>
      <a-button key="submit"
                type="primary"
                :loading="isSwitching"
                :disabled="!selectedWindow.id"
                @click="handleShare">
        {{$t('common.controls.ensure')}}
      </a-button>
      <a-button key="back"
                @click="handleCancel"
                class="ml-4">{{$t('common.controls.cancel')}}</a-button>
    </div>
    <div class="flex flex-col">
      <div class="flex justify-center items-center h-12 border-b">
        <span class="text-base leading-loose text-black">{{$t('conversation.share.title')}}</span>
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
      validator(val) {
        return [ 'conference', 'call' ].indexOf(val) !== -1;
      },
    },
    getContainer : {
      type    : Function,
      default : () => document.body,
    },
  },
  data() {
    return {
      screenList      : [],
      applicationList : [],
      timer           : null,
    };
  },
  sketch : [
    {
      ns    : 'setting',
      props : [ 'shareSmoothMode' ],
    },
    {
      ns    : 'conference.share',
      props : [ 'selectedWindow', 'isSwitching' ],
    },
  ],

  computed : {
    share() {
      return this.$model.conference.share;
    },
    windowList() {
      return this.share.windowList.filter((window) => window.name !== 'shareControls');
    },
    visible : {
      get() {
        return this.$model[this.source].sketch.isSharingVisible;
      },
      set(val) {
        this.$model[this.source].sketch.isSharingVisible = val;
      },
    },
    localScreenStream() {
      return this.$rtc.conference.shareChannel.localStream;
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
    async handleShare() {
      if (!this.selectedWindow.id) return;

      this.isSwitching = true;

      // 分享辅流
      this.$rtc.media.selectScreen(
        this.selectedWindow.id, false /* audio */, this.shareSmoothMode /* smooth mode */
      )
        .then((val) => {
          // TODO ///
          setTimeout(() => {
            if (this.localScreenStream) {
              this.isSwitching = false;
              this.visible = false;
            }
            else if (this.source === 'conference') {
              return this.$rtc.conference.shareChannel.connect().then(() => {
                this.isSwitching = false;
                this.visible = false;
              }).catch((e) => {});
            }
            else {
              return this.$rtc.call.share.connect('send').then(() => {
                this.isSwitching = false;
                this.visible = false;
              });
            }
          }, 500);
        });
    },
    onOpen() {
      this.share.getSources();
      this.timer = setInterval(() => {
        this.share.getSources();
      }, 3000);
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
    // windowList(val) {
    //   const PPT_REG = /^(.*\.pptx?) - PowerPoint$/;
    //
    //   if (PPT_REG.test(this.selectedWindow && this.selectedWindow.name)) {
    //     const pptName = RegExp.$1;
    //     const FULL_PPT_REG = /^PowerPoint - \[(.*)\]/;
    //
    //     val.forEach((win) => {
    //       if (FULL_PPT_REG.test(win.name)) {
    //         if (pptName === RegExp.$1) {
    //           this.$rtc.media.selectScreen(win.id, false, this.shareSmoothMode);
    //         }
    //       }
    //     });
    //   }
    // },
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
