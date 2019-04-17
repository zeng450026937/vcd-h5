<template>
  <div class="call-record-content">

    <div class="record-header">
      <a-radio-group v-model="recordType" size="small" defaultValue="all" buttonStyle="solid">
        <a-radio-button value="all" class="text-xs">所有通话</a-radio-button>
        <a-radio-button value="missed" class="text-xs">未接来电</a-radio-button>
      </a-radio-group>
    </div>


    <div class="record-list">
      <div class="record-item" @click="toDetail(record)" v-for="record in currentRecords" :key="record.id">
          <div class="record-subject">
            <ContactPopover @update-info="handleUpdateInfo" @call="handleCall" :info="record"></ContactPopover>
            <div class="subject">{{ record | recordName}}</div>
          </div>
          <div class="record-info" >
            <div class="record-info-status"
                 :class="{
                  'text-red':!(!record.connected && record.refuse === true && record.type === 'callout') && (!record.connected)
                 }">
              <a-iconfont  :type='record|callIcon' class="text-base mr-1" theme="filled"></a-iconfont>
              <div>{{record|callType}}</div>
            </div>
            <div class="record-info-duration">
              {{record|duration}}
            </div>
          </div>
          <div class="record-operate">
            <div class="record-date">
              {{record.startTime|genStartTime}}
            </div>
            <div class="record-operate-btns">
              <a-iconfont
                  @click.stop="doVideo(record)"
                  type='icon-shipin'
                  class="text-indigo text-base cursor-pointer hover:text-blue">
              </a-iconfont>

              <a-iconfont
                  @click.stop="doAudio(record)"
                  type='icon-yuyin'
                  class="text-indigo text-base cursor-pointer hover:text-blue mx-5">
              </a-iconfont>

              <a-iconfont type='icon-right'
                          class="text-indigo text-base cursor-pointer hover:text-blue"
                          @click="toDetail(record)">
              </a-iconfont>
            </div>
          </div>
      </div>
    </div>

  </div>
</template>

<script>
import { CallRecord } from '../../database/call-record';
import { genDurationTime, genStartTime } from '../../utils/date';
import { callIcon, callType } from '../../utils/filters';
import ContactPopover from '../Main/Contact/ContactPopover.vue';

export default {
  name       : 'record',
  components : {
    ContactPopover,
  },
  data() {
    return {
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
      const type = this.recordType;

      if (type === 'all') return this.callRecord;

      if (type === 'missed') return this.callRecord.filter((record) => !record.connected && (record.type === 'incoming' || record.direction === 'incoming'));

      return [];
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
    toDetail(record) {
      this.$emit('toDetail', record);
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
    classification(records) {
      const polymerization = [];

      records.forEach((record) => {
        if (polymerization.length === 0) return polymerization.push(record);

        const lastRecord = polymerization[polymerization.length - 1];

        if (lastRecord.otherId === record.otherId
          && lastRecord.type === record.type && lastRecord.refuse === record.refuse) {
          polymerization[polymerization.length - 1] = record;
        }
        else {
          polymerization.push(record);
        }
      });

      return polymerization;
    },
    async updateRecord() {
      const { account, server } = this.$storage.query('CURRENT_ACCOUNT');

      const records = await this.callRecordDb.getRecordByRecent([ account, server ], 100);

      this.callRecord = this.classification(records);


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
    duration({ startTime, endTime, type, connected, refuse }) {
      if (!connected && refuse === true && type === 'callout') return '已取消';

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

<style scoped lang="less">
  .call-record-content{
    padding: 0 20px ;
    height: 100%;
    width: 100%;

    .record-header{
      padding: 12px 0;
      border-bottom: 1px solid #e0e0e0;
      width: 100%;
    }
    .record-list {
      height: calc( 100% - 80px);
      overflow-y: auto;
      .record-item {
        display: flex;
        align-items: center;
        height: 56px;
        cursor: pointer;
        .record-operate-btns {
          max-height: 0;
          overflow: hidden;
        }
        &:hover {
          background: #E1E5F2;
          .record-operate-btns {
            max-height: 20px;
          }
          .record-date {
            max-height: 0;
            overflow: hidden;
          }
        }
        .record-subject {
          width: 46%;
          display: flex;
          align-items: center;
          padding:0 20px 0 10px;
          overflow: hidden;
          .subject {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex-grow: 1;
            padding-left: 10px;
          }
        }
        .record-info {
          width: 20%;
          display: flex;
          flex-direction: column;
          padding: 0 2px;
          .record-info-status {
            display: flex;
          }
          .record-info-duration {
            font-size: 12px;
            color: #999999;
          }
        }
        .record-operate {
          text-align: center;
          width: 34%;
          overflow: hidden;
          .record-date {
            font-size: 12px;
            color: #999999;
          }
        }
      }
    }
  }


</style>
