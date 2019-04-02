<template>
  <a-layout id="call-record-info" class="h-full">
    <div class="flex  flex-col h-full">
      <div class="h-14">
        <div class="flex bg-white dragable h-full">
          <div class="flex items-center h-full px-4 text-base no-dragable cursor-pointer">
            <a-iconfont type="icon-left"
                        class="text-grey-dark text-base mr-2 hover:text-purple-dark"
                        @click="goBack"/>
            <span>通话详情</span>
          </div>
          <div class="flex flex-grow"></div>
          <app-header/>
        </div>
      </div>
      <a-divider class="my-0 "/>
      <div class="h-full m-4 bg-white flex items-center flex-col border" v-if="ready">
        <div class="flex w-3/4 flex-col h-full">
          <div>

            <div class="flex py-5 items-center w-full border-b" v-if="!records[0].isConference">
              <div class="flex flex-col truncate">
                <div class="font-semibold leading-normal text-base items-center truncate">
                  {{contact.name}}
                </div>
                <div class="mt-2 text-xs leading-tight text-black-lightest opacity-75 whitespace-normal">
                  暂时无法获取当前联系人的个性签名信息。
                </div>
              </div>
              <div class="flex flex-grow"></div>
              <div class="ml-16" >
                <a-avatar :size="72" v-if="!contact.unknown">
                  <span class="text-lg">{{contact.name}}</span>
                </a-avatar>
                <a-avatar :size="72" v-else class="bg-indigo" icon="team"></a-avatar>
              </div>
            </div>

            <div class="flex py-5 items-center w-full border-b" v-else>
              <div class="flex flex-col truncate">
                <div class="font-semibold leading-normal text-base items-center truncate">
                  {{records[0].subject}}
                </div>
                <div class="mt-2 text-xs leading-tight text-black-lightest opacity-75 whitespace-normal">
                  视频会议
                </div>
              </div>
              <div class="flex flex-grow"></div>
              <div class="ml-16" >
                <a-avatar :size="72" class="bg-indigo">
                  <a-iconfont class="text-3xl" type="icon-huiyishi"></a-iconfont>
                </a-avatar>
              </div>
            </div>

          </div>
          <div>
            <div class="flex flex-col py-5 border-b" v-if="!records[0].isConference">
              <div v-if="!contact.unknown">
                <a-row class="text-xs">
                  <a-col :span="24" class="leading-tight">
                    <a-row>
                      <a-col :span="2">账号</a-col>
                      <a-col :span="8">{{contact.number}}</a-col>
                      <a-col :span="2">邮箱</a-col>
                      <a-col :span="8">{{contact.email}}</a-col>
                    </a-row>
                  </a-col>
                  <a-col :span="24" class="mt-3 leading-tight">
                    <a-row>
                      <a-col :span="2">手机</a-col>
                      <a-col :span="8">{{contact.phone}}</a-col>
                      <a-col :span="2">部门</a-col>
                      <a-col :span="8" class="text-indigo cursor-pointer"
                             @click="addLocalContact">{{contact.parentNode}}{{contact.isLocal ? '本地联系人' : '（添加本地联系人）'}}
                      </a-col>
                    </a-row>
                  </a-col>
                </a-row>
              </div>
              <div v-else>
                <div class="text-xs">
                  <div class="leading-tight flex justify-between">
                    <div :span="2">账号<span class="ml-4">{{contact.number}}</span></div>

                    <div :span="4" class="text-indigo cursor-pointer"
                         @click="addLocalContact">添加为本地联系人
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex flex-col py-5 border-b" v-if="records[0].isConference">
              <div>
                <div class="text-xs">
                  <div class="leading-tight flex">
                    <div class="mr-5" :span="2">会议ID </div>
                    <span>{{records[0].conferenceNumber}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-col my-1 flex-grow overflow-y-auto">
            <div v-for="(records, key) in recordGroup" :key="key">
              <div class="text-semibold mt-3 leading-normal">{{key|genDateString}}</div>
              <a-row class="mt-3 text-xs leading-tight" v-for="(record, index) in records" :key="index">
                <a-col :span="6">{{record.startTime|getTime}}</a-col>
                <a-col :span="13">
                  <div class="flex items-center" :class="{'text-red':!record.connected}">
                    <a-iconfont :type='record|callIcon' class="text-base" theme="filled"></a-iconfont>
                    <span class="ml-2 text-xs">{{record|callType}}</span>
                  </div>
                </a-col>
                <a-col :span="5">{{record|duration}}</a-col>
              </a-row>
            </div>
          </div>
        </div>

        <div class="flex justify-center py-2 border-t w-full">
          <a-button @click="doVideo(records[0])" class="ml-4"
                    type="primary">
            <a-iconfont type="icon-shipin"/>
            视频通话
          </a-button>
          <a-button @click="doAudio(records[0])" class="ml-4"
                    type="primary">
            <a-iconfont type="icon-yuyin"/>
            音频通话
          </a-button>
        </div>
      </div>
    </div>

    <div>
      <local-contact-drawer ref="localContactDrawer" :type="drawerType"/>
    </div>

  </a-layout>
</template>

<script>
import { groupBy } from 'lodash/fp';
import AppHeader from '../MainHeader.vue';
import { CallRecord } from '../../../database/call-record';
import { getDate, genDateString, genDurationTime, getTime } from '../../../utils/date';
import { callType, callIcon } from '../../../utils/filters';
import LocalContactDrawer from '../Contact/LocalContactDrawer.vue';

export default {
  name       : 'CallRecordInfo',
  components : {
    AppHeader,
    LocalContactDrawer,
  },
  data() {
    return {
      recordGroup    : {},
      showEditDrawer : false,
      recordInfo     : null,
      storeName      : null,
      drawerType     : 'add',
      contact        : {},
      ready          : false,
      records        : [],
    };
  },
  computed : {
    store() {
      return this.$model.contact.phoneBookStore;
    },
  },
  filters : {
    getDate,
    getTime,
    genDateString,
    callIcon,
    callType,
    duration({ startTime, endTime }) {
      if (!startTime || !endTime) return '';

      return genDurationTime(startTime, endTime);
    },
  },
  methods : {
    doVideo(item, video = true, audio = true) {
      if (item.isConference) {
        this.$dispatch('meeting.joinMeeting', {
          number       : item.conferenceNumber,
          pin          : item.pin,
          initialVideo : true,
          initialAudio : true,
        });
      }
      else {
        this.$dispatch('call.call', {
          number  : item.otherId,
          options : {
            audio,
            video,
          },
        });
      }
    },
    doAudio(item) {
      this.doVideo(item, false, true);
    },
    goBack() {
      this.$router.back();
    },
    async addLocalContact() {
      this.$refs.localContactDrawer.visible = true;
      await this.$refs.localContactDrawer.$nextTick();
      this.$refs.localContactDrawer.form.setFieldsValue({
        number : this.recordInfo.otherId,
      });
    },
    async setCallRecord() {
      const callRecordDb = CallRecord.Create();
      const records = await callRecordDb.getRecordByOtherId(this.recordInfo.otherId);
      const groupByTime = groupBy((i) => getDate(i.startTime));

      this.records = records;
      this.recordGroup = groupByTime(records);

      if (records[0].isConference) {
        return this.ready = true;
      }

      this.setContactInfo(this.recordInfo.otherId);
    },
    async setContactInfo(val) {
      let contact = this.store.getNodeByNumber(val);

      this.contact = contact;

      if (!contact) {
        const contacts = await this.$model.contact.findContacts(val);

        contact = contacts.find((n) => n.number === val);

        if (contact) {
          this.contact = contact;

          const parentNode = this.store.findParentNode(contact.id, contact.parentId);

          this.contact.parentNode = parentNode.name;
        }
      }

      if (!contact) {
        this.contact = contact = await this.$model.contact.local.search(val);
        if (contact) this.contact.isLocal = true;
      }

      if (!contact) {
        this.contact = { number: val, name: '未知联系人', unknown: true };
      }
      this.$nextTick(() => {
        this.ready = true;
      });
    },
    setRecordInfo() {
      return this.recordInfo = this.$route.query;
    },
  },
  async mounted() {
    this.setRecordInfo();
    this.setCallRecord();
  },
};
</script>

<style lang="less">
  .add-local-contact-drawer {
    .ant-drawer-wrapper-body {
      display: flex;
      flex-direction: column;
    }

    .ant-drawer-header {
      padding: 13px 18px;
    }

    .ant-drawer-body {
      display: flex;
      flex-grow: 1;
      flex-direction: column;
      padding: 0;
    }
  }
</style>
