<template>
  <a-layout id="call-record" class="h-full">
    <div class="flex flex-col h-full">
      <app-header>
        <template slot="content">
          <div class="flex items-center h-full px-4 text-base">
            <span>通话记录（{{callRecord.length}}）</span>
          </div>
          <div class="no-dragable flex items-center">
            <a-radio-group v-model="recordType" size="small" defaultValue="all" buttonStyle="solid">
              <a-radio-button value="all" class="text-xs">所有通话</a-radio-button>
              <a-radio-button value="missed" class="text-xs">未接来电</a-radio-button>
            </a-radio-group>
          </div>
        </template>
      </app-header>

      <div class="flex m-4 bg-white auto-scroll-y">
        <a-table
            v-if="ready"
            :pagination="false"
            :rowKey="record => record.id"
            :columns="recordColumns"
            :dataSource="currentRecords"
            class="bg-white w-full"
        >
          <div class="flex items-center" slot="callTitle" slot-scope="text, record">
            <div class="cursor-pointer mr-1">

              <ContactPopover @update-info="handleUpdateInfo" @call="handleCall" :info="record"></ContactPopover>

            </div>
            <span class="ml-2 text-xs">{{ record | recordName}}</span>
          </div>

          <div
              class="flex items-center"
              slot="type"
              slot-scope="text, record"
              :class="{'text-red':!record.connected}"
          >
            <a-iconfont :type='record|callIcon' class="text-base mr-1" theme="filled"></a-iconfont>
            <span class="ml-2 text-xs">{{record|callType}}</span>
          </div>

          <div class="flex items-center" slot="duration" slot-scope="text, record">
            <div class="text-xs">
              {{record|duration}}
            </div>
          </div>

          <div class="flex items-center" slot="startTime" slot-scope="text, record">
            <div class="text-xs">
              {{text|genStartTime}}
            </div>
          </div>

          <div class="flex justify-center text-sm operate-btns" slot="operation" slot-scope="text, record">

            <a-iconfont
                @click="doVideo(record)"
                type='icon-shipin'
                class="text-indigo text-base cursor-pointer hover:text-blue">
            </a-iconfont>

            <a-iconfont
                @click="doAudio(record)"
                type='icon-yuyin'
                class="text-indigo text-base cursor-pointer hover:text-blue mx-5">
            </a-iconfont>

            <a-iconfont type='icon-right'
                        class="text-indigo text-base cursor-pointer hover:text-blue"
                        @click="clickMore(record)">
            </a-iconfont>

          </div>
        </a-table>
      </div>
    </div>
  </a-layout>
</template>

<script>
import { CallRecord } from '../../../database/call-record';
import { genDurationTime, genStartTime } from '../../../utils/date';
import { callIcon, callType } from '../../../utils/filters';
import AppHeader from '../../../components/Main/MainHeader.vue';
import { MAIN } from '../../../router/constants';
import ContactPopover from '../../../components/Main/Contact/ContactPopover.vue';

const recordColumns = [
  {
    title       : '名称',
    dataIndex   : 'subject',
    scopedSlots : { customRender: 'callTitle' },
  },
  {
    title       : '类型',
    dataIndex   : 'media',
    scopedSlots : { customRender: 'type' },
  },
  {
    title       : '持续时间',
    dataIndex   : 'endTime',
    scopedSlots : { customRender: 'duration' },
  },
  {
    title       : '时间',
    dataIndex   : 'startTime',
    scopedSlots : { customRender: 'startTime' },
  },
  {
    title       : '',
    dataIndex   : 'operation',
    scopedSlots : { customRender: 'operation' },
  },
];

export default {
  name       : 'CallRecord',
  components : {
    AppHeader,
    ContactPopover,
  },
  data() {
    return {
      recordColumns,
      callRecord : [],
      recordType : 'all',
      ready      : true,
    };
  },
  computed : {
    store() {
      return this.$model.contact.phoneBookStore;
    },
    currentRecords() {
      if (this.recordType === 'all') return this.callRecord;

      if (this.recordType === 'missed') return this.callRecord.filter((record) => !record.connected);
    },
    recordUpdate() {
      return this.$model.state.recordUpdate;
    },
  },
  watch : {
    recordUpdate(val) {
      this.updateRecord();
    },
  },
  methods : {
    clickMore(record) {
      this.$router.push({ path: MAIN.CALL_RECORD_INFO, query: record });
    },
    handleCall({ info, type }) {
      if (type === 'video') {
        return this.doVideo(info);
      }

      if (type === 'audio') {
        return this.doAudio(info);
      }
    },
    doVideo(item, video = true, audio = true) {
      if (item.isConference) {
        this.$dispatch('meeting.joinMeeting', {
          number       : item.conferenceNumber,
          pin          : item.pin,
          initialVideo : true,
          initialAudio : true,
        })
          .then(() => {
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
    async updateRecord() {
      const { account, server } = this.$storage.query('CURRENT_ACCOUNT');

      this.callRecord = await this.callRecordDb.getRecordByRecent([ account, server ], 100);

      this.ready = true;
    },
    handleUpdateInfo({ id, contact }) {
      this.currentRecords.forEach((i) => {
        if (i.otherId === id) {
          i.contact = contact;
        }
      });
      this.$forceUpdate();
    },
  },
  filters : {
    callType,
    callIcon,
    genStartTime,
    duration({ startTime, endTime }) {
      if (!endTime || !startTime) return '';

      return genDurationTime(startTime, endTime);
    },
    name(name) {
      return /^(.*)\(.*\)$/.test(name) ? RegExp.$1.substr(-2, 2) : name.substr(-2, 2);
    },
    recordName(record) {
      if (record.isConference) {
        if (!record.subject) return '未知联系人';

        return record.subject;
      }

      if (!record.contact) return '';

      return record.contact.name;
    },
  },
  async beforeCreate() {
    this.callRecordDb = CallRecord.Create();
  },
  mounted() {
    this.updateRecord();
  },
  beforeDestroy() {
  },
};
</script>

<style lang="less">
  #call-record {
    .ant-table-wrapper {
      padding: 0;

      .ant-table-thead {
        font-size: 12px;
        color: #333333;
        line-height: 20px;

        > tr > th {
          padding: 0;
          background-color: white;
          height: 40px;

          div {
            padding-left: 16px;
          }
        }
      }

      .ant-table-tbody {
        color: #333333;
        line-height: 20px;

        .operate-btns {
          max-height: 0;
          overflow: hidden;
        }

        tr:hover {
          .operate-btns {
            max-height: initial;
          }

          & td {
            background: #E1E5F2;
          }
        }

        > tr > td {
          padding: 0 16px;
          background-color: white;
          height: 56px;
        }
      }
    }

    .ant-table-tbody > tr > td {
      transition: unset;
    }
  }

  .auto-scroll-y {
    overflow-y: auto !important;
  }
</style>
