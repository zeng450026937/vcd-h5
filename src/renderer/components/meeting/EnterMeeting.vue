<template>
  <a-layout id="enter-meeting" class="h-full bg-indigo-darker">
    <div class="h-9">
      <div class="flex bg-indigo-darker dragable h-full">
        <div class="flex flex-grow"></div>
        <app-header bg-color="indigo-darker"/>
      </div>
    </div>
    <div class="flex justify-center h-full">
      <div style="width: 480px" class="flex flex-col" v-if="!showSetting">
        <div style="height: 270px" class="relative flex">
          <video-view class="w-full h-full bg-white"/>
          <div class="flex self-end w-full justify-center">
            <div class="flex mb-4">
              <a-button type="primary" shape="circle"
                        size="large" icon="video-camera"
                        class="w-12 h-12 text-xl bg-grey-darkest text-white"
              ></a-button>
              <a-button type="primary" shape="circle"
                        size="large" icon="phone"
                        class="w-12 h-12 text-xl bg-grey-darkest text-white mx-4"
              ></a-button>
              <a-button type="primary" shape="circle"
                        size="large" icon="setting"
                        class="w-12 h-12 text-xl bg-grey-darkest text-white"
                        @click="showSetting = true"
              ></a-button>
            </div>
          </div>
        </div>
        <div class="flex flex-col items-center" style="background-color: #ffffff0a">
          <div class="w-1/2 mt-5">
            <a-input
                v-model="meetingInfo.number"
                placeholder='Meeting ID'
            >
              <a-icon slot="prefix" type='team' class="text-grey-dark"/>
            </a-input>
          </div>

          <div class="w-1/2 mt-5">
            <a-input
                v-model="meetingInfo.pin"
                placeholder='Password(Optional)'
                type="password"
            >
              <a-icon slot="prefix" type='lock' class="text-grey-dark"/>
            </a-input>
          </div>
          <div class="w-1/2 mt-5">
            <a-input
                v-model="meetingInfo.server"
                placeholder='Server address'
            >
              <a-icon slot="prefix" type='hdd' class="text-grey-dark"/>
            </a-input>
          </div>
          <a-button type="primary" class="mt-8 mb-5 w-1/2">立即加入</a-button>
        </div>
      </div>
      <div style="width: 480px;background-color: #ffffff0a"
           class="flex flex-col mb-9" v-else>
        <media-content class="mt-10"/>
        <div class="flex self-end w-full justify-center">
          <div class="flex mb-5">
            <a-button type="primary">确定</a-button>
            <a-button class="ml-4" @click="showSetting = false">取消</a-button>
          </div>
        </div>
      </div>
    </div>
  </a-layout>
</template>

<script>
import AppHeader from '../shared/AppHeader.vue';
import MediaContent from '../device/MediaContent.vue';
import VideoView from '../device/VideoView.vue';

export default {
  name       : 'EnterMeeting',
  components : {
    AppHeader,
    MediaContent,
    VideoView,
  },
  computed : {
  },
  data() {
    return {
      meetingInfo : this.$model.meeting.meetingRecord, // number pin
      enterPopup  : null,
      showSetting : false,
    };
  },
  methods : {
    enterMeeting() {
      this.$dispatch('meeting.joinMeeting', this.meetingInfo);
    },
    cancelEnter() {
      this.$rtc.conference.leave();
    },
  },
};
</script>

<style scoped>
</style>
