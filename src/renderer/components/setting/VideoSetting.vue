<template>
  <a-layout id="video-setting" class="h-full">
    <div class="h-14">
      <div class="flex bg-white dragable h-full">
        <div class="flex items-center h-full px-4 text-base">
          <span>视频</span>
        </div>
        <div class="flex flex-grow"></div>
        <app-header/>
      </div>
    </div>
    <a-divider class="my-0"/>
    <div class="flex flex-col h-full m-4 bg-white p-5 w-full">
      <div class="flex flex-col">
        <div class="flex">
          <div class="mt-2 h-32">
            <video class="h-full bg-grey" autoplay
                   src="https://api.dogecloud.com/player/get.mp4?vcode=5ac682e6f8231991&userId=17&ext=.mp4"
            ></video>
          </div>
          <!--<video class="w-60 bg-grey h-32" autoplay-->
                 <!--style="object-fit: contain"-->
          <!--&gt;</video>-->
          <div class="flex items-end ml-2">
            <span class="text-xs opacity-75">看不到任何视频</span>
            <a-popover placement="bottomLeft" trigger="click"
                       overlayClassName="calendar-info-popover">
              <div slot="content" style="width: 250px" class="p-3">
                <div class="text-xs leading-tight">
                  <div>· 请确认您的摄像头已经接通并开启。</div>
                  <div>· 检查视频选项以使用正确的网络摄像头。</div>
                  <div>· 请确认其他程序没有占用您的摄像头。</div>
                  <div>· 重启您的电脑</div>
                </div>
                <div class="text-xs mt-6">
                  如仍有问题，请访问我们的
                  <span class="text-indigo cursor-pointer">支持中心</span>。
                </div>
              </div>
              <a-icon type="question-circle" class="ml-2 text-indigo cursor-pointer" theme="filled"/>
            </a-popover>
          </div>
        </div>
        <div class="flex flex-col mt-5">
          <span class="leading-normal">摄像头</span>
          <a-select defaultValue="请选择摄像头" class="mt-2 w-80">
            <a-select-option v-for="(camera, index) in cameraList" :key="index"
                             :value="camera.value"
            >{{camera.label}}</a-select-option>
          </a-select>
        </div>
      </div>
      <div class="flex flex-col mt-5">
        <div class="leading-normal">
          <a-switch size="small"/>
          <span class="ml-5">启用高清视频</span>
        </div>
        <div class="mt-3 leading-normal">
          <a-switch size="small"/>
          <span class="ml-5">启用硬件加速</span>
        </div>
        <div class="mt-3 leading-normal">
          <a-switch size="small"/>
          <span class="ml-5">启用视频镜像效果</span>
        </div>
        <div class="mt-3 leading-normal">
          <a-switch size="small"/>
          <span class="ml-5">加入会议时不开启摄像头</span>
        </div>
        <div class="mt-3 leading-normal">
          <a-switch size="small"/>
          <span class="ml-5">屏幕共享时启用GPU加速</span>
        </div>
      </div>
    </div>
  </a-layout>
</template>

<script>
import AppHeader from '../shared/AppHeader.vue';

export default {
  name       : 'VideoSetting',
  components : {
    AppHeader,
  },
  data() {
    return {
      cameraList : [
        { label: '摄像头一号', value: 'camera1' },
        { label: '摄像头二号', value: 'camera2' },
        { label: '摄像头三号', value: 'camera3' },
      ],
    };
  },
};
</script>

<style scoped>

</style>
