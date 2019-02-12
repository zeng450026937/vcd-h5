<template>
  <a-layout id="contact-list" class="h-full bg-white">
    <div class="h-full overflow-y-hidden">
      <recycle-scroller
          :items="contactListWithHeight"
          :buffer="20"
          :page-mode="false"
          key-field="id"
          class="h-full"
      >
        <template slot-scope="{item}">
          <a-list-item class="px-1 cursor-pointer group"
                       :class="{'bg-grey-light':selectedContact.id === item.id,
                             'hover:bg-grey-lighter': selectedContact.id !== item.id,
                             'h-14' : !item.isGroup,
                             'h-12' : item.isGroup}"
                       @click="clickItem(item)">
            <a-list-item-meta class="w-full">
              <div slot="title" class="truncate">
                <div class="flex flex-col justify-center">
                  <span class="text-sm leading-none truncate">{{item | nameTrim}}</span>
                  <span v-if="!item.isGroup"
                        class="text-xs opacity-75 leading-none"
                        style="margin-top: 6px">{{item.ip}}</span>
                </div>
              </div>

              <a-popover
                  placement="rightTop"
                  trigger="hover"
                  slot="avatar"
                  overlayClassName="avatar-popover">
                <template v-if="!item.isGroup" slot="content">
                  <div class="flex w-80 flex-col shadow">
                    <!--头部-->
                    <div class="flex items-center w-full px-5 py-4 bg-card-title rounded-t text-white">
                      <div class="flex flex-col max-w-4/5 flex-grow">
                        <div class="text-base leading-loose">{{item.name}}</div>
                        <div v-if="item.parent.isUser"
                             class="truncate text-xs font-thin leading-tight opacity-75 mt-1">
                          <span>个性签名，只显示一行，如果超出一行则超出的部分省略不显示</span>
                        </div>
                      </div>
                      <div class="flex justify-center ml-3">
                        <a-avatar v-if="item.isGroup || !item.parent.isUser"
                                  :icon="item.avatar"
                                  :size="48"
                                  :class="{[`bg-${item.isGroup ? 'transparent' : 'indigo-dark'}`]: true,
                                  [`text-${item.isGroup ? 'grey-dark' : 'white'}`]: true}"/>
                        <a-avatar v-else :size="48"
                                  class="bg-indigo-dark"
                                  :class="{[`bg-${item.avatar }`]: item.avatar}">
                          {{item.name|avatarTrim}}
                        </a-avatar>
                      </div>
                    </div>

                    <div class="flex flex-col px-5 py-3 text-xs">
                      <div class="flex items-center">
                        <a-icon type="user"></a-icon>
                        <span class="mx-3 truncate">账号</span>
                        <span>{{item.ip || item.account}}</span>
                        <div class="flex flex-grow"></div>
                        <a-icon theme="filled"
                                type="video-camera"
                                class="mr-4 text-indigo cursor-pointer text-sm"/>
                        <a-icon theme="filled"
                                type="phone"
                                class="text-indigo cursor-pointer text-sm"/>
                      </div>
                      <template v-if="item.parent.isUser">
                        <div class="mt-3 ">
                          <a-icon type="phone"></a-icon>
                          <span class="mx-3">手机</span>
                          <span>{{item.phone}}</span>
                        </div>
                        <div class="mt-3">
                          <a-icon type="mail"></a-icon>
                          <span class="mx-3">邮箱</span>
                          <span>{{item.email || '暂无邮箱'}}</span>
                        </div>
                        <div class="mt-3 flex">
                          <a-icon type="home"></a-icon>
                          <span class="mx-3 whitespace-no-wrap">部门</span>
                          <span class="text-indigo">{{item | fullName}}</span>
                        </div>
                      </template>
                    </div>

                  </div>
                </template>
                <a-avatar v-if="item.isGroup || !item.parent.isUser"
                          :icon="item.avatar"
                          class="text-sm mx-2"
                          :class="{[`bg-${item.isGroup ? 'transparent' : 'indigo-dark'}`]: true,
                                  [`text-${item.isGroup ? 'grey-dark' : 'white'}`]: true}"/>
                <a-avatar v-else
                          class="bg-indigo-dark mx-2 text-sm"
                          :class="{[`bg-${item.avatar}`]: item.avatar}">
                  {{item.name|avatarTrim}}
                </a-avatar>
              </a-popover>
            </a-list-item-meta>
            <div class="opacity-0 group-hover:opacity-100 flex justify-around"
                 :class="{'opacity-100': selectedContact.id === item.id}">
              <a-icon v-if="videoIcon"
                      theme="filled"
                      type="video-camera"
                      class="mr-3 text-indigo cursor-pointer text-sm"
                      @click.stop="doVideo(item)"/>
              <a-icon v-if="audioIcon"
                      theme="filled"
                      type="phone"
                      class="mr-3 text-indigo cursor-pointer text-sm"
                      @click.stop="doAudio(item)"/>
              <a-icon v-if="(item.isGroup && groupMoreIcon) || (!item.isGroup && moreIcon)"
                      type="ellipsis"
                      class="mr-2 text-indigo cursor-pointer text-sm"
                      @click.stop="moreOption(item)"/>
              <slot name="more" :item="item"></slot>
              <a-icon v-if="deleteIcon"
                      type="close"
                      class="mr-2 text-indigo cursor-pointer text-sm"
                      @click.stop="deleteContact(item)"/>
            </div>
          </a-list-item>
        </template>
      </recycle-scroller>
    </div>
  </a-layout>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller';
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
  },
  components : {
    RecycleScroller,
  },
  data() {
    return {
      selectedContact : {},
    };
  },
  computed : {
    contactListWithHeight() {
      return this.contactList.map((item) => {
        item.height = item.isGroup ? 48 : 56;

        return item;
      });
    },
  },
  mounted() {
  },
  methods : {
    clickItem(item) {
      if (this.highlightSelected) this.selectedContact = item;
      this.$emit('clickItem', item);
    },
    deleteContact(item) {
      this.$emit('deleteContact', item);
    },
    doVideo(item) {
      this.$emit('doVideo', item);
    },
    doAudio(item) {
      this.$emit('doAudio', item);
    },
    moreOption(item) {
      this.$emit('moreOption', item);
    },
  },
  watch   : {},
  filters : {
    avatarTrim(val) {
      return val.substr(-2, 2);
    },
    nameTrim({ name, amount, isGroup }, isToolTip) {
      if (!isToolTip) name = name.length > 20 ? `${name.slice(0, 20)}...` : name;
      if (isGroup) name = `${name}（${amount}）`;

      return name;
    },
    fullName(item) {
      if (!item.parent.fullPath) {
        const fullPath = [];
        let tmpParent = item.parent;

        while (tmpParent) {
          fullPath.push({
            id   : tmpParent.id,
            text : tmpParent.name,
          });
          tmpParent = tmpParent.parent;
        }
        item.parent.fullPath = fullPath.reverse();
      }

      return item.parent.fullPath.map((b) => b.text).join('/');
    },
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