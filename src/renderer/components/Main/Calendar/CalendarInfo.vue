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
                <span class="text-xs text-indigo cursor-pointer whitespace-no-wrap ml-2">复制信息</span>
                <a-popover placement="bottomRight" trigger="click"
                           overlayClassName="calendar-info-popover">
                  <template slot="content">
                    <div class="flex flex-col justify-between items-center p-3"
                         style="width: 144px; height: 332px;">
                      <div class="flex flex-col items-center h-full">
                        <span class="text-xs leading-tight">分享会议</span>
                        <div style="width: 120px; height: 120px;" class="bg-grey-darkest mt-2"></div>
                      </div>
                      <div class="flex flex-col items-center h-full mt-3">
                        <span class="text-xs leading-tight">观看直播</span>
                        <div style="width: 120px; height: 120px;" class="bg-grey-darkest mt-2"></div>
                      </div>
                    </div>
                  </template>
                  <a-iconfont type="icon-erweima" class="ml-3 text-indigo cursor-pointer"/>
                </a-popover>
              </div>
              <div class="flex flex-col text-xs mt-2">
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
                  <span class="text-indigo flex">当前会议不是直播会议</span>
                  <span class="text-xs text-indigo cursor-pointer ml-2">复制</span>
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
                <div class="flex flex-col flex-grow">
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
                                    :class="{'bg-orange': item.role === 'organizer'}">
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
                  @click="enterMeeting"><a-iconfont type="icon-shipin"/>视频加入</a-button>
        <a-button class="w-1/3 mx-2" type="primary"><a-iconfont type="icon-yuyin"/>音频加入</a-button>
      </div>
      <div>
      <plain-modal ref="deleteModal"
                   type="warning"
                   content="确定删除该会议"
                   @ok="clickOk">
      </plain-modal>
    </div>
    </div>
    <div v-else class="flex justify-center mt-10">
      <no-found class="mt-10 text-grey" text="暂未选择日程信息"/>
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
    enterMeeting() {
      this.$dispatch('meeting.joinMeeting', {
        number : this.currentEvent.conferenceNumber,
        pin    : this.currentEvent.attendeePin,
      });
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
