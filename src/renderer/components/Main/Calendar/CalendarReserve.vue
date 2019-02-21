<template>
  <a-layout id="reserve-meeting" class="h-full">
    <div class="flex flex-col h-full">
      <div class="h-14">
        <div class="flex bg-white dragable h-full">
          <div class="flex items-center h-full px-4 text-base">
            <span>预约会议</span>
            <span class="text-indigo text-xs ml-3 cursor-pointer">更改模式</span>
          </div>
          <div class="flex flex-grow"></div>
          <app-header/>
        </div>
      </div>
      <a-divider class="my-0"/>
      <a-row class="flex h-full m-4">
        <a-col class="h-full flex flex-col border-r mr-3 bg-white flex-grow border rounded">
          <div>
            <div class="h-10 border-b flex items-center">
              <span class="ml-2">会议信息</span>
            </div>
          </div>
          <div class="flex flex-col px-4 overflow-y-auto h-full">
            <div>
              <a-row class="flex items-center mt-5">
                <a-col :span="3">会议主题</a-col>
                <a-col :span="21">
                  <a-input placeholder="请输入会议名称"/>
                </a-col>
              </a-row>
              <a-row class="flex items-center mt-5">
                <a-col :span="3">开始时间</a-col>
                <a-col :span="21" class="flex items-center">
                  <a-date-picker></a-date-picker>
                  <a-time-picker class="ml-3" :defaultValue="moment('12:08', 'HH:mm')" format="HH:mm"/>
                </a-col>
              </a-row>
              <a-row class="flex items-center mt-5">
                <a-col :span="3">会议时长</a-col>
                <a-col :span="21" class="flex items-center">
                  <a-select :defaultValue="1" class="w-24">
                    <a-select-option
                        v-for="h in 24"
                        :value="h"
                        :key="h">
                      {{h}}
                    </a-select-option>
                  </a-select>
                  <span class="mx-2 text-xs">小时</span>
                  <a-select defaultValue="1" class="w-24">
                    <a-select-option
                        v-for="m in 60"
                        :value="m"
                        :key="m">
                      {{m}}
                    </a-select-option>
                  </a-select>
                  <span class="mx-2 text-xs">分钟</span>
                  <span class="mr-2 ml-8 text-xs">周期会议</span>
                  <a-switch defaultChecked size="small"/>
                </a-col>
              </a-row>

              <a-row class="flex items-center mt-5">
                <a-col :span="3">会议周期</a-col>
                <a-col :span="21">
                  <a-select class="w-24"
                            v-model="cycleMode">
                    <a-select-option
                        v-for="mode in cycleModes"
                        :value="mode.mode"
                        :key="mode.mode">
                      {{mode.text}}
                    </a-select-option>
                  </a-select>
                  <span class="text-xs mx-3">结束时间</span>
                  <a-date-picker ref="datePicker"></a-date-picker>
                </a-col>
              </a-row>

              <a-row v-if="cycleMode === 'everyDay'"
                     class="flex items-center mt-5">
                <a-col :span="3"></a-col>
                <a-col :span="21">
                  <div>
                    <span>每</span>
                    <a-select defaultValue="1" class="w-24 mx-3">
                      <a-select-option
                          v-for="d in 10"
                          :value="d"
                          :key="d">
                        {{d}}
                      </a-select-option>
                    </a-select>
                    <span>天</span>
                  </div>
                </a-col>
              </a-row>

              <a-row v-if="cycleMode === 'everyWeek'"
                     class="flex items-center mt-5">
                <a-col :span="3"></a-col>
                <a-col :span="21">
                  <div class="flex items-center">
                    <span>每</span>
                    <a-select defaultValue="1" class="w-24 mx-3">
                      <a-select-option
                          v-for="d in 10"
                          :value="d"
                          :key="d">
                        {{d}}
                      </a-select-option>
                    </a-select>
                    <span>周</span>
                    <div class="flex ml-4 items-center">
                      <div class="w-8 h-8 cursor-pointer flex items-center justify-center hover:bg-grey-lighter"
                           v-for="week in weeks"
                           :key="week">{{week}}
                      </div>
                    </div>
                  </div>
                </a-col>
              </a-row>

              <a-row v-if="cycleMode === 'everyMonth'"
                     class="flex items-center mt-5">
                <a-col :span="3"></a-col>
                <a-col :span="21">
                  <div>
                    <span>每月</span>
                    <a-select defaultValue="1" class="w-24 mx-3">
                      <a-select-option
                          v-for="d in 31"
                          :value="d"
                          :key="d">
                        {{d}}
                      </a-select-option>
                    </a-select>
                    <span>日</span>
                  </div>
                </a-col>
              </a-row>

              <a-row class="flex items-center mt-5">
                <a-col :span="3">时区</a-col>
                <a-col :span="21">
                  <a-input placeholder="请输入时区" value="（UTC+08:00)北京，重庆，香港特别行政区，乌鲁木齐"/>
                </a-col>
              </a-row>

              <a-row class="flex items-center mt-5 mb-4">
                <a-col :span="3" class="flex self-start">备注</a-col>
                <a-col :span="21">
                  <a-textarea placeholder="Autosize height"
                              :autosize="{ minRows: 4, maxRows: 4 }"
                  ></a-textarea>
                </a-col>
              </a-row>
            </div>
          </div>
        </a-col>
        <a-col :span="7" class="h-full overflow-y-auto flex flex-col bg-white rounded border">
          <div class="flex flex-col h-full">
            <div>
              <div class="h-10 border-b flex items-center px-2">
                <span class="flex flex-grow">{{selectedContact.length || 0}}/100</span>
                <a-popover placement="bottomRight" trigger="click"
                           overlayClassName="reserve-meeting-popover">
                  <template slot="content">
                    <div class="flex flex-col p-3">
                      <span>点击头像改变参会者权限</span>
                      <div class="mt-3">
                        <a-avatar size="small" class="bg-orange">
                          <a-iconfont type="icon-ren" />
                        </a-avatar>
                        <span class="ml-2">访客</span>
                      </div>
                      <div class="mt-2">
                        <a-avatar size="small" class="bg-grey">
                          <a-iconfont type="icon-ren" />
                        </a-avatar>
                        <span class="ml-2">访客</span>
                      </div>
                    </div>
                  </template>
                  <a-iconfont type="icon-tishi" class="text-indigo-dark text-base cursor-pointer"/>
                </a-popover>
              </div>
            </div>
            <div class="flex flex-col flex-grow h-full overflow-y-auto">
              <div>
                <contact-list :contactList="selectedContact"
                              :video-icon="false"
                              :audio-icon="false"
                              delete-icon highlightSelected
                              @deleteContact="deleteContact"
                ></contact-list>
              </div>
            </div>
            <div>
              <div class="h-10 flex justify-center items-center border-t">
                <span class="text-indigo select-none cursor-pointer"
                      @click="addMember">添加参会成员</span>
              </div>
            </div>
          </div>
        </a-col>
      </a-row>
      <div>
        <div class="flex justify-center items-center h-12 border-t bg-white">
          <a-button class="w-24 mx-3 h-8 bg-indigo text-white">
            确定
          </a-button>
          <a-button class="w-24 mx-3 h-8" @click="clickBack">
            取消
          </a-button>
        </div>
      </div>

      <a-drawer
          title="添加参会成员"
          placement="right"
          :width="728"
          :closable="false"
          @close="showDrawer = false"
          :visible="showDrawer"
          wrapClassName="reserve-meeting-drawer"
      >
        <div class="flex flex-col h-full w-full">
          <div class="flex flex-col p-5 flex-grow">
            <div class="flex flex-grow">
              <div class="shadow-md" style="width: 320px;">
                <contact-tree ref="contactTree"
                              :checked="checkedKeys"
                              @onCheck="onCheck"
                ></contact-tree>
              </div>
              <div class="flex w-12 justify-center items-center">
                <a-iconfont type="icon-right" class="text-grey text-3xl cursor-pointer"/>
              </div>
              <div class="flex" style="width: 320px;">
                <div class="w-5/6 shadow-md flex flex-col">
                  <div class="border-b">
                    <div class="flex flex-col">
                      <div class="flex h-10 items-center px-3">
                        <span class="flex flex-grow text-sm">{{selectedContact.length || 0}}/100</span>
                        <span class="flex text-indigo text-xs cursor-pointer"
                              :class="{'text-grey cursor-not-allowed': selectedContact.length <= 0}"
                              @click="clearAll">全部清空</span>
                      </div>
                    </div>
                  </div>

                  <contact-list :contactList="selectedContact"
                                :video-icon="false"
                                :audio-icon="false"
                                delete-icon highlightSelected
                                @deleteContact="deleteContact"
                  ></contact-list>
                </div>
              </div>
            </div>

          </div>
          <div>
            <div class="flex h-12 py-2 justify-center border-t">
              <a-button type="primary" class="mx-2" @click="addEnsure">确定</a-button>
              <a-button class="mx-2" @click="addCancel">取消</a-button>
            </div>
          </div>
        </div>
      </a-drawer>
    </div>
  </a-layout>
</template>

<script>
/* eslint-disable no-loop-func */

import moment from 'moment';
import AppHeader from '../MainHeader.vue';
import ContactTree from '../Contact/ContactTree.vue';
import ContactList from '../Contact/ContactList.vue';

const cycleModes = [
  { mode: 'everyDay', text: '每天' },
  { mode: 'everyWeek', text: '每周' },
  { mode: 'everyMonth', text: '每月' } ];

export default {
  name       : 'CalendarReserve',
  components : {
    AppHeader,
    ContactTree,
    ContactList,
  },
  data() {
    return {
      cycleMode       : '',
      cycleModes,
      weeks           : [ '日', '一', '二', '三', '四', '五', '六' ],
      showDrawer      : false,
      selectedContact : [],
      checkedKeys     : [],
    };
  },
  mounted() {
    this.cycleMode = this.cycleModes[0].mode;
  },
  methods : {
    moment,
    clickBack() {
      this.$router.back();
    },
    addMember() {
      this.showDrawer = true;
    },
    onCheck(selectedContact) {
      this.selectedContact = selectedContact;
    },
    deleteContact(contact) {
      const { checkedKeys } = this.$refs.contactTree;
      let parent = contact;
      const i = this.selectedContact.findIndex((c) => c.id === contact.id);

      if (i >= 0) this.selectedContact.splice(i, 1);

      while (parent) {
        const index = checkedKeys.findIndex((c) => c === parent.id);

        if (index >= 0) checkedKeys.splice(index, 1);
        parent = parent.parent;
      }
    },
    genEnsurePopup(content, ensureFn, cancelFn) {
      this.$popup.destroy(this.ensureModal);
      this.ensureModal = this.$popup.prepared('ensureModal', { content });
      this.ensureModal.vm.$on('cancel', () => {
        this.ensureModal.$off('cancel');
        cancelFn();
      });
      this.ensureModal.vm.$on('ok', () => {
        this.ensureModal.$off('ok');
        this.ensureModal.hide();
        ensureFn();
      });
      this.ensureModal.display();
    },
    clearAll() {
      if (this.selectedContact.length <= 0) return;
      this.genEnsurePopup('确认清除所有的联系人?', () => {
        this.selectedContact = [];
        this.$refs.contactTree.checkedKeys = [];
      }, () => {
      });
    },
    addEnsure() {
      // this.$model.calendar.datePicker = this.$refs.datePicker;
      this.showDrawer = false;
    },
    addCancel() {
      this.showDrawer = false;
    },
  },
};
</script>

<style lang="less">
  .reserve-meeting-popover {
    .ant-popover-inner-content {
      padding: 0;
    }
  }

  .reserve-meeting-drawer {
    .ant-drawer-wrapper-body {
      display: flex;
      flex-direction: column;
    }

    .ant-drawer-header {
      padding: 13px 24px;
    }

    .ant-drawer-body {
      display: flex;
      height: 100%;
      padding: 0;
    }
  }
</style>
