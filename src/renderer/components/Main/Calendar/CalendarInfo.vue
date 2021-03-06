<template>
  <a-layout id="calendar-info" class="bg-white h-full select-none">
    <div v-if="hasEvent" class="h-full flex flex-col">
      <div class="h-full flex flex-grow">
        <div class="w-full">
          <div class="flex flex-col px-5 h-full overflow-y-auto">
            <div class="py-5 border-b">
              <div class="flex items-center">
                <div class="w-1 text-base text-black flex flex-grow truncate">
                  <span class="truncate leading-loose"
                        :title="currentEvent.subject">{{currentEvent.subject}}</span>
                </div>
                <span class="text-xs text-indigo cursor-pointer whitespace-no-wrap ml-2"
                      @click="copyShareUrl">{{$t('schedule.copyInfo')}}</span>
                <a-popover placement="bottomRight" trigger="click"
                           overlayClassName="calendar-info-popover">
                  <template slot="content">
                    <div class="flex flex-col justify-between items-center p-3"
                         style="width: 144px;">
                      <div class="flex flex-col items-center h-full">
                        <span class="text-xs leading-tight">{{$t('schedule.share')}}</span>
                        <img style="width: 120px; height: 120px;"
                             class="mt-2"
                             :src="shareQRCode"/>
                      </div>
                      <div class="flex flex-col items-center select-none h-full mt-3"
                           v-if="currentEvent.isLive" >
                        <span class="text-xs leading-tight">{{$t('schedule.watchLive')}}</span>
                        <img style="width: 120px; height: 120px;"
                             class="mt-2"
                             :src="liveQRCode"/>
                      </div>
                    </div>
                  </template>
                  <a-iconfont type="icon-erweima" class="ml-3 text-indigo cursor-pointer"/>
                </a-popover>
              </div>
              <div class="flex flex-col text-xs mt-2">
                <div class="flex w-full leading-tight">
                  <span class="w-20 text-black6">{{$t('schedule.time')}}</span>
                  <span>{{currentEvent.startTime}} - {{currentEvent.expiryTime}}</span>
                </div>
              </div>
              <div v-if="currentEvent.isRecurrence" class="flex flex-col text-xs mt-4">
                <div class="flex w-full leading-tight">
                  <span class="w-20 text-black6">{{$t('schedule.cycle')}}</span>
                  <div class="flex flex-col">
                    <span>{{currentEvent.pattern.title}}</span>
                    <span>{{currentEvent.pattern.time}}</span>
                  </div>
                </div>
              </div>
              <div v-if="currentEvent.locations" class="flex flex-col text-xs mt-4">
                <div class="flex w-full leading-tight">
                  <div>
                    <div class="w-20 text-black6">{{$t('schedule.meetingRoom')}}</div>
                  </div>
                  <span style="word-break: break-all">{{currentEvent.locations.location.join('、')}}</span>
                </div>
              </div>
              <div class="flex flex-col text-xs mt-4">
                <div class="flex w-full leading-tight">
                  <span class="w-20 text-black6">{{$t('schedule.conferenceId')}}</span>
                  <span class="select-text">{{currentEvent.conferenceNumber}}</span>
                </div>
              </div>
              <div class="flex flex-col text-xs mt-4">
                <div class="flex w-full leading-tight">
                  <span class="w-20 text-black6">{{$t('schedule.password')}}</span>
                  <span class="select-text">{{currentEvent.attendeePin}}</span>
                </div>
              </div>
              <div v-if="currentEvent.isLive" class="flex flex-col text-xs mt-4">
                <div class="flex w-full leading-tight">
                  <span class="w-20 text-black6">{{$t('schedule.liveLink')}}</span>
                  <span class="text-indigo w-1 flex flex-grow truncate">
                    <a class="truncate"
                       :title="currentEvent.liveShareUrl"
                       @click="toLiveShareUrl">{{currentEvent.liveShareUrl}}</a>
                  </span>
                  <a class="text-xs text-indigo cursor-pointer ml-2"
                        @click="copyLiveShareUrl">{{$t('schedule.copy')}}</a>
                </div>
              </div>
              <div class="flex flex-col text-xs mt-4">
                <div class="flex w-full leading-tight">
                  <div>
                    <div class="w-20 text-black6">{{$t('schedule.remark')}}</div>
                  </div>
                  <span style="word-break: break-all"
                        class="w-1 flex flex-grow">{{currentEvent.note || $t('schedule.emptyRemark')}}</span>
                </div>
              </div>
            </div>
            <div class="flex flex-col text-xs my-5">
              <div class="flex w-full leading-tight">
                <span class="w-20 text-black6">{{$t('schedule.meetingMember')}}</span>
                <div class="flex flex-col flex-grow">
                  <div class="w-full" v-if="currentEvent.invitees">
                    <template v-for="(item, index ) in sortedInvitee">
                      <div :key="index" class="flex items-center mb-2">
                        <div class="h-6 w-6 rounded-full flex items-center justify-center"
                             :class="{[`bg-${item.role}`]: true}">
                          <a-iconfont type="icon-ren" class="text-white text-base"/>
                        </div>
                        <div class="flex leading-tight flex-grow w-1">
                          <span class="ml-1 mr-2 truncate">
                            {{item['display-text']}}
                          </span>
                          <span v-if="item.phone">（{{item.phone}}）</span>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <a-divider class="m-0"/>
      <div class="my-2 flex justify-center items-center">
        <a-button class="w-1/3 mx-2" type="primary"
                  :disabled="!status.isReady"
                  :title="status.isReady
                    ? $t('schedule.videoJoin')
                    : status.isPrepared
                      ? $t('schedule.unStart')
                      : $t('schedule.ended')"
                  @click="videoEnter">
          <a-iconfont type="icon-shipin"/>
          {{$t('schedule.videoJoin')}}
        </a-button>
        <a-button class="w-1/3 mx-2" type="primary"
                  :disabled="!status.isReady"
                  :title="status.isReady
                   ? $t('schedule.audioJoin')
                   : status.isPrepared
                     ? $t('schedule.unStart')
                     : $t('schedule.ended')"
                  @click="audioEnter">
          <a-iconfont type="icon-yuyin"/>
          {{$t('schedule.audioJoin')}}
        </a-button>
      </div>
      <div>
        <plain-modal ref="deleteModal"
                     type="warning"
                     :content="$t('confirmDel')"
                     @ok="clickOk">
        </plain-modal>
      </div>
    </div>
    <div v-else class="flex h-full items-center justify-center">
      <common-empty class="text-grey" image="empty-calendar"/>
    </div>
  </a-layout>
</template>

<script>
import jrQrcode from 'jr-qrcode';
import copy from 'clipboard-copy';
import { RecycleScroller } from 'vue-virtual-scroller';
import CommonEmpty from '../../Shared/CommonEmpty.vue';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

const { shell } = require('electron');


export default {
  name       : 'CalendarInfo',
  components : {
    CommonEmpty,
    RecycleScroller,
  },
  data() {
    return {
      updateTimer : null,
    };
  },
  sketch : [
    {
      ns    : 'meeting',
      props : [ 'meetingRecord' ],
    },
    {
      ns    : 'conference.sketch',
      props : [ 'isVideoConference' ],
    },
  ],
  beforeDestroy() {
    if (this.updateTimer) clearInterval(this.updateTimer);
  },
  computed : {
    sortedInvitee() {
      const { invitee } = this.currentEvent.invitees;

      return [
        ...invitee.filter((i) => i.role === 'organizer'),
        ...invitee.filter((i) => i.role === 'presenter'),
        ...invitee.filter((i) => i.role === 'attendee'),
      ];
    },
    currentEvent() {
      return this.$model.schedule.currentEvent || {};
    },
    status() {
      return this.currentEvent.status || {};
    },
    hasEvent() {
      return Object.keys(this.currentEvent).length > 0;
    },
    enterpriseId() {
      return this.$rtc.account.enterpriseId;
    },
    liveQRCode() {
      return jrQrcode.getQrBase64(this.currentEvent.liveShareUrl);
    },
    shareUrl() {
      const domain = this.$model.account.proxy || this.$model.account.loginData.server;
      const isCloud = this.$model.account.serverType === 'cloud';

      if (isCloud) {
        return `http://${domain}/meeting/mailDetail?conferencePlanId=${this.currentEvent['@planId']}&enterpriseId=${this.enterpriseId}`;
      }
      else {
        return `http://${domain}/user/extend/mail/detail?type=detail&conferencePlanId=${this.currentEvent['@planId']}&enterpriseId=${this.enterpriseId}`;
      }
    },
    shareQRCode() {
      return jrQrcode.getQrBase64(this.shareUrl);
    },
  },
  methods : {
    clickOk() {
      this.$refs.deleteModal.visible = false;
    },
    enterMeeting() {
      this.meetingRecord = {
        number       : this.currentEvent.conferenceNumber,
        pin          : this.currentEvent.attendeePin,
        initialVideo : true,
        initialAudio : true,
        video        : true,
        audio        : true,
      };
      
      return this.$dispatch('meeting.joinMeeting');
    },
    videoEnter() {
      this.enterMeeting().then(() => {
        this.isVideoConference = true;
      });
    },
    audioEnter() {
      this.enterMeeting().then(() => {
        this.isVideoConference = false;
      });
    },
    toLiveShareUrl() {
      shell.openExternal(this.currentEvent.liveShareUrl);
    },
    copyLiveShareUrl() {
      copy(this.currentEvent.liveShareUrl).then(() => {
        this.$message.success(this.$t('schedule.copySucceed'));
      });
    },
    copyShareUrl() {
      this.$model.schedule.fetchMailTemplate(this.currentEvent.recordId).then((val) => {
        copy(val).then(() => {
          this.$message.success(this.$t('schedule.copySucceed'));
        });
      });
    },
  },
  watch : {
    currentEvent : {
      handler(val, oldVal) {
        if (this.updateTimer) clearInterval(this.updateTimer);
        if (val.conferenceNumber && (!oldVal || !oldVal.conferenceNumber)) {
          this.updateTimer = setInterval(() => {
            this.currentEvent.updateStatus();
          }, 1000);
        }
      },
      immediate : true,
    },
  },
};
</script>

<style lang="less">
.calendar-info-popover {
  .ant-popover-inner-content {
    padding: 0;
  }
}
</style>
