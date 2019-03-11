<template>
  <a-layout id="call-record" class="h-full">
    <div class="flex flex-col h-full">
      <div class="h-14">
        <div class="flex bg-white dragable h-full">
          <div class="flex items-center h-full px-4 text-base">
            <span>通话记录（5）</span>
          </div>
          <div class="no-dragable flex items-center">
            <a-radio-group size="small" defaultValue="all" buttonStyle="solid">
              <a-radio-button value="all" class="text-xs">所有通话</a-radio-button>
              <a-radio-button value="un-receive" class="text-xs">未接来电</a-radio-button>
            </a-radio-group>
          </div>
          <div class="flex flex-grow"></div>
          <app-header/>
        </div>
      </div>

      <div class="flex m-4 bg-white auto-scroll-y">
        <a-table
            :pagination="false"
            :rowKey="record => record.callId"
            :columns="recordColumns"
            :dataSource="callRecord"
            class="bg-white w-full"
        >
          <div class="flex items-center" slot="callTitle" slot-scope="text, record">
            <div class="cursor-pointer mr-1">
              <a-avatar v-if="record.media === 'audio'" class="bg-indigo-dark">{{text}}</a-avatar>
              <a-avatar v-else class="bg-indigo" icon="team"></a-avatar>
            </div>
            <span class="ml-2 text-xs">{{text}}</span>
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

          <div class="flex items-center"  slot="duration" slot-scope="text, record">
            <div class="text-xs">
              {{record|duration}}
            </div>
          </div>

          <div class="flex items-center"  slot="startTime" slot-scope="text, record">
            <div class="text-xs">
              {{text|genStartTime}}
            </div>
          </div>

          <div class="flex justify-center text-sm" slot="operation" slot-scope="text, record">

            <a-iconfont type='icon-shipin'
                        class="text-indigo text-base cursor-pointer hover:text-blue">
            </a-iconfont>

            <a-iconfont type='icon-yuyin'
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
import { CallRecord, genStoreName, createRecord } from '../../../database/call-record';
import { genDurationTime, genStartTime } from '../../../utils/date';
import { callIcon, callType } from '../../../utils/filters';
import AppHeader from '../MainHeader.vue';
import { MAIN } from '../../../router/constants';

const recordColumns = [
  {
    title       : '名称',
    dataIndex   : 'callTitle',
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
  },
  data() {
    return {
      recordColumns,
      callRecord  : [],
      tableHeight : 500,
    };
  },
  methods : {
    clickMore(record) {
      this.$router.push({ path: MAIN.CALL_RECORD_INFO, query: record });
    },
    genStoreName() {
      const accountInfo = this.$storage.query('CURRENT_ACCOUNT');

      return `callRecord-${accountInfo.account}-${accountInfo.server}`;
    },
  },
  filters : {
    callType,
    callIcon,
    genStartTime,
    duration({ startTime, endTime }) {
      return genDurationTime(startTime, endTime);
    },
  },
  async beforeCreate() {
    const storeName = genStoreName();
    const callRecordDb = CallRecord.Create();

    this.callRecord = await callRecordDb.getRecordByRecent(storeName, 100);

    if (this.callRecord.length > 100) return;
    const newRecord = createRecord();

    await callRecordDb.add(storeName, newRecord);
  },
  mounted() {
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
        >tr >th {
          padding: 0;
          background-color: white;
          height: 40px;
          div{
            padding-left: 16px;
          }
        }
      }
      .ant-table-tbody {
        color: #333333;
        line-height: 20px;
        tr:hover {
          & td {
            background: #E1E5F2;
          }
        }
        >tr >td {
          padding: 0 16px;
          background-color: white;
          height: 56px;
        }
      }
    }
  }
  .auto-scroll-y{
    overflow-y: auto !important;
  }
</style>
