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
                       @click="clickItem(item)"
                       @keyup.up="preContact"
                       @keyup.down="nextContact">
            <a-list-item-meta class="w-full">
              <div slot="title" class="truncate">
                <div class="flex flex-col justify-center">
                  <div class="flex items-center">
                    <span class="text-sm leading-none truncate">{{item.name}}</span>
                    <template v-if="item.isGroup">（{{item.amount}}）</template>
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
                        <a-avatar v-if="item.isGroup || !item.isUser"
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
                        <span class="mr-3 truncate text-black6">{{item.isUser ? '账号' : '号码'}}</span>
                        <span>{{item.number}}</span>
                        <div class="flex flex-grow"></div>
                        <a-iconfont type="icon-shipin"
                                    @click.stop="doAudio(item)"
                                    class="mr-4 text-indigo cursor-pointer text-base"></a-iconfont>
                        <a-iconfont type="icon-yuyin"
                                    @click.stop="doAudio(item)"
                                    class="text-indigo cursor-pointer text-base"></a-iconfont>
                      </div>
                      <template v-if="item.isUser">
                        <div class="flex items-center mt-3 ">
                          <span class="mr-3 text-black6">手机</span>
                          <span>{{item.phone}}</span>
                        </div>
                        <div class="flex mt-3 items-center">
                          <span class="mr-3 text-black6">邮箱</span>
                          <span>{{item.email || '暂无邮箱'}}</span>
                        </div>
                        <div class="mt-3 flex items-start">
                          <span class="mr-3 whitespace-no-wrap text-black6">分组</span>
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
                <a-avatar v-if="item.isGroup || !item.isUser"
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
                          title="视频呼叫"
                          type="icon-shipin"
                          class="mr-3 text-indigo cursor-pointer text-base"
                          @click.stop="doAudio(item)"></a-iconfont>
              <a-iconfont v-if="audioIcon && !item.isGroup"
                          title="音频呼叫"
                          type="icon-yuyin"
                          class="mr-3 text-indigo cursor-pointer text-base"
                          @click.stop="doAudio(item)"></a-iconfont>
              <a-iconfont v-if="(item.isGroup && groupMoreIcon) || (!item.isGroup && moreIcon)"
                          title="更多"
                          type="icon-gengduo1"
                          class="mr-2 text-indigo cursor-pointer text-base"
                          @click.stop="moreOption(item)"></a-iconfont>
              <slot name="more"
                    :item="item"></slot>
              <a-iconfont v-if="deleteIcon && !(item.isSelf && selfUnDeleted)"
                          title="删除"
                          type="icon-guanbi"
                          class="mr-2 text-black9 cursor-pointer text-base hover:text-red"
                          @click.stop="deleteContact(item)"></a-iconfont>
            </div>
          </a-list-item>
        </template>
      </recycle-scroller>
      <div v-else class="flex items-center justify-center h-full">
        <common-empty class="text-grey" image="empty-contact" text="暂无联系人"/>
      </div>
    </div>
  </a-layout>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller';
import CommonEmpty from '../../Shared/CommonEmpty.vue';
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css';

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
  },
  components : {
    RecycleScroller,
    CommonEmpty,
  },
  data() {
    return {
      selectedContact : {},
      enableScroll    : false,
      pathList        : [],
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


      const pathList = this.store.findBranch(group).map((i) => ({
        text : i.name,
        id   : i.id,
      })).reverse();

      pathList.push({ text: currentGroup.name, id: currentGroup.id });

      return pathList;
    },
    clickItem(item) {
      //  if (this.checkable) this.contactChecked(item);
      // if (this.highlightSelected) this.selectedContact = item;
      this.$emit('clickItem', item);
    },
    deleteContact(item) {
      if (this.selfUnDeleted && item.isSelf) return;
      this.$emit('deleteContact', item);
    },
    doVideo(item) {
      const list = [];

      if (!item.isGroup) {
        list.push({
          requestUri : item.number,
        });
      }
      else {
        item.items.every((contact) => {
          if (!contact.isGroup) {
            list.push({ requestUri: contact.number });
          }

          return list.length < 100;
        });
      }
      this.$rtc.conference.meetnow(list, { subject: `${this.$rtc.account.username} 的视频会议` });
    },
    doAudio(item) {
      if (item.isGroup) {
        this.doVideo(item);
        
        return;
      }
      this.$dispatch('call.doAudioCall', item.number);
    },
    moreOption(item) {
      this.$emit('moreOption', item);
    },
    switchContact(direction) {
      const { items } = this.selectedContact.parent;
      const index = items.findIndex((c) => this.selectedContact.id === c.id);
      const length = items.length;
      const cursor = direction === 'down' ? index + 1 : index - 1;

      this.enableScroll = !(cursor < length && cursor >= 0) || items[cursor].isGroup;
      if (this.enableScroll) return;
      this.clickItem(items[cursor]);
    },
    nextContact() {
      if (!this.selectedContact.parent || !this.enableKeyboard) return;
      this.switchContact('down');
    },
    preContact() {
      if (!this.selectedContact.parent || !this.enableKeyboard) return;
      this.switchContact('up');
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
      return;
      const { parent } = item;

      if (parent.isUser || parent.isExternal) return '暂时无法获取当前联系人的个性签名信息。';
      else if (parent.isDevice) return '暂时无法获取当前设备绑定的会议室';
      else if (parent.isVMR) return '暂时无法获取当前虚拟会议模式';
      else if (parent.isService) return '服务号';
    },
  },
  mounted() {
    this.$nextTick().then(() => {
      if (!this.enableKeyboard) return;
      document.getElementById('contact-list').onkeydown = (evt) => { // 阻止按键导致的滚动
        const key = evt.key;

        return this.enableScroll || !(key === 'ArrowDown' || key === 'ArrowUp');
      };
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
