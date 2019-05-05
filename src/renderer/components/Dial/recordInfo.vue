<template>
  <div class="h-full w-full">
    <div class="h-full  bg-white flex items-center flex-col" v-if="ready">
      <div class="flex w-3/4 flex-col h-full">
        <div class="flex py-5 items-center w-full border-b" v-if="!this.recordInfo.isConference">
          <div class="flex flex-col truncate" style="max-width: 600px">
            <div class="font-semibold leading-normal text-base items-center truncate">
              {{contact.name}}
            </div>
            <div class="mt-2 text-xs leading-tight text-black-lightest opacity-75 whitespace-normal">
              {{$('contact.label.unknownInfo')}}
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
          <div class="flex flex-col truncate" style="max-width: 600px">
            <div class="font-semibold leading-normal text-base items-center truncate">
              {{recordInfo.subject}}
            </div>
            <div class="mt-2 text-xs leading-tight text-black-lightest opacity-75 whitespace-normal">
              {{$t('contact.label.videoConference')}}
            </div>
          </div>
          <div class="flex flex-grow"></div>
          <div class="ml-16" >
            <a-avatar :size="72" class="bg-indigo">
              <a-iconfont class="text-3xl" type="icon-huiyishi"></a-iconfont>
            </a-avatar>
          </div>
        </div>

        <div>
          <div class="flex flex-col py-5 border-b" v-if="!this.recordInfo.isConference">
            <div v-if="!contact.unknown">
              <a-row class="text-xs">
                <a-col :span="24" class="leading-tight">
                  <a-row>
                    <a-col :span="2">{{$t('contact.label.name')}}</a-col>
                    <a-col :span="8">{{contact.number}}</a-col>
                    <a-col :span="2">{{$t('contact.label.email')}}</a-col>
                    <a-col :span="8">{{contact.email}}</a-col>
                  </a-row>
                </a-col>
                <a-col :span="24" class="mt-3 leading-tight">
                  <a-row>
                    <a-col :span="2">{{$t('contact.label.phone')}}</a-col>
                    <a-col :span="8">{{contact.phone}}</a-col>
                    <a-col :span="2">{{$t('contact.label.department')}}</a-col>
                    <a-col :span="8" class="text-indigo">
                      {{contact.parentNode}}{{contact.isLocal ? $t('contact.local.describe') : ''}}
                    </a-col>
                  </a-row>
                </a-col>
              </a-row>
            </div>
            <div v-else>
              <div class="text-xs">
                <div class="leading-tight flex justify-between">
                  <div :span="2">
                    {{$t('contact.label.account')}}
                    <span class="ml-4">{{contact.number}}</span>
                  </div>

                  <div :span="4"
                       class="text-indigo cursor-pointer"
                       @click="addLocalContact">
                    {{$t('contact.local.title.addAs')}}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-col py-5 border-b" v-if="this.recordInfo.isConference">
            <div>
              <div class="text-xs">
                <div class="leading-tight flex">
                  <div class="mr-5" :span="2">
                    {{$t('contact.label.conferenceId')}}
                  </div>
                  <span>{{this.recordInfo.conferenceNumber}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col my-1 flex-grow overflow-y-auto">
          <div v-for="(group) in recordGroupList" :key="group.time">
            <div class="text-semibold mt-3 leading-normal">{{group.time|genDateString}}</div>
            <a-row class="mt-3 text-xs leading-tight" v-for="(record, index) in group.records" :key="index">
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
        <a-button @click="doVideo(recordInfo)" class="ml-4"
                  type="primary">
          <a-iconfont type="icon-shipin"></a-iconfont>
          {{$t('dial.button.video')}}
        </a-button>
        <a-button @click="doAudio(recordInfo)" class="ml-4"
                  type="primary">
          <a-iconfont type="icon-yuyin"></a-iconfont>
          {{$t('dial.button.audio')}}
        </a-button>
      </div>
    </div>

    <local-contact-drawer ref="localContactDrawer" :type="drawerType"/>

  </div>
</template>

<script>
import { groupBy } from 'lodash/fp';
import { CallRecord } from '../../database/call-record';
import { getDate, genDateString, genDurationTime, getTime } from '../../utils/date';
import { callType, callIcon } from '../../utils/filters';
import LocalContactDrawer from '../Main/Contact/LocalContactDrawer.vue';

export default {
  name       : 'CallRecordInfo',
  components : {
    LocalContactDrawer,
  },
  props : {
    recordInfo : {
      type : Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      recordGroupList : {},
      showEditDrawer  : false,
      storeName       : null,
      drawerType      : 'add',
      contact         : {},
      ready           : false,
      records         : [],
    };
  },
  computed : {
    store() {
      return this.$model.contact.phoneBookStore;
    },
    loadMode() {
      return this.$model.contact.loadMode;
    },
    isCloud() {
      return this.$model.account.serverType === 'cloud';
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
        }).then(() => {
          this.$model.conference.sketch.isVideoConference = video;
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
      this.$emit('add-local', this.recordInfo.otherId);
    },
    async setCallRecord() {
      const callRecordDb = CallRecord.Create();
      const records = this.recordInfo.otherId
        ? await callRecordDb.getRecordByOtherId(this.recordInfo.otherId)
        : [ this.recordInfo ];
      const groupByTime = groupBy((i) => getDate(i.startTime));

      this.records = records;

      const recordGroup = groupByTime(records);
      const recordGroupList = [];

      Object.keys(recordGroup).reverse().forEach((key) => {
        recordGroupList.push({
          time    : key,
          records : recordGroup[key],
        });
      });

      this.recordGroupList = recordGroupList;

      if (this.recordInfo.isConference) {
        return this.ready = true;
      }

      this.setContactInfo(this.recordInfo.otherId);
    },
    async setContactInfo(val) {
      let contact = this.store.getNodeByNumber(val);

      this.contact = contact;

      if (!contact) {
        if (this.loadMode === 'SPLIT' && !this.isCloud) {
          const contacts = await this.$model.contact.findContacts(val).catch(() => Promise.resolve(null));

          contact = contacts.find((n) => n.number === val);
        }
      }

      if (!contact) {
        this.contact = contact = await this.$model.contact.local.search(val);
        if (contact) this.contact.isLocal = true;
      }

      if (!contact) {
        this.contact = { number: val, name: this.$t('contact.label.unknown'), unknown: true };
      }

      if (contact) {
        this.contact = contact;

        const parentNode = this.store.findParentNode(contact.id, contact.parentId);

        this.contact.parentNode = parentNode.name;
      }

      this.$nextTick(() => {
        this.ready = true;
      });
    },
  },
  async mounted() {
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
