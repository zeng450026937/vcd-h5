<template>
  <div id="member-list-item">
    <div class="flex h-14 items-center px-4">
      <div class="relative">
        <a-avatar class="bg-indigo">
          {{item.displayText.substr(-2, 2)}}
        </a-avatar>
        <template v-if="item.isSharing()">
          <div class="circle-inner"></div>
          <div class="circle-outer"></div>
        </template>
      </div>
      <div class="flex flex-col flex-grow ml-3">
        <span class="item-name">{{item.displayText + (item.isCurrentUser()?' ( 自己 )':'')}}</span>
        <span class="item-phone">{{item.phone === 'unauth-web-client' ? 'WebRTC' : item.phone}}</span>
      </div>
      <div v-if="!isOnHold && !isAudioApplicant">
        <a-iconfont :type="videoIcon.icon"
                    class="ml-4 text-base"
                    :class="{[`text-${videoIcon.color}`] : true,
                  [`cursor-${hasPermission ? 'pointer' : 'not-allowed'}`] : true,}"
                    @click="onVideoOperation()"/>
        <a-iconfont :type="audioIcon.icon"
                    class="ml-4 cursor-pointer text-base"
                    :class="{[`text-${audioIcon.color}`] : true,
                  [`cursor-${hasPermission ? 'pointer' : 'not-allowed'}`] : true,}"
                    @click="onAudioOperation()"/>
        <a-dropdown :trigger="['click']"
                    overlayClassName="member-list-popover">
          <a class="ant-dropdown-link" href="#">
            <a-iconfont v-if="hasPermission"
                        type="icon-gengduo"
                        class="ml-4 text-indigo cursor-pointer text-base"/>
          </a>
          <a-menu slot="overlay">
            <a-menu-item v-if="showSetPresenterItem" key="0" @click="setPresenter">
              <div class="h-8 px-3 w-full popover-content-item flex items-center">
                <span class="text-xs">{{setAsPresenterText}}</span>
              </div>
            </a-menu-item>
            <a-menu-item key="1" @click="setSpeaker">
              <div class="h-8 px-3 w-full popover-content-item flex items-center">
                <span class="text-xs">{{setAsSpeakerText}}</span>
              </div>
            </a-menu-item>
            <a-menu-item v-if="showSetWaitItem" key="2" @click="setWaiting">
              <div class="h-8 px-3 w-full popover-content-item flex items-center">
                <span class="text-xs">设为等待</span>
              </div>
            </a-menu-item>
            <a-menu-item key="3" @click="setMute">
              <div class="h-8 px-3 w-full popover-content-item flex items-center">
                <span class="text-xs">{{setMuteText}}</span>
              </div>
            </a-menu-item>
            <a-menu-item v-if="currentIsPresenter" key="4" @click="showDeviceInfo">
              <div class="h-8 px-3 w-full popover-content-item flex items-center">
                <span class="text-xs">设备详情</span>
              </div>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
      <div v-else-if="currentIsPresenter">
        <a-iconfont type="icon-tongguo" class="ml-4 text-base text-indigo cursor-pointer" @click="handleApply(true)"/>
        <a-iconfont type="icon-yichu" class="ml-4 text-base text-red cursor-pointer" @click="handleApply(false)"/>
      </div>
    </div>
    <div v-if="isShowDeviceInfo"
         class="flex flex-col w-full bg-grey-lightest"
         style="height: 180px;">
      <div>
        <div class="flex h-7 items-center border-b px-4 text-xs leading-tight">
          <span>终端类型：</span>
          <div class="flex flex-grow w-1 truncate">
            <span class="truncate">Yealink VC Desktop</span>
          </div>
          <a-iconfont type="icon-guanbi" class="text-base cursor-pointer text-black-lightest"
                      @click="isShowDeviceInfo = false"></a-iconfont>
        </div>
      </div>
      <div class="w-full h-full flex px-4 py-2 text-xs border-b">
        <div class="flex flex-col w-1/3 justify-between">
          <span class="opacity-0">/</span>
          <span>带宽</span>
          <span>分辨率</span>
          <span>帧率</span>
          <span>编码率</span>
        </div>
        <div class="flex flex-col w-1/3 justify-between">
          <span>接收</span>
          <span>312kb/s</span>
          <span>1280x720</span>
          <span>30fps</span>
          <span>H.264</span>
        </div>
        <div class="flex flex-col w-1/3 justify-between">
          <span>发送</span>
          <span>312kb/s</span>
          <span>1280x720</span>
          <span>30fps</span>
          <span>H.264</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name  : 'MemberListItem',
  props : {
    item : {
      type : Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      isShowDeviceInfo : false,
    };
  },
  computed : {
    currentIsPresenter() { // current => the current login user
      return this.$model.conference.isPresenter;
    },
    isOnHold() {
      return this.item.isOnHold();
    },
    isAudioApplicant() {
      return this.item.isAudioApplicant();
    },
    hasPermission() {
      return (this.currentIsPresenter && !this.item.isOrganizer()) || this.item.isCurrentUser();
    },
    audioIcon() {
      const iconMap = {
        block      : { icon: 'icon-maikefengjinyong', color: 'red' },
        unblock    : { icon: 'icon-maikefeng', color: 'indigo' },
        unblocking : { icon: 'icon-maikefeng', color: 'blue' },
        hand       : { icon: 'icon-maikefeng', color: 'indigo' },
      };
      const iconStatus = iconMap[this.$model.conference.getUserAudioStatus(this.item)];

      if (!this.hasPermission) iconStatus.color = 'grey';
      
      return iconStatus;
    },

    videoIcon() {
      const iconMap = {
        unblock : { icon: 'icon-shexiangtou', color: 'indigo' },
        block   : { icon: 'icon-shexiangtoujinyong', color: 'red' },
      };
      const iconStatus = iconMap[this.$model.conference.getUserVideoStatus(this.item)];

      if (!this.hasPermission) iconStatus.color = 'grey';
      
      return iconStatus;
    },
    setAsPresenterText() {
      if (this.item.isPresenter() && !this.item.isOrganizer()) {
        return '设为访客';
      }

      return '设为主持人';
    },
    setAsSpeakerText() {
      if (this.item.isDemonstrator()) {
        return '取消演讲';
      }

      return '设为演讲者';
    },
    showSetPresenterItem() {
      return this.currentIsPresenter && !this.item.isOrganizer();
    },
    showSetWaitItem() {
      return this.currentIsPresenter && !this.item.isPresenter();
    },
    setMuteText() {
      const status = this.item.getAudioFilter().egress['#text'] || 'unblock';

      return status === 'unblock' ? '闭音' : '取消闭音';
    },
  },
  methods : {
    onAudioOperation() {
      if (!this.hasPermission) return;
      if (this.item.isCurrentUser()) {
        this.$model.conference.toggleAudio();

        return;
      }
      const status = this.$model.conference.getUserAudioStatus(this.item);

      if (status === 'unblocking') {
        this.$model.conference.updateAudioStatus(this.item, true);

        return;
      }
      const ingress = status !== 'unblock';

      this.$model.conference.updateAudioStatus(this.item, ingress);
    },
    onVideoOperation() {
      if (!this.hasPermission) return;
      if (this.item.isCurrentUser()) {
        this.$model.conference.toggleVideo();

        return;
      }
      const ingress = this.$model.conference.getUserVideoStatus(this.item) !== 'unblock';

      this.$model.conference.updateVideoStatus(this.item, ingress);
    },
    setPresenter() {
      if (this.item.isPresenter() && !this.item.isOrganizer()) {
        this.item.setPermission('attendee');
      }
      else {
        this.item.setPermission('presenter');
      }
    },
    setSpeaker() {
      this.item.setDemonstrator(!this.item.isDemonstrator());
    },
    setWaiting() {
      this.item.hold();
    },
    setMute() {
      const status = this.item.getAudioFilter().egress['#text'] || 'unblock';
      const egress = !(status === 'unblock');

      this.item.setAudioFilter({
        egress,
      });
    },
    handleApply(status) {
      if (this.isAudioApplicant) { // 处理发言申请
        this.$model.conference.updateAudioStatus(this.item, status);
      }
      else { //  处理入会申请
        const { lobby } = this.$rtc.conference.conference;

        if (status) {
          lobby.allow(this.item.entity);
        }
        else {
          lobby.refuse(this.item.entity);
        }
      }
    },
    showDeviceInfo() { // 显示设备详情
      this.isShowDeviceInfo = true;
    },
  },
};
</script>

<style lang="less">
  #member-list-item {
    .item-name {
      font-size: 14px;
      color: #151515;
      line-height: 14px;
    }

    .item-phone {
      font-size: 12px;
      color: #777777;
      line-height: 12px;
      margin-top: 6px;
    }

    .circle-inner {
      position: absolute;
      border: 1px solid #4a5fc4;
      height: 35px;
      width: 35px;
      top: 50%;
      left: 50%;
      border-radius: 50%;
      transform: translate(-50%, -50%);
    }

    .circle-outer {
      position: absolute;
      border: 1px solid #4a5fc4;
      height: 39px;
      width: 39px;
      top: 50%;
      left: 50%;
      border-radius: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .member-list-popover {

    .ant-dropdown-content {
      padding: 4px 0;
      width: 160px;

      .ant-dropdown-menu-item {
        cursor: pointer;
        padding: 0;

        &:hover {
          background: #E1E5F2;
        }

        .ant-slider-rail, .ant-slider-track, .ant-slider-step {
          height: 2px;
        }

        .ant-slider-handle {
          width: 12px;
          height: 12px;
        }
      }
    }
  }
</style>
