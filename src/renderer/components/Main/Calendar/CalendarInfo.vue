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
                        :title="selectedSchedule.subject">{{selectedSchedule.subject}}</span>
                </div>
                <span class="text-xs text-indigo cursor-pointer whitespace-no-wrap ml-2"
                      @click="copyInfo">{{$t('schedule.copyInfo')}}</span>
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
                           v-if="selectedSchedule.isRTMP" >
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
                  <span class="w-20 text-black6">组织者</span>
                  <span v-if="selectedSchedule.organizer">{{selectedSchedule.organizer.showName}}</span>
                </div>
              </div>
              <div class="flex flex-col text-xs mt-4">
                <div class="flex w-full leading-tight">
                  <span class="w-20 text-black6">{{$t('schedule.time')}}</span>
                  <span>{{selectedSchedule.startTime | formatTime}} - {{selectedSchedule.endTime | formatTime}}</span>
                </div>
              </div>
              <div v-if="selectedSchedule.pattern" class="flex flex-col text-xs mt-4">
                <div class="flex w-full leading-tight">
                  <span class="w-20 text-black6">{{$t('schedule.cycle')}}</span>
                  <div class="flex flex-col">
                    <span>{{selectedSchedule.pattern.title}}</span>
                    <span>{{selectedSchedule.pattern.time}}</span>
                  </div>
                </div>
              </div>
              <div v-if="selectedSchedule.roomNames" class="flex flex-col text-xs mt-4">
                <div class="flex w-full leading-tight">
                  <div>
                    <div class="w-20 text-black6">{{$t('schedule.meetingRoom')}}</div>
                  </div>
                  <span style="word-break: break-all">{{selectedSchedule.roomNames.join('、')}}</span>
                </div>
              </div>
              <div class="flex flex-col text-xs mt-4">
                <div class="flex w-full leading-tight">
                  <span class="w-20 text-black6">{{$t('schedule.conferenceId')}}</span>
                  <span class="select-text">{{selectedSchedule.number}}</span>
                </div>
              </div>
              <div class="flex flex-col text-xs mt-4">
                <div class="flex w-full leading-tight">
                  <span class="w-20 text-black6">{{$t('schedule.password')}}</span>
                  <span class="select-text">{{selectedSchedule.password}}</span>
                </div>
              </div>
              <div v-if="selectedSchedule.isLive" class="flex flex-col text-xs mt-4">
                <div class="flex w-full leading-tight">
                  <span class="w-20 text-black6">{{$t('schedule.liveLink')}}</span>
                  <span class="text-indigo w-1 flex flex-grow truncate">
                    <a class="truncate"
                       :title="selectedSchedule.rtmpUrl"
                       @click="toLiveShareUrl">{{selectedSchedule.rtmpUrl}}</a>
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
                        class="w-1 flex flex-grow">{{selectedSchedule.remark || $t('schedule.emptyRemark')}}</span>
                </div>
              </div>
            </div>
            <div class="flex flex-col text-xs my-5">
              <div class="flex w-full leading-tight">
                <span class="w-20 text-black6">{{$t('schedule.meetingMember')}}</span>
                <div class="flex flex-col flex-grow">
                  <div class="w-full" v-if="selectedSchedule.participants">
                    <template v-for="(item, index ) in sortedInvitee">
                      <div :key="index" class="flex items-center mb-2">
                        <div class="h-6 w-6 rounded-full flex items-center justify-center"
                             :class="{[`bg-${item.roleText}`]: true}">
                          <a-iconfont type="icon-ren" class="text-white text-base"/>
                        </div>
                        <div class="flex leading-tight flex-grow w-1">
                          <span class="ml-1 mr-2 truncate">
                            {{item.showName}}
                          </span>
                          <span v-if="item.extension">（{{item.extension}}）</span>
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
                     :content="$t('schedule.confirmDel')"
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
import { sortBy } from 'lodash';
import moment from 'moment';
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
  created() {
  },
  computed : {
    sortedInvitee() {
      const { participants } = this.selectedSchedule;

      if (!participants) return;

      participants.forEach((p) => p.roleText = [ 'organizer', 'presenter', 'attendee' ][p.role]);

      return sortBy(participants, (n) => n.role);
    },
    selectedSchedule() {
      return this.$model.schedule.selectedSchedule || {};
    },
    status() {
      return this.selectedSchedule.status || {};
    },
    hasEvent() {
      return this.selectedSchedule.number;
    },
    enterpriseId() {
      return '';
    },
    liveQRCode() {
      return jrQrcode.getQrBase64(this.selectedSchedule.rtmpUrl);
    },
    isCloud() {
      return this.$model.login.sketch.isCloud;
    },
    shareUrl() {
      // this.$message.error('cannot get url in because of empty enterprise id');
      return '';
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
        number       : this.selectedSchedule.number,
        pin          : this.selectedSchedule.password,
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
      shell.openExternal(this.selectedSchedule.rtmpUrl);
    },
    copyLiveShareUrl() {
      copy(this.selectedSchedule.rtmpUrl).then(() => {
        this.$message.success(this.$t('schedule.copySucceed'));
      });
    },
    copyInfo() {
      this.$message.error('cannot get details in because of empty enterprise id');
    },
  },
  watch : {
    selectedSchedule : {
      handler(val, oldVal) {
        if (this.updateTimer) clearInterval(this.updateTimer);
        if (val.number && (!oldVal || !oldVal.number)) {
          this.updateTimer = setInterval(() => {
            this.selectedSchedule.updateStatus();
          }, 1000);
        }
      },
      immediate : true,
    },
  },
  filters : {
    formatTime(val) {
      return moment(val).format('YYYY/MM/DD HH:mm');
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
