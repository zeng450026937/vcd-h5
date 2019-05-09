<template>
  <div class="call-record-content">

    <div class="record-header">
      <a-radio-group v-model="recordType" size="small" defaultValue="all" buttonStyle="solid">
        <a-radio-button value="all" class="text-xs">{{$t('dial.record.all')}}</a-radio-button>
        <a-radio-button value="missed" class="text-xs">{{$t('dial.record.missed')}}</a-radio-button>
      </a-radio-group>
    </div>

    <div class="record-scroll-area">
      <div class="record-list">
        <recycle-scroller :items="currentRecords"
                          v-show="currentRecords.length>0"
                          :buffer="20"
                          :page-mode="false"
                          key-field="id">
          <template v-slot="{item, index}">
            <div class="record-item" @click="toDetail(item)">
              <div class="record-subject">
                <ContactPopoverAndSub :info="item" @call="handleCall"></ContactPopoverAndSub>
                <span v-if="item.count>1">({{item.count}})</span>
              </div>
              <div class="record-info" >
                <div class="record-info-status"
                     :class="{
                  'text-red':!(!item.connected && item.refuse === true && item.type === 'callout')
                  && (!item.connected)
                 }">
                  <a-iconfont :type='item|callIcon' class="text-sm mr-1" theme="filled"></a-iconfont>
                  <div>{{item|callType}}</div>
                </div>
                <div class="record-info-duration">
                  {{item|duration}}
                </div>
              </div>
              <div class="record-operate">
                <div class="record-date">
                  {{item.startTime|genStartTime}}
                </div>
                <div class="record-operate-btns">
                  <a-iconfont
                      @click.stop="doVideo(item)"
                      type='icon-shipin'
                      class="text-indigo text-base cursor-pointer hover:text-blue">
                  </a-iconfont>

                  <a-iconfont
                      @click.stop="doAudio(item)"
                      type='icon-yuyin'
                      class="text-indigo text-base cursor-pointer hover:text-blue mx-5">
                  </a-iconfont>

                  <a-iconfont type='icon-right'
                              class="text-indigo text-base cursor-pointer hover:text-blue"
                              @click="toDetail(item)">
                  </a-iconfont>
                </div>
              </div>
            </div>
          </template>
        </recycle-scroller>

      </div>
      <div class="record-empty-content"  v-if="currentRecords.length === 0">
        <common-empty image="empty-record"></common-empty>
      </div>

    </div>

  </div>
</template>

<script>
import { RecycleScroller } from 'vue-virtual-scroller';
import { CallRecord } from '../../database/call-record';
import { genDurationTime, genStartTime } from '../../utils/date';
import { callIcon, callType } from '../../utils/filters';
import ContactPopover from '../Main/Contact/ContactPopover.vue';
import ContactPopoverAndSub from '../Main/Contact/ContactPopoverAndSub.vue';
import CommonEmpty from '../Shared/CommonEmpty.vue';
import { $t } from '../../i18n';

export default {
  name       : 'record',
  components : {
    ContactPopover,
    ContactPopoverAndSub,
    CommonEmpty,
    RecycleScroller,
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

      this.callRecord.forEach((item) => item.size = 48);
      console.log(this.callRecord);
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
        return this.doAudio(info, false, true);
      }
    },
    doVideo(item, video = true, audio = true) {
      if (item.isConference) {
        this.$dispatch('meeting.joinMeeting', {
          number       : item.conferenceNumber,
          pin          : item.pin,
          initialVideo : true,
          initialAudio : true,
          audio,
          video,
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
        record.count = 1;
        if (polymerization.length === 0) return polymerization.push(record);

        const lastRecord = polymerization[polymerization.length - 1];

        if (lastRecord.otherId === record.otherId
          && lastRecord.type === record.type
          && lastRecord.refuse === record.refuse
          && lastRecord.media === record.media
          && lastRecord.connected === record.connected) {
          record.count = polymerization[polymerization.length - 1].count + 1;
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
  },
  filters : {
    callType,
    callIcon,
    genStartTime,
    duration({ startTime, endTime, type, connected, refuse }) {
      if (!connected && refuse === true && type === 'callout') return $t('contact.status.cancel');

      if (!endTime || !startTime) return '';

      return genDurationTime(startTime, endTime);
    },
    name(name) {
      return /^(.*)\(.*\)$/.test(name) ? RegExp.$1.substr(-2, 2) : name.substr(-2, 2);
    },
    recordName(record = {}) {
      if (record.isConference) {
        if (!record.subject) return $t('contact.label.unknown');

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
    .record-scroll-area {
      height: calc( 100% - 80px);
      overflow-y: auto;
      width: calc( 100% + 6px);
      .record-empty-content{
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .record-list {
        width: calc( 100% - 6px);
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
          }
          .record-info {
            width: 20%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: 0 2px;
            .record-info-status {
              display: flex;
              font-size: 12px;
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
  }


</style>
