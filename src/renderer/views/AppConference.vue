<template>
  <a-layout id="app-conference" class="bg-grey-darkest h-full">
    <div class="flex flex-col h-full">
      <app-header>
        <div slot="title" class="cursor-pointer">
          <a-icon type="wifi"/>
          <span class="ml-4">正在与XXX通话</span>
        </div>
      </app-header>
      <a-divider class="my-0"/>
      <div class="flex h-full">
        <div class="flex flex-col w-full">
          <div class="flex items-center justify-end py-4 px-4 text-xl text-white">
            <a-icon type="fullscreen" class="px-2 cursor-pointer"/>
            <div v-for="tab in iconList" :key="tab.key"
                 class="flex mx-3 cursor-pointer hover:text-blue-light">
              <a-icon :type="tab.icon"
                      @click="$router.push(`/conference/tabs?type=${tab.key}`)"/>
            </div>
          </div>
          <div class="flex flex-grow"></div>
          <div class="flex justify-center">
            <div class="flex justify-around p-4 w-2/5">
              <a-button shape="circle" icon="video-camera" class="text-xl w-12 h-12"/>
              <a-button shape="circle" icon="sound" class="text-xl w-12 h-12"/>
              <a-button shape="circle" icon="desktop" class="text-xl w-12 h-12"/>
              <a-button shape="circle" icon="ellipsis" class="text-xl w-12 h-12"/>
              <a-button shape="circle"
                        icon="phone"
                        class="text-xl w-12 h-12 bg-red text-white border-red"
                        @click="$router.push('/login')"/>
            </div>
          </div>
        </div>
        <div>
          <router-view />
        </div>
      </div>
    </div>
  </a-layout>
</template>

<script>
import AppHeader from '../components/shared/AppHeader.vue';

const iconList = [
  {
    key  : 'invite',
    icon : 'user-add',
    is   : 'InviteTab',
  },
  {
    key  : 'member',
    icon : 'team',
    is   : 'MemberTab',
  },
  {
    key  : 'chat',
    icon : 'message',
    is   : 'SettingTab',
  },
  {
    key  : 'setting',
    icon : 'setting',
    is   : 'ChatTab',
  },
];

export default {
  name       : 'AppConference',
  components : {
    AppHeader,
  },
  data() {
    return {
      iconList,
    };
  },
  computed : {

  },
};
</script>

<style scoped>

</style>
