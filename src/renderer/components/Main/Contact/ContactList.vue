<template>
  <a-layout id="contact-list" class="h-full bg-white select-none">
    <div class="h-full overflow-y-hidden">
      <recycle-scroller
          v-if="contactList.length > 0"
          :items="contactListWithHeight"
          :buffer="20"
          :page-mode="false"
          key-field="id"
          class="h-full overflow-x-hidden">
        <template v-slot="{item, index}">
          <a-list-item tabindex='-1'
                       class="px-1 cursor-pointer group"
                       :class="{'bg-list-select':selectedContact.id === item.id,
                             'hover:bg-list-hover': selectedContact.id !== item.id,
                             'h-14' : !item.isGroup,
                             'h-12' : item.isGroup}"
                       @click="check(item)"
                       @keyup.up="preContact"
                       @keyup.down="nextContact">
            <a-list-item-meta class="w-full">
              <div slot="title" class="truncate">
                <div class="flex flex-col justify-center">
                  <div class="flex items-center">
                    <span class="text-sm leading-none truncate" style="height: 16px">
                      {{item.i18n? $t(item.i18n) : item.name}}
                    </span>
                    <template v-if="item.isGroup && loadMode !== LOAD_MODE.SPLIT">（{{item.amount}}）</template>
                  </div>
                  <span v-if="!item.isGroup"
                        class="text-xs opacity-75 leading-none"
                        style="margin-top: 6px">
                    <span v-if="highlightContent && (item.number).indexOf(highlightContent) > -1"
                          class="flex">
                    {{(item.number).substr(0, (item.number).indexOf(highlightContent))}}
                      <span class="text-indigo">{{highlightContent}}</span>
                      {{(item.number).substr((item.number).indexOf(highlightContent) + highlightContent.length)}}
                    </span>
                    <span v-else>{{(item.number)}}</span>
                  </span>
                </div>
              </div>
              <a-popover
                  placement="rightTop"
                  trigger="hover"
                  slot="avatar"
                  overlayClassName="avatar-popover">
                <template v-if="!item.isGroup && !hidePopup" slot="content">
                  <div class="flex w-80 flex-col shadow">
                    <!--头部-->
                    <div class="flex items-center w-full px-5 py-4 bg-card rounded-t text-white">
                      <div class="flex flex-col max-w-4/5 flex-grow">
                        <div class="text-base flex leading-loose">
                            <span class="w-1 flex flex-grow truncate">
                              <span class="truncate">{{item.name}}</span>
                            </span>
                        </div>
                        <div class="truncate text-xs font-thin leading-tight opacity-75 mt-1">
                          <span>{{item | filterCardText}}</span>
                        </div>
                      </div>
                      <div class="flex justify-center ml-3">
                        <a-avatar v-if="item.isGroup || (!item.isUser && !item.isFavorite && !item.isLocal)"
                                  :size="48"
                                  :class="{ 'bg-transparent' : item.isGroup,
                                    [`text-${item.isGroup ? 'grey-dark' : 'white'}`]: true}">
                          <a-iconfont :type="item|icon" class="text-3xl"></a-iconfont>
                        </a-avatar>
                        <a-avatar v-else :size="48">{{item.nick}}</a-avatar>
                      </div>
                    </div>

                    <div class="flex flex-col px-5 py-3 text-xs">
                      <div class="flex items-center">
                        <span class="mr-3 truncate text-black6">
                          {{item.isUser ? $t('contact.label.account') : $t('contact.label.number')}}
                        </span>
                        <span>{{item.number}}</span>
                        <div class="flex flex-grow"></div>
                        <a-iconfont type="icon-shipin"
                                    @click.stop="doVideo(item)"
                                    class="mr-4 text-indigo cursor-pointer text-base"></a-iconfont>
                        <a-iconfont type="icon-yuyin"
                                    @click.stop="doAudio(item)"
                                    class="text-indigo cursor-pointer text-base"></a-iconfont>
                      </div>
                      <template v-if="item.isUser">
                        <div class="flex items-center mt-3 ">
                          <span class="mr-3 text-black6">{{$t('contact.label.phone')}}</span>
                          <span>{{item.phone}}</span>
                        </div>
                        <div class="flex mt-3 items-center">
                          <span class="mr-3 text-black6">{{$t('contact.label.email')}}</span>
                          <span>{{item.email || $t('contact.label.noEmail')}}</span>
                        </div>
                        <div class="mt-3 flex items-start">
                          <span class="mr-3 whitespace-no-wrap text-black6">{{$t('contact.label.group')}}</span>
                          <span class="text-indigo">
                             <template v-for="(item, index) in pathList" >
                                <a :key="item.id"
                                   v-if="index < pathList.length - 1"
                                   class="hover:underline text-indigo"
                                   @click="clickDept(item)">{{item.text}}/
                                </a>
                                <span v-else style="cursor: unset" :key="item.id">{{item.text}}</span>
                            </template>
                          </span>
                        </div>
                      </template>
                    </div>
                  </div>
                </template>
                <a-checkbox v-if="checkable"
                            :checked="item.checked"
                            class="contact-checkbox"/>
                <a-avatar v-if="item.isGroup || (!item.isUser && !item.isFavorite && !item.isLocal)"
                          class="text-sm"
                          :class="{'bg-transparent' : item.isGroup,
                                  [`text-${item.isGroup ? 'grey-dark' : 'white'}`]: true,
                                  'mx-2': !item.isGroup}">
                  <a-iconfont :type="item|icon" class="text-base"></a-iconfont>
                </a-avatar>
                <a-avatar v-else
                          class="text-sm mx-2">
                  {{item.nick}}
                </a-avatar>
              </a-popover>
            </a-list-item-meta>
            <div class="opacity-0 group-hover:opacity-100 flex justify-around"
                 :class="{'opacity-100': selectedContact.id === item.id}">
              <a-iconfont v-if="videoIcon"
                          :title="$t('dial.dialpad.videoCall')"
                          type="icon-shipin"
                          class="mr-3 text-indigo cursor-pointer text-base"
                          @click.stop="handleMeeting(item, 'video')"></a-iconfont>
              <a-iconfont v-if="audioIcon && !item.isGroup"
                          :title="$t('dial.dialpad.audioCall')"
                          type="icon-yuyin"
                          class="mr-3 text-indigo cursor-pointer text-base"
                          @click.stop="handleMeeting(item, 'audio')"></a-iconfont>

              <a-iconfont v-if="(item.isGroup && groupMoreIcon) || (!item.isGroup && moreIcon)"
                          :title="$t('dial.dialpad.more')"
                          type="icon-gengduo1"
                          class="mr-2 text-indigo cursor-pointer text-base">
              </a-iconfont>
              <slot name="more" :item="item"></slot>

              <a-iconfont v-if="deleteIcon && !(item.isSelf && selfUnDeleted)"
                          :title="$t('dial.dialpad.del')"
                          type="icon-guanbi"
                          class="mr-2 text-black9 cursor-pointer text-base hover:text-red"
                          @click="deleteContact(item)"></a-iconfont>
            </div>
          </a-list-item>
        </template>
      </recycle-scroller>
      <div v-else class="flex items-center justify-center h-full">
        <common-empty class="text-grey" image="empty-contact" :text="$t('contact.label.noContact')"/>
      </div>
      <contact-modal :storeName="storeName" ref="contactModal" @confirm="startMeeting"></contact-modal>
    </div>
    <plain-modal ref="inputModal"
                 type="error"
                 :title="$t('conversation.tip.inputConferencePassword')"
                 :cancel-text="$t('common.controls.cancel')"
                 :ok-text="$t('common.controls.enter')"
                 @ok="joinVMR">
      <div slot="content" class="px-4">
        <a-input v-model="vmrInfo.pin"/>
      </div>
    </plain-modal>
  </a-layout>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller';
import CommonEmpty from '../../Shared/CommonEmpty.vue';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';
import ContactModal from './ContactModal.vue';
import PlainModal from '../../../popup/plain-modal';

import { $t } from '../../../i18n';

const LOAD_MODE = {
  AUTO    : 'AUTO',
  OVERALL : 'OVERALL',
  SPLIT   : 'SPLIT',
};

export default {
  name  : 'ContactList',
  props : {
    videoIcon : {
      type    : Boolean,
      default : true,
    },
    audioIcon : {
      type    : Boolean,
      default : true,
    },
    moreIcon : {
      type    : Boolean,
      default : false,
    },
    groupMoreIcon : { // 是否强制显示分组的 more
      type    : Boolean,
      default : false,
    },
    deleteIcon : {
      type    : Boolean,
      default : false,
    },
    selfUnDeleted : {
      type    : Boolean,
      default : false,
    },
    highlightSelected : {
      type    : Boolean,
      default : true,
    },
    contactList : {
      type : Array,
      default() {
        return [];
      },
    },
    store : {
      type : Object,
    },
    storeName : {
      type : String,
    },
    loadMode : {
      type    : String,
      default : LOAD_MODE.OVERALL,
    },
    currentGroup : {
      type : String,
    },
    highlightContent : { // 用于搜索 高亮搜索内容
      type    : String,
      default : '',
    },
    hidePopup : {
      type    : Boolean,
      default : false,
    },
    enableKeyboard : {
      type    : Boolean,
      default : false,
    },
    withGap : { // 必须提供 group 属性用于分组
      type    : Boolean,
      default : false,
    },
    checkable : {
      type    : Boolean,
      default : false,
    },
    selectedContact : {
      type : Object,
      default() {
        return {};
      },
    },
  },
  components : {
    RecycleScroller,
    CommonEmpty,
    ContactModal,
    PlainModal,
  },
  data() {
    return {
      LOAD_MODE,
      enableScroll : false,
      pathList     : [],
      vmrInfo      : {
        number : '',
        pin    : '',
      },
    };
  },
  computed : {
    contactListWithHeight() {
      return this.contactList.map((item) => {
        item.size = item.isGroup
          ? 48
          : item.isGap
            ? 28
            : 56;

        return item;
      });
    },

  },
  methods : {
    clickDept(path) {
      this.$emit('toGroup', path);
    },
    contactChecked(contact) {
      if (this.selfUnDeleted && contact.isSelf) return;
      contact.checked = !contact.checked;
      this.$emit('onCheck', contact);
    },
    getPathList(group) {
      if (!group) return [];
      const currentGroup = this.store.getNode(group);

      return this.store.findBranchWithSelf(currentGroup).map((i) => ({
        text : i.name,
        id   : i.id,
      })).reverse();
    },
    check(item) {
      this.$emit('check', item);
    },
    deleteContact(item) {
      if (this.selfUnDeleted && item.isSelf) return;
      this.$emit('deleteContact', item);
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
    async call(item, options) {
      if (item.isVMR) {
        this.vmrInfo.number = item.number;
        this.vmrInfo.options = options;
        try {
          await this.$dispatch('meeting.joinMeeting', {
            number : this.vmrInfo.number,
            pin    : this.vmrInfo.pin,
            ...this.vmrInfo.options,
          });
        }
        catch (e) {
          if (e.cause === 'Invalid PIN') {
            this.$refs.inputModal.visible = true;
          }
        }
      }
      else {
        this.$dispatch('call.call', {
          number : item.number,
          options,
        });
      }
    },
    doVideo(item) {
      this.call(item, {
        audio : true,
        video : true,
      });
    },
    doAudio(item) {
      this.call(item, {
        audio : true,
        video : false,
      });
    },
    handleMeeting(item, type) {
      if (item.isGroup) return this.openContactModal(item);

      if (type === 'video') return this.doVideo(item);

      if (type === 'audio') return this.doAudio(item);
    },

    startMeeting(checkeds) {
      this.$dispatch('meeting.meetnow', { users: checkeds.map((n) => ({ requestUri: n.number })) });
    },
    switchContact(direction) {
      const index = this.contactList.findIndex((n) => n.id === this.selectedContact.id);
      const nextIndex = direction === 'down' ? index + 1 : index - 1;
      const nextItem = this.contactList[nextIndex];

      if (!nextItem) return;

      if (nextItem.isGroup) return;

      this.$emit('check', nextItem);
    },
    nextContact() {
      if (!this.enableKeyboard) return;

      this.switchContact('down');
    },
    preContact() {
      if (!this.enableKeyboard) return;

      this.switchContact('up');
    },
    openContactModal(checkItem) {
      this.$refs.contactModal.open(checkItem);
    },
  },
  watch : {
    currentGroup(val) {
      this.pathList = this.getPathList(val);
    },
  },
  filters : {
    icon(node) {
      return node.isUser ? 'icon-zuzhi'
        : node.isDevice ? 'icon-huiyishishebei'
          : node.isExternal ? 'icon-zuzhi'
            : node.isService ? 'icon-wangluo'
              : node.isVMR ? 'icon-xunihuiyishi' : 'icon-zuzhi';
    },
    filterCardText(item) {
      if (item.isUser || item.isExternal) return $t('contact.label.unknownInfo');
      else if (item.isDevice) return $t('contact.label.unknownDevice');
      else if (item.isVMR) return $t('contact.label.unknownVMR');
      else if (item.isService) return $t('contact.label.serviceNumber');
    },
  },
  mounted() {
    this.$nextTick().then(() => {
      // if (!this.enableKeyboard) return;
      // document.getElementById('contact-list').onkeydown = (evt) => { // 阻止按键导致的滚动
      //   const key = evt.key;
      //
      //   return this.enableScroll || !(key === 'ArrowDown' || key === 'ArrowUp');
      // };
    });
  },
};
</script>

<style lang="less">
  #contact-list {
    .ant-list-item-meta {
      width: 80%;
      display: flex;
      align-items: center !important;
      overflow: hidden;
      &-avatar {
        margin-right: 6px;
        .contact-checkbox {
          margin-left: 10px;
          transform: translateY(5px);
        }
      }

      &-title {
        margin-bottom: 0 !important;
      }

      &-content {
        overflow: hidden;
      }
    }
    .ant-list-item-content {
      flex: none;
      margin-left: 8px;
    }

    .ant-list-item {
      padding: 6px 0;
    }
  }

  .avatar-popover {
    .ant-popover-arrow {
      display: none;
    }

    .ant-popover-inner-content {
      padding: 0;
    }
  }
</style>
