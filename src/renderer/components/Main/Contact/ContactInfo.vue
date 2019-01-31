<template>
  <a-layout id="contact-info" class="bg-white h-full">
    <div v-if="hasUser" class="flex flex-col px-5 h-full">
      <div class="flex py-5 items-center w-full border-b">
        <div class="flex flex-col truncate">
          <div class="font-bold leading-normal text-base items-center truncate">
            {{user.name}}
          </div>
          <div class="mt-2 text-xs leading-tight text-black-lightest whitespace-normal">
            这里是个性签名，限制最多50个字，字太多可以显示两行，保证两行能显示50个字
          </div>
        </div>
        <div class="flex flex-grow"></div>
        <div class="ml-3">
          <a-avatar v-if="!user.parent.isUser"
                    :size="72"
                    :icon="user.avatar"
                    class="bg-indigo-dark text-white"/>
          <a-avatar v-else :size="72" :class="{[`bg-${user.avatar || 'indigo-dark'}`]: true}">
            <span class="text-lg">{{user.name.substr(-2, 2)}}</span>
          </a-avatar>
        </div>
      </div>
      <div class="flex flex-col my-2 text-xs">
        <div class="mt-3 leading-tight">
          <a-icon type="user"></a-icon>
          <span class="mx-3 truncate">账号</span>
          <span >{{user.ip || user.account}}</span>
        </div>
        <template v-if="user.parent.isUser">
          <div class="mt-3 leading-tight items-center">
            <a-icon type="phone"></a-icon>
            <span class="mx-3">电话</span>
            <span>{{user.phone}}</span>
          </div>
          <div class="mt-3 leading-tight items-center">
            <a-icon type="mail"></a-icon>
            <span class="mx-3">邮箱</span>
            <span>{{user.email || '暂无邮箱'}}</span>
          </div>
          <div class="mt-3 flex leading-tight items-start">
            <a-icon type="home" class="leading-tight"></a-icon>
            <span class="mx-3 whitespace-no-wrap">部门</span>
            <a class="text-indigo hover:underline"
               @click="clickDept(user.parent.fullPath)">{{user.parent.fullPath | fullName}}</a>
          </div>
        </template>
      </div>
      <div class="flex flex-col mt-1 mb-5 items-center flex-grow justify-end">
        <a-button type="primary" icon="video-camera"
                  class="mt-3 w-full bg-indigo border-transparent"
                  @click="clickVideo">
          <span class="font-hairline">视频通话</span></a-button>
        <a-button type="primary" icon="phone"
                  class="mt-3 w-full bg-indigo font-normal border-transparent">音频通话
        </a-button>
      </div>
    </div>
    <div v-else class="flex justify-center h-full">
      <group-info :group="group"/>
    </div>
  </a-layout>
</template>

<script>
import GroupInfo from './ContactGroupInfo.vue';

export default {
  name       : 'ContactInfo',
  components : {
    GroupInfo,
  },
  props : {
    user : {
      type : Object,
      default() {
        return {};
      },
    },
    group : {
      type : Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      ensureModal : null,
    };
  },
  computed : {
    hasUser() {
      return !!this.user && Object.keys(this.user).length > 0;
    },
  },
  destroyed() {
    this.$popup.destroy(this.ensureModal);
  },
  methods : {
    clickDept(path) {
      this.$emit('toGroup', path);
    },
    clickVideo() {
      if (!this.ensureModal) {
        this.ensureModal = this.$popup.prepared('ensureModal', { content: '是否开启群组会议？' });
        this.ensureModal.vm.$on('cancel', () => {
          console.warn('已经关闭Modal');
        });
        this.ensureModal.vm.$on('ok', () => {
          console.warn('已经开始会议');
          this.ensureModal.hide();
        });
      }
      this.ensureModal.display();
    },
  },
  filters : {
    fullName(fullPath) {
      return fullPath.map((b) => b.text).join('/');
    },
  },
};
</script>

<style scoped>

</style>
