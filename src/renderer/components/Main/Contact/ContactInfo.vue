<template>
  <div id="contact-info" class="bg-white h-full w-full">
    <div v-if="hasUser" class="flex flex-col h-full">
      <div class="flex py-5 items-center border-b mx-10">
        <div class="flex flex-col flex-grow truncate" style="height: 80px;">
          <div class="font-bold leading-loose text-base items-center truncate">
            {{user.name}}
          </div>
          <div class="mt-3 text-xs leading-tight text-black6 whitespace-normal">
            {{user | filterCardText}}
          </div>
        </div>
        <div class="ml-10">
          <a-avatar v-if="!user.isUser && !user.isFavorite && !user.isLocal"
                    :size="80"
                    class="text-white">
            <a-iconfont :type="user|icon" class="text-3xl"/>
          </a-avatar>
          <a-avatar v-else :size="72">
            <span class="text-lg">{{user.nick}}</span>
          </a-avatar>
        </div>
      </div>
      <div class="flex flex-col flex-grow text-sm px-10">
        <div class="flex leading-normal">
          <div class="flex flex-col">
            <span class="mt-5 mr-3 truncate text-black6">{{user.isUser ? $t('contact.label.account') : $t('contact.label.number')}}</span>
            <span v-if="user.isVMR" class="mt-5 mr-3 text-black6">{{$t('contact.label.organizer')}}</span>
            <template v-if="user.isUser">
              <span v-if="user.phone" class="mt-5 mr-3 text-black6">{{$t('contact.label.phone')}}</span>
              <span v-if="user.email" class="mt-5 mr-3 text-black6">{{$t('contact.label.email')}}</span>
            </template>
            <span v-if="store" class="mt-5 mr-3 whitespace-no-wrap text-black6">{{$t('contact.label.group')}}</span>
          </div>
          <div class="flex flex-col">
            <span class="mt-5">{{user.number}}</span>
            <span v-if="user.isVMR" class="text-black9 mt-5">{{$t('contact.label.unknownOrganizer')}}</span>
            <template v-if="user.isUser">
              <span v-if="user.phone" class="mt-5">{{user.phone}}</span>
              <span v-if="user.email" class="mt-5">{{user.email}}</span>
            </template>
            <span class="mt-5">
              <template v-for="(item, index) in path" >
                <a :key="item.id"
                   v-if="index < path.length - 1"
                   class="hover:underline text-indigo"
                   @click="clickDept(item)">{{item.text}}/
                </a>
                <span v-else style="cursor: unset" :key="item.id">{{item.text}}</span>
              </template>

            </span>

          </div>
        </div>
      </div>
      <div class="flex mt-1 h-12 border-t items-center justify-center">
        <a-button type="primary"
                  style="width: 120px;"
                  @click="doVideo">
          <a-iconfont type="icon-shipin" class="text-base"/>{{$t('dial.button.video')}}
        </a-button>
        <a-button type="primary"
                  class="ml-4"
                  style="width: 120px;"
                  @click="doAudio">
          <a-iconfont type="icon-yuyin" class="text-base"/>{{$t('dial.button.audio')}}
        </a-button>
      </div>
    </div>
    <div v-else class="flex justify-center h-full">
      <group-info :group="group"/>
    </div>
    <plain-modal ref="inputModal" title="请输入密码"
                 hide-cancel
                 :ok-text="vmrInfo.pin ? '加入' : '没有密码，直接加入 >>'"
                 @ok="joinVMR">
      <div slot="content">
        <a-input v-model="vmrInfo.pin"/>
      </div>
    </plain-modal>
  </div>
</template>

<script>
import GroupInfo from './ContactGroupInfo.vue';
import { $t } from '../../../i18n';
import PlainModal from '../../../popup/plain-modal';

export default {
  name       : 'ContactInfo',
  components : {
    GroupInfo,
    PlainModal,
  },
  props : {
    user : {
      type : Object,
      default() {
        return {};
      },
    },
    store : {
      type : Object,
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
      vmrInfo : {
        number : '',
        pin    : '',
      },
    };
  },
  computed : {
    hasUser() {
      return !!this.user && Object.keys(this.user).length > 0;
    },
    path() {
      if (!this.user || !this.store) return [];

      return this.store.findBranch(this.user).map((i) => ({
        text : i.name,
        id   : i.id,
      })).reverse();
    },
  },
  destroyed() {
    // this.$popup.destroy(this.ensureModal);
  },
  methods : {
    clickDept(path) {
      this.$emit('toGroup', path);
    },
    clickAudio() {
      this.$dispatch('call.doAudioCall', this.user.number);
    },
    async joinVMR() {
      this.$refs.inputModal.visible = false;
      await this.$dispatch('meeting.joinMeeting', {
        number : this.vmrInfo.number,
        pin    : this.vmrInfo.pin,
        ...this.vmrInfo.options,
      });
      this.vmrInfo = {
        number : '',
        pin    : '',
      };
    },
    call(item, options) {
      if (item.isVMR) {
        this.$refs.inputModal.visible = true;
        this.vmrInfo.number = item.number;
        this.vmrInfo.options = options;
      }
      else {
        this.$dispatch('call.call', {
          number : item.number,
          options,
        });
      }
    },
    doVideo() {
      this.call(this.user, {
        audio : true,
        video : true,
      });
    },
    doAudio() {
      this.call(this.user, {
        audio : true,
        video : false,
      });
    },
  },
  filters : {
    icon(node) {
      return node.isDevice
        ? 'icon-huiyishishebei'
        : node.isExternal
          ? 'icon-zuzhi'
          : node.isService
            ? 'icon-wangluo'
            : node.isVMR
              ? 'icon-xunihuiyishi'
              : 'icon-zuzhi';
    },
    filterCardText(item) {
      if (item.isUser || item.isExternal) return $t('contact.label.unknownInfo');
      else if (item.isDevice) return $t('contact.label.unknownDevice');
      else if (item.isVMR) return $t('contact.label.unknownVMR');
      else if (item.isService) return $t('contact.label.serviceNumber');
    },
  },
};
</script>
