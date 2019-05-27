<template>
  <a-popover
      ref="pop"
      placement="rightTop"
      overlayClassName="avatar-popover">
    <template slot="title">
      <div class="flex w-80 flex-col shadow">
        <!--头部-->
        <div class="flex items-center w-full px-5 py-4 bg-card rounded-t text-white">
          <div class="flex flex-col max-w-4/5 flex-grow">
            <div class="text-base flex leading-loose">
              <span class="w-1 flex flex-grow truncate">
                <span class="truncate">{{contact.name}}</span>
              </span>
            </div>
          </div>
          <div class="flex justify-center ml-3">
            <contact-avatar :contact="contact"></contact-avatar>
          </div>
        </div>

        <div class="flex flex-col px-5 py-3 text-xs">
          <div class="flex items-center">

            <span class="mr-3 truncate text-black6">
              {{contact.isUser ? $t('contact.label.account') : $t('contact.label.number')}}
            </span>

            <span>{{contact.number}}</span>

            <div class="flex flex-grow"></div>

            <a-iconfont type="icon-shipin"
                        @click.stop="handleMeeting('video')"
                        class="mr-4 text-indigo cursor-pointer text-base">
            </a-iconfont>

            <a-iconfont type="icon-yuyin"
                        @click.stop="handleMeeting('audio')"
                        class="text-indigo cursor-pointer text-base">
            </a-iconfont>

          </div>

          <template v-if="contact.isUser">
            <div class="flex items-center mt-3 ">
              <span class="mr-3 text-black6">{{$t('contact.label.phone')}}</span>
              <span>{{contact.phone}}</span>
            </div>
            <div class="flex mt-3 items-center">
              <span class="mr-3 text-black6">{{$t('contact.label.email')}}</span>
              <span>{{contact.email || $t('contact.label.noEmail')}}</span>
            </div>
            <div class="mt-3 flex items-start">
              <span class="mr-3 whitespace-no-wrap text-black6">{{$t('contact.label.group')}}</span>
              <span class="text-indigo"></span>
            </div>
          </template>
        </div>
      </div>
    </template>
    <div>
      <contact-avatar :size="28" :key="contact.id" :contact="contact"></contact-avatar>
    </div>
  </a-popover>

</template>

<script>
import ContactAvatar from './ContactAvatar.vue';

export default {
  name       : 'ContactPopover',
  components : {
    ContactAvatar,
  },
  props : {
    info : {
      type : Object,
      default() {
        return {};
      },
    },
    contact : {
      type : Object,
      default() {
        return {};
      },
    },
  },
  computed : {
    loadMode() {
      return this.$model.contact.loadMode;
    },
  },
  methods : {
    handleMeeting(type) {
      this.$emit('call', { info: this.info, type });
    },
  },
  mounted() {

  },
};
</script>

<style lang="less">
  .avatar-popover {
    .ant-popover-arrow {
      display: none;
    }
    .ant-popover-title {
      padding: 0 !important;
    }

    .ant-popover-inner-content {
      padding: 0;
    }
  }
</style>
