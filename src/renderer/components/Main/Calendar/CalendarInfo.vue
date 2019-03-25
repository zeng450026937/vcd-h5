<template>
  <a-layout id="calendar-info" class="bg-white h-full">
    <div v-if="hasEvent" class="h-full flex flex-col">
      <div class="h-full flex flex-grow">
        <div class="w-full">
          <div class="flex flex-col px-5 h-full overflow-y-auto">
            <div class="py-5 border-b">
              <div class="flex items-center">
                <div class="w-1 text-base text-black flex flex-grow truncate">
                  <span class="truncate leading-loose">{{currentEvent.subject}}</span>
                </div>
                <span class="text-xs text-indigo cursor-pointer whitespace-no-wrap ml-2"
                      @click="copyShareUrl">复制信息</span>
                <a-popover placement="bottomRight" trigger="click"
                           overlayClassName="calendar-info-popover">
                  <template slot="content">
                    <div class="flex flex-col justify-between items-center p-3"
                         style="width: 144px;">
                      <div class="flex flex-col items-center h-full">
                        <span class="text-xs leading-tight">分享会议</span>
                        <img style="width: 120px; height: 120px;"
                             class="mt-2"
                             :src="shareQRCode"/>
                      </div>
                      <div class="flex flex-col items-center select-none h-full mt-3"
                           v-if="currentEvent.isLive" >
                        <span class="text-xs leading-tight">观看直播</span>
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
                  <span class="w-20 text-black9">时间</span>
                  <span>{{currentEvent.startTime}} - {{currentEvent.expiryTime}}</span>
                </div>
              </div>
              <div v-if="currentEvent.isRecurrence" class="flex flex-col text-xs mt-4">
                <div class="flex w-full leading-tight">
                  <span class="w-20 text-black9">周期</span>
                  <div class="flex flex-col">
                    <span>{{currentEvent.pattern.title}}</span>
                    <span>{{currentEvent.pattern.time}}</span>
                  </div>
                </div>
              </div>
              <div v-if="currentEvent.locations" class="flex flex-col text-xs mt-4">
                <div class="flex w-full leading-tight">
                  <div>
                    <div class="w-20 text-black9">会议室</div>
                  </div>
                  <span>{{currentEvent.locations.location.join('、')}}</span>
                </div>
              </div>
              <div class="flex flex-col text-xs mt-4">
                <div class="flex w-full leading-tight">
                  <span class="w-20 text-black9">会议ID</span>
                  <span>{{currentEvent.conferenceNumber}}</span>
                </div>
              </div>
              <div class="flex flex-col text-xs mt-4">
                <div class="flex w-full leading-tight">
                  <span class="w-20 text-black9">会议密码</span>
                  <span>{{currentEvent.attendeePin}}</span>
                </div>
              </div>
              <div v-if="currentEvent.isLive" class="flex flex-col text-xs mt-4">
                <div class="flex w-full leading-tight">
                  <span class="w-20 text-black9">直播链接</span>
                  <span class="text-indigo w-1 flex flex-grow truncate">
                    <a class="truncate" @click="toLiveShareUrl">{{currentEvent.liveShareUrl}}</a>
                  </span>
                  <span class="text-xs text-indigo cursor-pointer ml-2"
                        @click="copyLiveShareUrl">复制</span>
                </div>
              </div>
              <div class="flex flex-col text-xs mt-4">
                <div class="flex w-full leading-tight">
                  <div>
                    <div class="w-20 text-black9">备注</div>
                  </div>
                  <span>{{currentEvent.note || '当前会议的备注信息为空'}}</span>
                </div>
              </div>
            </div>
            <div class="flex flex-col text-xs my-5">
              <div class="flex w-full leading-tight">
                <span class="w-20 opacity-75">会议成员</span>
                <div class="flex flex-col flex-grow">
                  <div class="w-full" v-if="currentEvent.invitees">
                    <recycle-scroller
                        style="height: 100%"
                        :items="currentEvent.invitees.invitee"
                        :buffer="5"
                        :item-size="32"
                        :page-mode="false"
                        key-field="display-text"
                    >
                      <template slot-scope="{item}">
                        <div class="flex items-center mb-2">
                          <a-avatar size="small"
                                    :class="{'bg-host': item.role === 'organizer'}">
                            <a-iconfont type="icon-ren"/>
                          </a-avatar>
                          <span class="ml-1 leading-tight">{{item['display-text']}}</span>
                          <span class="ml-1 leading-tight">({{item['display-text']}})</span>
                        </div>
                      </template>
                    </recycle-scroller>
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
                  :disabled="!status.isRunning"
                  :title="status.isRunning ? '视频加入': status.isPrepared ? '当前会议尚未开始': '当前会议已经结束'"
                  @click="enterMeeting">
          <a-iconfont type="icon-shipin"/>
          视频加入
        </a-button>
        <a-button class="w-1/3 mx-2" type="primary"
                  :disabled="!status.isRunning"
                  :title="status.isRunning ? '音频加入': status.isPrepared ? '当前会议尚未开始': '当前会议已经结束'"
                  @click="audioEnter">
          <a-iconfont type="icon-yuyin"/>
          音频加入
        </a-button>
      </div>
      <div>
        <plain-modal ref="deleteModal"
                     type="warning"
                     content="确定删除该会议"
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
  sketch : {
    ns    : 'meeting',
    props : [ 'meetingRecord' ],
  },
  computed : {
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
      return this.$model.account.enterpriseId || '';
    },
    liveQRCode() {
      return jrQrcode.getQrBase64(this.currentEvent.liveShareUrl);
    },
    shareUrl() {
      return `http://${this.$model.account.proxy}/user/extend/mail/detail?type=detail&conferencePlanId=${this.currentEvent['@planId']}&enterpriseId=${this.enterpriseId}`;
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
      };
      this.$dispatch('meeting.joinMeeting');
    },
    audioEnter() {
      this.meetingRecord = {
        number       : this.currentEvent.conferenceNumber,
        pin          : this.currentEvent.attendeePin,
        initialVideo : true,
        initialAudio : false,
      };
      this.$dispatch('meeting.joinMeeting');
    },
    toLiveShareUrl() {
      shell.openExternal(this.currentEvent.liveShareUrl);
    },
    copyLiveShareUrl() {
      copy(this.currentEvent.liveShareUrl);
    },
    copyShareUrl() {
      copy(this.shareUrl);
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
