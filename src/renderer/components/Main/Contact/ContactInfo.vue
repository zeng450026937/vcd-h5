<template>
  <div id="contact-info" class="bg-white h-full w-full">
    <div v-if="hasUser" class="flex flex-col h-full">
      <div class="flex py-5 items-center border-b mx-10">
        <div class="flex flex-col flex-grow truncate" style="height: 72px;">
          <div class="font-bold leading-loose text-base items-center truncate">
            {{user | filterCardTitle}}
          </div>
          <div class="mt-2 text-xs leading-tight text-black6 whitespace-normal">
            {{user | filterCardText}}
          </div>
        </div>
        <div class="ml-10">
          <a-avatar v-if="!user.parent.isUser"
                    :size="72"
                    class="text-white">
            <a-iconfont :type="user.avatar" class="text-3xl mt-5"/>
          </a-avatar>
          <a-avatar v-else :size="72">
            <span class="text-lg">{{user.nick}}</span>
          </a-avatar>
        </div>
      </div>
      <div class="flex flex-col flex-grow my-2 text-xs px-10">
        <div class="mt-3 leading-tight">
          <span class="mr-3 truncate text-black6">{{user.parent.isUser ? '账号' : '号码'}}</span>
          <span >{{user.number}}</span>
        </div>
        <template v-if="user.parent.isUser">
          <div class="mt-3 leading-tight items-center">
            <span class="mr-3 text-black6">电话</span>
            <span>{{user.phone}}</span>
          </div>
          <div class="mt-3 leading-tight items-center">
            <span class="mr-3 text-black6">邮箱</span>
            <span>{{user.email || '暂无邮箱'}}</span>
          </div>
          <div class="mt-3 flex leading-tight items-start">
            <span class="mr-3 whitespace-no-wrap text-black6">部门</span>
            <a class="text-indigo hover:underline"
               @click="clickDept(user.parent.fullPath)">{{user.parent.fullPath | fullName}}</a>
          </div>
        </template>
      </div>
      <div class="flex mt-1 h-12 border-t items-center justify-center">
        <a-button type="primary"
                  style="width: 120px;"
                  @click="clickVideo">
          <a-iconfont type="icon-shipin" class="text-base"/>视频通话
        </a-button>
        <a-button type="primary"
                  class="ml-4"
                  style="width: 120px;"
                  @click="clickAudio">
          <a-iconfont type="icon-yuyin" class="text-base"/>音频通话
        </a-button>
      </div>
    </div>
    <div v-else class="flex justify-center h-full">
      <group-info :group="group"/>
    </div>
  </div>
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
      // ensureModal : null,
    };
  },
  computed : {
    hasUser() {
      return !!this.user && Object.keys(this.user).length > 0;
    },
  },
  destroyed() {
    // this.$popup.destroy(this.ensureModal);
  },
  methods : {
    clickDept(path) {
      this.$emit('toGroup', path);
    },
    clickVideo() {
      this.$rtc.conference.meetnow([ {
        requestUri : this.user.number,
      } ]);
    },
    clickAudio() {
      this.$dispatch('call.doAudioCall', this.user.number);
    },
  },
  filters : {
    fullName(fullPath) {
      return fullPath.map((b) => b.text).join('/');
    },
    filterCardTitle(item) {
      const { parent } = item;

      if (parent.isUser) return item.name;
      else if (parent.isDevice) return '设备型号';
      else if (parent.isExternal) return '其他联系人';
      else if (parent.isVMR) return '虚拟会议室名字';
      else if (parent.isService) return '服务号';
    },
    filterCardText(item) {
      return item.parent.isUser ? '这里是个性签名,字太多可以显示两行。这里是个性签名,字太多可以显示两行。' : item.name;
    },
  },
};
</script>

<style scoped>

</style>
