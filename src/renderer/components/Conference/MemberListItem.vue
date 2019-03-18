<template>
  <div id="member-list-item">
    <div class="flex h-14 items-center px-4 cursor-pointer"
         :class="{'member-selected': isSelected}"
         @click="selectMember">
      <div class="relative">
        <a-avatar>
          {{item.displayText.substr(-2, 2)}}
        </a-avatar>
        <template v-if="item.isSharing()">
          <div class="circle-inner"></div>
          <div class="circle-outer"></div>
        </template>
      </div>
      <div class="flex flex-col flex-grow w-1 ml-3">
        <span class="item-name truncate">
          <span v-if="filterText && displayName.indexOf(filterText) > -1" class="flex">
          {{displayName.substr(0, displayName.indexOf(filterText))}}
            <span class="text-indigo">{{filterText}}</span>
            {{displayName.substr(displayName.indexOf(filterText) + filterText.length)}}
          </span>
          <span v-else>{{displayName}}</span>
        </span>
        <span class="item-phone flex">
          <span v-if="displayPhone.indexOf(filterText) > -1" class="flex">
          {{displayPhone.substr(0, displayPhone.indexOf(filterText))}}
            <span class="text-indigo">{{filterText}}</span>
            {{displayPhone.substr(displayPhone.indexOf(filterText) + filterText.length)}}
          </span>
          <span v-else>{{displayPhone}}</span>
        </span>
      </div>
      <div v-if="!isApplyGroup">
        <a-iconfont :type="videoIcon.icon"
                    :title="videoIcon.title"
                    class="ml-4 text-base"
                    :class="{[`text-${videoIcon.color}`] : true,
                  [`cursor-${hasPermission ? 'pointer' : 'not-allowed'}`] : true,}"
                    @click="onVideoOperation()"/>
        <a-iconfont :type="audioIcon.icon"
                    :title="audioIcon.title"
                    class="ml-4 cursor-pointer text-base"
                    :class="{[`text-${audioIcon.color}`] : true,
                  [`cursor-${hasPermission ? 'pointer' : 'not-allowed'}`] : true,}"
                    @click="onAudioOperation()"/>
        <a-dropdown :trigger="['click']"
                    overlayClassName="member-list-popover">
          <a class="ant-dropdown-link" href="#">
            <a-iconfont v-if="hasPermission"
                        title="更多"
                        type="icon-gengduo1"
                        class="ml-4 text-indigo cursor-pointer text-base"/>
          </a>
          <a-menu slot="overlay">
            <a-menu-item v-if="showSetPresenterItem" key="0" @click="setPresenter">
              <div class="h-8 px-3 w-full popover-content-item flex items-center">
                <span class="text-xs">{{setAsPresenterText}}</span>
              </div>
            </a-menu-item>
            <a-menu-item v-if="showSetWaitItem" key="2" @click="setWaiting">
              <div class="h-8 px-3 w-full popover-content-item flex items-center">
                <span class="text-xs">设为等待</span>
              </div>
            </a-menu-item>
            <a-menu-item v-if="currentIsPresenter || item.isCurrentUser()" key="4" @click="showDeviceInfo">
              <div class="h-8 px-3 w-full popover-content-item flex items-center">
                <span class="text-xs">设备详情</span>
              </div>
            </a-menu-item>

            <a-menu-item v-if="currentIsPresenter" key="5" @click="kickFromMeeting">
              <div class="h-8 px-3 w-full popover-content-item flex items-center">
                <span class="text-xs">移出会议</span>
              </div>
            </a-menu-item>

          </a-menu>
        </a-dropdown>
      </div>
      <div v-else-if="currentIsPresenter">
        <a-iconfont type="icon-tongguo"
                    class="ml-4 text-base text-indigo cursor-pointer"
                    :title="isAudioApplicant ? '允许发言' : '允许入会'"
                    @click="handleApply(true)"/>
        <a-iconfont type="icon-yichu"
                    class="ml-4 text-base text-red cursor-pointer"
                    :title="isAudioApplicant ? '拒绝发言' : '拒绝入会'"
                    @click="handleApply(false)"/>
      </div>
    </div>
    <div v-if="isShowDeviceInfo"
         class="flex flex-col w-full bg-under-painting"
         style="height: 180px;">
      <div>
        <div class="flex h-8 items-center border-b px-4 text-xs leading-tight">
          <span>终端类型：</span>
          <div class="flex flex-grow w-1 truncate">
            <span class="truncate">Yealink VC Desktop</span>
          </div>
          <a-iconfont type="icon-shuaxin"
                      title="刷新设备信息"
                      class="text-base cursor-pointer text-black9"
                      :spin="isUpdating"
                      @click="updateDeviceInfo"></a-iconfont>
          <a-iconfont type="icon-guanbi"
                      title="关闭设备详情"
                      class="text-base cursor-pointer text-black9 ml-4"
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
          <span>{{deviceInfo.recv.bitrate}}</span>
          <span>{{deviceInfo.recv.ratio}}</span>
          <span>{{deviceInfo.recv.frameRate}}</span>
          <span>{{deviceInfo.recv.codec}}</span>
        </div>
        <div class="flex flex-col w-1/3 justify-between">
          <span>发送</span>
          <span>{{deviceInfo.send.bitrate}}</span>
          <span>{{deviceInfo.send.ratio}}</span>
          <span>{{deviceInfo.send.frameRate}}</span>
          <span>{{deviceInfo.send.codec}}</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import prettyBytes from 'pretty-bytes';

export default {
  name  : 'MemberListItem',
  props : {
    item : {
      type : Object,
      default() {
        return {};
      },
    },
    group : { // presenter visitor waiting audioApply
      type     : String,
      required : true,
    },
  },
  data() {
    return {
      isShowDeviceInfo : false,
      isUpdating       : false,
      deviceInfo       : {
        recv : {
          bitrate   : '-',
          ratio     : '-',
          frameRate : '-',
          codec     : '-',
        },
        send : {
          bitrate   : '-',
          ratio     : '-',
          frameRate : '-',
          codec     : '-',
        },
      },
    };
  },
  sketch : {
    ns    : 'conference.sketch',
    props : [ 'filterText', 'selectedMember' ],
  },
  computed : {
    isApplyGroup() {
      return this.group === 'waiting' || this.group === 'audioApply';
    },
    displayName() {
      return this.item.displayText + (this.item.isCurrentUser() ? ' ( 我 )' : '');
    },
    displayPhone() {
      return this.item.phone === 'unauth-web-client' ? 'WebRTC' : this.item.phone;
    },
    isSelected() {
      return this.selectedMember === this.item.entity;
    },
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
        block      : { icon: 'icon-maikefengjinyong', color: 'red', title: '打开麦克风' },
        unblock    : { icon: 'icon-maikefeng', color: 'indigo', title: '禁言麦克风' },
        unblocking : { icon: 'icon-quxiaojushou', color: 'blue', title: '取消举手' },
        hand       : { icon: 'icon-jushou', color: 'indigo', title: '举手' },
      };

      if (this.currentIsPresenter) {
        iconMap.unblocking = { icon: 'icon-jushou', color: 'green', title: '同意/拒绝' };
      }
      const iconStatus = iconMap[this.$model.conference.getUserAudioStatus(this.item)];

      if (!this.hasPermission) iconStatus.color = 'grey';
      
      return iconStatus;
    },

    videoIcon() {
      const iconMap = {
        unblock : { icon: 'icon-shipin', color: 'indigo', title: '禁用摄像头' },
        block   : { icon: 'icon-shipinjinyong', color: 'red', title: '打开摄像头' },
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
    showSetPresenterItem() {
      return this.currentIsPresenter && !this.item.isOrganizer();
    },
    showSetWaitItem() {
      return this.currentIsPresenter && !this.item.isPresenter();
    },
  },
  methods : {
    onAudioOperation() {
      if (!this.hasPermission) return;
      if (this.item.isCurrentUser()) {
        this.$dispatch('conference.toggleAudio');

        return;
      }
      const status = this.$model.conference.getUserAudioStatus(this.item);

      if (status === 'unblocking') {
        this.$model.conference.updateAudioStatus(this.item, true);

        return;
      }
      const ingress = status !== 'unblock';

      this.$dispatch('conference.updateAudioStatus', { user: this.item, ingress });
    },
    onVideoOperation() {
      if (!this.hasPermission) return;
      if (this.item.isCurrentUser()) {
        this.$dispatch('conference.toggleVideo');

        return;
      }
      const ingress = this.$model.conference.getUserVideoStatus(this.item) !== 'unblock';

      this.$dispatch('conference.updateVideoStatus', { user: this.item, ingress });
    },
    setPresenter() {
      if (this.item.isPresenter() && !this.item.isOrganizer()) {
        this.item.setPermission('attendee');
      }
      else {
        this.item.setPermission('presenter');
      }
    },
    setWaiting() {
      this.item.hold();
    },
    kickFromMeeting() { // 移出会议
      this.item.kick().then(() => {}).catch(() => {});
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
      this.updateDeviceInfo();
    },
    updateDeviceInfo() {
      this.isUpdating = true;
      this.item.getStatistics().then((result) => {
        const videoInfo = result['main-video'];

        this.deviceInfo.recv.bitrate = prettyBytes(videoInfo.recv.bitrate);
        this.deviceInfo.send.bitrate = prettyBytes(videoInfo.send.bitrate);
        this.deviceInfo.recv.ratio = `${videoInfo.recv.width} x ${videoInfo.recv.height}`;
        this.deviceInfo.send.ratio = `${videoInfo.send.width} x ${videoInfo.send.height}`;
        this.deviceInfo.recv.frameRate = `${videoInfo.recv.fr} fps`;
        this.deviceInfo.send.frameRate = `${videoInfo.send.fr} fps`;
        this.deviceInfo.recv.codec = videoInfo.recv.codec;
        this.deviceInfo.send.codec = videoInfo.send.codec;
        this.isUpdating = false;
      });
    },
    selectMember() {
      this.selectedMember = this.item.entity;
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
    .member-selected {
      background-color: #D6DAEB;
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
