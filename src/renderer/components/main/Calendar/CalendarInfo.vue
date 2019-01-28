<template>
  <a-layout id="calendar-info" class="bg-white h-full">
    <div v-if="hasEvent" class="h-full flex flex-col">
      <div class="h-full flex flex-grow">
        <div class="w-full">
          <div class="flex flex-col px-5 h-full">
            <div class="py-5 border-b">
              <div class="flex items-center">
                <div class="text-base text-black flex flex-grow truncate">
                  <span class="truncate">{{currentEvent.subject}}</span>
                </div>
                <span class="text-xs text-indigo cursor-pointer whitespace-no-wrap ml-2">复制信息</span>
                <a-popover placement="bottomRight" trigger="click"
                           overlayClassName="calendar-info-popover">
                  <template slot="content">
                    <div class="flex justify-between items-center p-5"
                         style="width: 300px; height: 190px;">
                      <div class="flex flex-col items-center justify-between h-full">
                        <div style="width: 120px; height: 120px;" class="bg-grey-darkest"></div>
                        <span>分享会议</span>
                      </div>
                      <div class="flex flex-col items-center justify-between h-full">
                        <div style="width: 120px; height: 120px;" class="bg-grey-darkest"></div>
                        <span>观看直播</span>
                      </div>
                    </div>
                  </template>
                  <a-icon type="qrcode" class="ml-3 text-indigo cursor-pointer"/>
                </a-popover>
              </div>
              <div class="flex flex-col text-xs mt-4">
                <div class="flex w-full leading-tight">
                  <span class="w-20 opacity-75">时间</span>
                  <span>{{currentEvent.startTime}} - {{currentEvent.expiryTime}}</span>
                </div>
              </div>
              <div class="flex flex-col text-xs mt-4">
                <div class="flex w-full leading-tight">
                  <span class="w-20 opacity-75">周期</span>
                  <span>当前会议不是周期性会议</span>
                </div>
              </div>
              <div class="flex flex-col text-xs mt-4">
                <div class="flex w-full leading-tight">
                  <span class="w-20 opacity-75">会议室</span>
                  <span>{{currentEvent.locations || '当前会议尚未设置会议室'}}</span>
                </div>
              </div>
              <div class="flex flex-col text-xs mt-4">
                <div class="flex w-full leading-tight">
                  <span class="w-20 opacity-75">会议ID</span>
                  <span>{{currentEvent.conferenceNumber}}</span>
                </div>
              </div>
              <div class="flex flex-col text-xs mt-4">
                <div class="flex w-full leading-tight">
                  <span class="w-20 opacity-75">会议密码</span>
                  <span>{{currentEvent.attendeePin}}</span>
                </div>
              </div>
              <div class="flex flex-col text-xs mt-4">
                <div class="flex w-full leading-tight">
                  <span class="w-20 opacity-75">直播链接</span>
                  <span class="text-indigo flex flex-grow">当前会议不是直播会议</span>
                  <span class="text-xs text-indigo cursor-pointer">复制</span>
                </div>
              </div>
              <div class="flex flex-col text-xs mt-4">
                <div class="flex w-full leading-tight">
                  <span class="w-20 opacity-75">备注</span>
                  <span>{{currentEvent.note || '当前会议的备注信息为空'}}</span>
                </div>
              </div>
            </div>
            <div class="flex flex-col text-xs my-5">
              <div class="flex w-full leading-tight">
                <span class="w-20 opacity-75">会议成员</span>
                <div class="flex flex-col flex-grow overflow-y-auto">
                  <div class="w-full" v-if="currentEvent.invitees">
                    <recycle-scroller
                        style="height: 100%"
                        :items="currentEvent.invitees.invitee"
                        :buffer="5"
                        :item-height="32"
                        :page-mode="false"
                        key-field="display-text"
                    >
                      <template slot-scope="{item}">
                        <div class="flex items-center mb-2">
                          <a-avatar size="small"
                                    icon="user"
                                    :class="{'bg-orange': item.role === 'organizer'}"/>
                          <span class="ml-1">参会成员</span>
                          <span class="ml-1">({{item['display-text']}})</span>
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
        <a-button class="w-1/3 mx-2" icon="video-camera" type="primary">视频加入</a-button>
        <a-button class="w-1/3 mx-2" icon="phone" type="primary">音频加入</a-button>
      </div>
      <div>
      <plain-modal ref="deleteModal"
                   type="warning"
                   content="确定删除该会议"
                   @ok="clickOk">
      </plain-modal>
    </div>
    </div>
    <div v-else class="flex">
      <no-found class="mt-10" text="暂未选择日程信息"/>
    </div>
  </a-layout>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller';
import NoFound from '../../Shared/CommonEmpty.vue';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

export default {
  name       : 'CalendarInfo',
  components : {
    NoFound,
    RecycleScroller,
  },
  computed : {
    currentEvent() {
      return this.$model.calendar.currentEvent || {};
    },
    hasEvent() {
      return Object.keys(this.currentEvent).length > 0;
    },
  },
  methods : {
    clickOk() {
      this.$refs.deleteModal.visible = false;
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
