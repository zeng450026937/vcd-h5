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

      <div class="flex m-4 h-full bg-white">
        <a-table
            :rowKey="record => record.callId"
            :columns="recordColumns"
            :dataSource="callRecord"
            align="center"
            class="bg-white h-full w-full"
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
                        @click="clickMore">
            </a-iconfont>

          </div>
        </a-table>
      </div>
    </div>
  </a-layout>
</template>

<script>
import { flow as pipe } from 'lodash/fp';
import { callRecord, createRecord } from '../../../database/call-record';
import AppHeader from '../MainHeader.vue';
import { MAIN } from '../../../router/constants';

function genDouble(num) {
  return num < 10 ? `0${num}` : `${num}`;
}

function genDurationTime(start, end) {
  start = new Date(start).valueOf();
  end = new Date(end).valueOf();
  const diff = end - start;
  const format = pipe(Math.floor, Math.abs, genDouble);
  const seconds = format((Math.abs(diff) / 1000) % 60);
  const minutes = format((Math.abs(diff) / 1000 / 60) % 60);
  const hours = format((Math.abs(diff) / (1000 * 60 * 60)));

  if (!hours) return `${minutes}:${seconds}`;

  return `${hours}:${minutes}:${seconds}`;
}

function isToday(time) {
  return new Date().valueOf() - time.valueOf() < 1000 * 60 * 60 * 24;
}

function genStartTime(time) {
  time = new Date(time);
  const hours = genDouble(time.getHours());
  const minutes = genDouble(time.getMinutes());

  return isToday(time) ? `今天${hours}:${minutes}` : `${hours}:${minutes}`;
}

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
      callRecord : [],
    };
  },
  methods : {
    clickMore() {
      this.$router.push(MAIN.CALL_RECORD_INFO);
    },
  },
  filters : {
    callType(record) {
      if (!record.connected) return '未接通';
      if (record.type === 'incoming') return '呼入';
      if (record.type === 'outcall') return '呼出';
    },
    callIcon(record) {
      const iconMap = {
        audio : {
          base     : 'icon-yuyin',
          outcall  : 'icon-yuyinhuchu',
          incoming : 'icon-yuyinhuru',
        },
        video : {
          base     : 'icon-shipin',
          outcall  : 'icon-shipinhuchu',
          incoming : 'icon-shipinhuru' },
      };
      const media = iconMap[record.media];

      if (!record.connected) return media.base;

      return media[record.type];
    },
    genStartTime,
    duration({ startTime, endTime }) {
      return genDurationTime(startTime, endTime);
    },
  },
  async mounted() {
    this.callRecord = await callRecord.getAllData('callRecord');

    const newRecord = createRecord();

    if (this.callRecord.length > 6) return;

    await callRecord.add('callRecord', newRecord);
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
</style>
