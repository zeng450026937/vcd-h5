<template>
  <div id="member-list-item">
    <div class="flex h-14 items-center px-4 cursor-pointer"
         :class="{'member-selected': isSelected}"
         @click="selectMember">
      <div class="relative">
        <a-avatar>
          {{displayName}}
        </a-avatar>
      </div>
      <div class="flex flex-col flex-grow w-1 ml-3">
        <div class="item-name flex flex-grow items-center">
          <span class="truncate" :title="item.displayText">
            <span v-if="filterText && item.displayText.indexOf(filterText) > -1" class="flex">
            {{item.displayText.substr(0, item.displayText.indexOf(filterText))}}
              <span class="text-indigo">{{filterText}}</span>
              {{item.displayText.substr(item.displayText.indexOf(filterText) + filterText.length)}}
            </span>
            <span v-else>{{item.displayText}}</span>
          </span>
          <span v-if="item.isCurrentUser()">（{{$t('conversation.member.me')}}）</span>
        </div>
        <span class="item-phone flex">
          <span v-if="displayPhone.indexOf(filterText) > -1" class="flex">
          {{displayPhone.substr(0, displayPhone.indexOf(filterText))}}
            <span class="text-indigo">{{filterText}}</span>
            {{displayPhone.substr(displayPhone.indexOf(filterText) + filterText.length)}}
          </span>
          <span v-else>{{displayPhone}}</span>
        </span>
      </div>
      <div v-if="!isApplyGroup" class="group">
        <a-iconfont v-if="item.isSharing()"
                    :title="$t('conversation.member.isSharing')"
                    type="icon-fuliu"
                    class="ml-4 text-base text-indigo"/>

        <a-iconfont v-if="!item.isCastViewer()"
                    :type="videoIcon.icon"
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
                    :getPopupContainer="conferenceContent"
                    overlayClassName="member-list-popover">
          <a class="ant-dropdown-link" href="#">
            <a-iconfont v-if="hasPermission"
                        :title="$t('conversation.controls.more')"
                        type="icon-gengduo1"
                        class="ml-4 text-indigo cursor-pointer text-base "/>
          </a>
          <a-menu slot="overlay">
            <a-menu-item v-if="hasSetAsPresenter || hasSetAsVisitor" key="0" @click="setPresenter">
              <div class="h-8 px-3 w-full popover-content-item flex items-center">
                <span class="text-xs">{{setAsPresenterText}}</span>
              </div>
            </a-menu-item>
            <a-menu-item v-if="hasSetAsSpeaker" key="1" @click="setSpeaker">
              <div class="h-8 px-3 w-full popover-content-item flex items-center">
                <span class="text-xs">{{setAsSpeakerText}}</span>
              </div>
            </a-menu-item>

            <a-menu-item v-if="hasSetAsWaiting" key="2" @click="setWaiting">
              <div class="h-8 px-3 w-full popover-content-item flex items-center">
                <span class="text-xs">{{$t('conversation.member.toWaiting')}}</span>
              </div>
            </a-menu-item>

            <a-menu-item v-if="hasDeviceInfo" key="3" @click="showDeviceInfo">
              <div class="h-8 px-3 w-full popover-content-item flex items-center">
                <span class="text-xs">{{$t('conversation.member.deviceInfo')}}</span>
              </div>
            </a-menu-item>

            <a-menu-item v-if="hasKickConference" key="4" @click="isShowKickOperation = true">
              <div class="h-8 px-3 w-full popover-content-item flex items-center">
                <span class="text-xs">{{$t('conversation.member.kickFromMeeting')}}</span>
              </div>
            </a-menu-item>

          </a-menu>
        </a-dropdown>
      </div>
      <div v-else-if="currentIsPresenter">
        <a-iconfont type="icon-tongguo"
                    class="ml-4 text-base text-indigo cursor-pointer"
                    :title="isAudioApplicant
                    ? $t('conversation.member.allowSpeak')
                    : $t('conversation.member.allowConference')"
                    @click="handleApply(true)"/>
        <a-iconfont type="icon-yichu"
                    class="ml-4 text-base text-red cursor-pointer"
                    :title="isAudioApplicant
                    ? $t('conversation.member.refuseSpeak')
                    : $t('conversation.member.refuseConference')"
                    @click="handleApply(false)"/>
      </div>
    </div>
    <div v-if="isShowDeviceInfo"
         class="flex flex-col w-full bg-under-painting"
         style="height: 180px;">
      <div>
        <div class="flex h-8 items-center border-b px-4 text-xs leading-tight">
          <span>{{$t('conversation.statistics.deviceType')}}：</span>
          <div class="flex flex-grow w-1 truncate">
            <span class="truncate">Yealink VC Desktop</span>
          </div>
          <a-iconfont type="icon-shuaxin"
                      :title="$t('conversation.statistics.refreshDeviceInfo')"
                      class="text-base cursor-pointer text-black9"
                      :spin="isUpdating"
                      @click="updateDeviceInfo"></a-iconfont>
          <a-iconfont type="icon-guanbi"
                      :title="$t('conversation.statistics.closeDeviceInfo')"
                      class="text-base cursor-pointer text-black9 ml-4"
                      @click="isShowDeviceInfo = false"></a-iconfont>
        </div>
      </div>
      <div class="w-full h-full flex px-4 py-2 text-xs border-b">
        <div class="flex flex-col w-1/3 justify-between">
          <span class="opacity-0">/</span>
          <span :title="$t('conversation.statistics.bitrate')">
            {{$t('conversation.statistics.bitrate')}}
          </span>
          <template v-if="isVideoConference">
            <span :title="$t('conversation.statistics.ratio')">
              {{$t('conversation.statistics.ratio')}}
            </span>
            <span :title="$t('conversation.statistics.frameRate')">
              {{$t('conversation.statistics.frameRate')}}</span>
          </template>
          <span :title="$t('conversation.statistics.codec')">
            {{$t('conversation.statistics.codec')}}</span>
          <template v-if="!isVideoConference">
            <span :title="$t('conversation.statistics.packetsLost')">
              {{$t('conversation.statistics.packetsLost')}}</span>
            <span class="truncate"
                  :title="$t('conversation.statistics.packetsLostRate')">
              {{$t('conversation.statistics.packetsLostRate')}}</span>
          </template>
        </div>
        <div class="flex flex-col w-1/3 justify-between">
          <span>{{$t('conversation.statistics.send')}}</span>
          <span>{{deviceInfo.recv.bitrate}}</span>
          <template v-if="isVideoConference">
            <span>{{deviceInfo.recv.ratio}}</span>
            <span>{{deviceInfo.recv.frameRate}}</span>
          </template>
          <span>{{deviceInfo.recv.codec}}</span>
          <template v-if="!isVideoConference">
            <span>{{deviceInfo.recv.packetlost}}</span>
            <span>{{deviceInfo.recv.lossrate}}</span>
          </template>
        </div>
        <div class="flex flex-col w-1/3 justify-between">
          <span>{{$t('conversation.statistics.receive')}}</span>
          <span>{{deviceInfo.send.bitrate}}</span>
          <template v-if="isVideoConference">
            <span>{{deviceInfo.send.ratio}}</span>
            <span>{{deviceInfo.send.frameRate}}</span>
          </template>
          <span>{{deviceInfo.send.codec}}</span>
          <template v-if="!isVideoConference">
            <span>{{deviceInfo.send.packetlost}}</span>
            <span>{{deviceInfo.send.lossrate}}</span>
          </template>
        </div>
      </div>

    </div>
    <div v-if="isShowApplyOperation"
         class="flex w-full bg-under-painting justify-center items-center"
         style="height: 44px;">
      <a-button type="primary" class="h-7 w-12 p-0 text-xs" @click="applyAudioApply(true)">
        <span style="letter-spacing: 0;margin-right: 0;">{{$t('common.controls.allow')}}</span>
      </a-button>
      <a-button class="h-7 w-12 ml-3 p-0 text-xs" @click="applyAudioApply(false)">
        <span style="letter-spacing: 0;margin-right: 0;">{{$t('common.controls.refuse')}}</span>
      </a-button>
    </div>

    <div v-if="isShowKickOperation"
         class="flex w-full bg-under-painting justify-center items-center"
         style="height: 44px;">
      <a-button type="primary" class="h-7 w-12 p-0 text-xs" @click="kickFromMeeting">
        <span style="letter-spacing: 0;margin-right: 0;">{{$t('common.controls.ensure')}}</span>
      </a-button>
      <a-button class="h-7 w-12 ml-3 p-0 text-xs" @click="isShowKickOperation = false">
        <span style="letter-spacing: 0;margin-right: 0;">{{$t('common.controls.cancel')}}</span>
      </a-button>
    </div>

  </div>
</template>

<script>
const prettyBytes = (num, precision = 3, addSpace = false) => {
  const UNITS = [ 'B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB' ];

  if (Math.abs(num) < 1) return num + (addSpace ? ' ' : '') + UNITS[0];
  const exponent = Math.min(Math.floor(Math.log10(num < 0 ? -num : num) / 3), UNITS.length - 1);
  const n = Number((((num < 0 ? -num : num) / 1000) ** exponent).toPrecision(precision));
  
  return (num < 0 ? '-' : '') + n + (addSpace ? ' ' : '') + UNITS[exponent];
};

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
      isShowDeviceInfo     : false,
      isShowApplyOperation : false,
      isShowKickOperation  : false,
      isUpdating           : false,
      deviceInfo           : {
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
    props : [ 'filterText', 'selectedMember', 'isVideoConference' ],
  },
  computed : {
    // 几种操作项相应的规则
    hasSetAsPresenter() { // 设为主持人 当前为主持人且操作对象不是主持人
      return this.currentIsPresenter && !this.item.isPresenter();
    },
    hasSetAsVisitor() { // 设为访客 当前为主持人 且操作对象为非自己的主持人
      return this.currentIsPresenter && this.item.isPresenter && !this.item.isOrganizer() && !this.item.isCurrentUser();
    },
    hasSetAsSpeaker() { // 设为演讲者 当前为主持人 且 当前会议模式是 主席模式
      return this.currentIsPresenter && !this.isDefault;
    },
    hasSetAsWaiting() { // 设为等待 当前为主持人 且 操作对象不是 主持人
      return this.currentIsPresenter && !this.item.isPresenter();
    },
    hasDeviceInfo() { // 设备详情 主持人 和 自己
      return this.currentIsPresenter || this.item.isCurrentUser();
    },
    hasKickConference() { // 移出会议 主持人 对 非自己 以外的 人员
      return this.currentIsPresenter && !this.item.isCurrentUser() && !this.item.isOrganizer();
    },
    conferenceContent() {
      return () => document.getElementById('layout-conference-content');
    },
    isDefault() { // 默认是讨论模式
      return this.$model.conference.profile === 'default';
    },
    isApplyGroup() {
      return this.group === 'waiting' || this.group === 'audioApply';
    },
    displayName() {
      const { displayText } = this.item;

      return /^(.*)['(', '（'].*[')', '）']|（$/.test(displayText) ? RegExp.$1.substr(-2, 2) : displayText.substr(-2, 2);
    },
    displayPhone() {
      if (!this.item.phone) return 'CloudV30';
      
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
      return this.currentIsPresenter || this.item.isCurrentUser();
    },
    audioIcon() {
      const iconMap = {
        block : {
          icon  : 'icon-maikefengjinyong',
          color : 'red',
          title : this.$t('conversation.controls.turnOnMicrophone'),
        },
        unblock : { icon  : 'icon-maikefeng',
          color : 'indigo',
          title : this.$t('conversation.controls.turnOffMicrophone') },
        unblocking : { icon  : 'icon-quxiaojushou',
          color : 'blue',
          title : this.$t('conversation.controls.cancelRaiseHangs') },
        hand : { icon  : 'icon-jushou',
          color : 'indigo',
          title : this.$t('conversation.controls.raiseHangs') },
      };

      if (this.currentIsPresenter) {
        iconMap.unblocking = {
          icon  : 'icon-jushou',
          color : 'green',
          title : this.$t('common.controls.allowOrRefuse') };
      }
      const iconStatus = iconMap[this.$model.conference.getUserAudioStatus(this.item)];

      if (!this.hasPermission) iconStatus.color = 'grey';
      
      return iconStatus;
    },

    videoIcon() {
      const iconMap = {
        unblock : { icon  : 'icon-shipin',
          color : 'indigo',
          title : this.$t('conversation.controls.turnOffCamera') },
        block : { icon  : 'icon-shipinjinyong',
          color : 'red',
          title : this.$t('conversation.controls.turnOnCamera') },
      };
      const iconStatus = iconMap[this.$model.conference.getUserVideoStatus(this.item)];

      if (!this.hasPermission) iconStatus.color = 'grey';
      
      return iconStatus;
    },
    setAsPresenterText() {
      return this.item.isPresenter()
        ? this.$t('conversation.member.toVisitor')
        : this.$t('conversation.member.toPresenter');
    },
    setAsSpeakerText() {
      return this.item.isDemonstrator()
        ? this.$t('conversation.member.cancelSpeaker')
        : this.$t('conversation.member.toSpeaker');
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
        if (this.currentIsPresenter) {
          // 显示同意或者拒绝的提示
          this.isShowApplyOperation = true;
        }
        else this.$dispatch('conference.updateAudioStatus', { user: this.item, ingress: true });

        return;
      }
      const ingress = status !== 'unblock';

      this.$dispatch('conference.updateAudioStatus', { user: this.item, ingress });
    },
    applyAudioApply(ingress) {
      this.handleApply(ingress);
      this.isShowApplyOperation = false;
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
    setSpeaker() {
      this.item.setDemonstrator(!this.item.isDemonstrator());
    },
    setWaiting() {
      this.item.hold();
    },
    kickFromMeeting() { // 移出会议
      this.item.kick().then(() => {
        this.isShowKickOperation = false;
      }).catch(() => {});
    },
    handleApply(status) {
      if (this.isAudioApplicant) { // 处理发言申请
        this.$dispatch('conference.updateAudioStatus', { user: this.item, ingress: status });
      }
      else { //  处理入会申请
        this.$dispatch('conference.handleMeetingApply', { user: this.item, status });
      }
    },
    showDeviceInfo() { // 显示设备详情
      this.isShowDeviceInfo = true;
      this.updateDeviceInfo();
    },
    updateDeviceInfo() {
      this.isUpdating = true;
      this.item.getStatistics().then((result) => {
        const statInfo = result[this.isVideoConference ? 'main-video' : 'main-audio'];

        this.deviceInfo.recv.bitrate = prettyBytes(statInfo.recv.bitrate);
        this.deviceInfo.send.bitrate = prettyBytes(statInfo.send.bitrate);
        this.deviceInfo.recv.codec = statInfo.recv.codec;
        this.deviceInfo.send.codec = statInfo.send.codec;
        this.deviceInfo.recv.frameRate = `${statInfo.recv.fr} fps`;
        this.deviceInfo.send.frameRate = `${statInfo.send.fr} fps`;
        if (this.isVideoConference) {
          this.deviceInfo.recv.ratio = `${statInfo.recv.width} x ${statInfo.recv.height}`;
          this.deviceInfo.send.ratio = `${statInfo.send.width} x ${statInfo.send.height}`;
        }
        else {
          this.deviceInfo.recv.packetlost = statInfo.recv.packetlost;
          this.deviceInfo.send.packetlost = statInfo.send.packetlost;
          this.deviceInfo.recv.lossrate = `${statInfo.recv.lossrate}%`;
          this.deviceInfo.send.lossrate = `${statInfo.send.lossrate}%`;
        }
        this.isUpdating = false;
      }).catch(() => {
        this.$message.error(this.$t('conversation.statistics.message.fetchFailed'));
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
