<template>
  <div class="flex flex-col h-full  w-full new-meeting">

    <app-header title="新的会议"/>

    <div class="flex h-full new-meeting-content">
      <div class="nav-card-content">
        <div class="left">
          <div class="menu yellow start-meeting" @click="enterMeeting">
            <div class="icon">
              <a-iconfont type="icon-shipin"></a-iconfont>
            </div>
            <div class="title">发起会议</div>
          </div>
          <div class="menu green reservation" @click="startReservation">
            <div class="icon">
              <a-iconfont type="icon-yuyuehuiyi"></a-iconfont>
            </div>
            <div class="title">预约会议</div>
          </div>
        </div>
        <div class="right">
          <div class="meeting-info">

            <div class="date-wrap">
              <div class="date-content">
                <div class="time">
                  {{time}}
                </div>
                <div class="date">
                  {{date | format}}
                </div>
              </div>
            </div>

            <div class="recent-meeting">
              <div class="recent-meeting-header">
                下一场会议 <span class="start-time">{{tip}}</span>
              </div>
              <div class="recent-meeting-content">
                <div v-if="hasRecentScheduleEvent">
                  <div class="card-content">
                    <div class="title item">
                      {{recentScheduleEvent.subject}}
                    </div>
                    <div class="conference-id item">
                      ID : {{recentScheduleEvent.conferenceNumber}}
                    </div>
                    <div class="duration item">
                      {{recentScheduleEvent.startTime}} ~ {{recentScheduleEvent.expiryTime}}
                      <a-button @click="goMeetingDetail">详情</a-button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="recent-meeting-footer" v-if="hasRecentScheduleEvent" @click="join">
                加入会议
              </div>
            </div>

          </div>
        </div>
      </div>


    </div>
    <div class="flex flex-grow"></div>

  </div>
</template>

<script>

import { sortBy } from 'lodash';
import AppHeader from '../../../components/Main/MainHeader.vue';
import { formatDate } from '../../../utils/date';

export default {
  name       : 'NewMeeting',
  components : {
    AppHeader,
  },
  data() {
    return {

      time : '00:00',
      date : new Date(),
    };
  },
  sketch : {
    ns    : 'schedule',
    props : [ 'calendar' ],
  },
  mounted() {
    this.startClock();
  },
  filters : {
    format(date) {
      return formatDate('年-月-日', date);
    },

  },
  computed : {
    recentScheduleEvent() {
      const now = Date.now();

      let noFinished = this.calendar.filter((ev) => this.getTimestamp(ev.expiryTime) - now >= 0);

      noFinished = sortBy(noFinished, (n) => this.getTimestamp(n.startTime))[0] || {};

      return noFinished;
    },
    tip() {
      if (!this.hasRecentScheduleEvent) return '';

      const now = this.date.valueOf();
      const deltatime = now - this.getTimestamp(this.recentScheduleEvent.startTime);

      if (deltatime > 0) return '会议进行中';

      const distance = Math.abs(Math.floor(deltatime / 1000 / 60));

      if (distance > 60) return '';

      return `${distance}分钟后开始`;
    },
    hasRecentScheduleEvent() {
      return Object.keys(this.recentScheduleEvent).length > 0;
    },
  },
  methods : {
    getTimestamp(date) {
      return new Date(date).valueOf();
    },
    enterMeeting() {
      this.$dispatch('meeting.meetnow');
    },
    startReservation() {
      this.$router.push({ name: 'reservation' });
    },
    goSchedule() {
      this.$router.push({ name: 'schedule' });
      this.$dispatch('main.setCurrentSidebar', { name: 'schedule' });
    },
    genDouble(num) {
      return num < 10 ? `0${num}` : `${num}`;
    },
    getTime() {
      const time = new Date();
      const hour = this.genDouble(time.getHours());
      const minutes = this.genDouble(time.getMinutes());
      const seconds = this.genDouble(time.getSeconds());

      return `${hour}:${minutes}:${seconds}`;
    },
    startClock() {
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        this.time = this.getTime();
        this.date = new Date();
      });
    },
    join() {
      this.$dispatch('meeting.joinMeeting', {
        number       : this.recentScheduleEvent.conferenceNumber,
        pin          : this.recentScheduleEvent.attendeePin,
        initialVideo : true,
        initialAudio : true,
      });
    },
    goMeetingDetail() {
      this.$router.push({
        name  : 'schedule',
        query : {
          planId : this.recentScheduleEvent['@planId'],
        },
      });
      this.$dispatch('main.setCurrentSidebar', { name: 'schedule' });
    },

  },
  beforeDestroy() {
    clearInterval(this.timer);
  },
};
</script>

<style lang="less" scoped>
  .new-meeting {
    background: #f0f2f8;
    .yellow {
      background: #F5981B ;
    }
    .green {
      background: #33B5B2;
    }
    .start-meeting {
      margin-bottom: 10px;
    }
    .reservation {
      margin-top: 10px;
    }
    .new-meeting-content {
      margin: 16px;
      padding: 40px;
      background: #fff;
      border: 1px solid #E0E0E0;
      justify-content: center;
      align-items: center;
      .nav-card-content {
        display: flex;
        width: 100%;
        height: 100%;
        max-width: 1050px;
        max-height: 550px;
        justify-content: center;
        .left {
          display: flex;
          height: 100%;
          flex-direction: column;
          justify-content: center;
          align-items: flex-end;
          padding: 20px 0 20px 20px;
          .menu {
            min-width: 200px;
            min-height: 200px;
            width: 80%;
            height: 80%;
            border-radius: 4px;
            color: #FFFFFF;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            &:hover {
              opacity: 0.8;
            }
            .icon {
              font-size: 60px;
            }
            .title {
              font-size: 16px;
              margin-top: 10px;
            }
          }
        }
        .right {
          display: flex;
          width: 60%;
          height: 100%;
          padding: 20px;
          .meeting-info {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            border-radius: 4px;
            overflow: hidden;
            .date-wrap {
              width: 100%;
              height: calc(100% - 20px);
              background-image: url("../../../assets/bg_meeting.png");
              background-size: cover;
              .date-content {
                width: 100%;
                height: 100%;
                color: #FFFFFF;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                .time {
                  font-size: 38px;
                  margin-bottom: 10px;
                }
                .date {
                  font-size: 18px;
                }
              }
            }
            .recent-meeting {
              width: 100%;
              height: calc(100% + 20px);
              border: 1px solid #e0e0e0;
              display: flex;
              flex-direction: column;
              .recent-meeting-header {
                height: 60px;
                display: flex;
                align-items: center;
                padding: 0 20px;
                .start-time {
                  color: #4A5FC4;
                  margin-left: 8px;
                }
              }
              .recent-meeting-content {
                height: calc(100% - 108px);
                padding: 0 10px;
                .title {
                  font-size: 16px;
                }
                .conference-id {
                  font-size: 12px;
                }
                .duration {
                  font-size: 12px;
                  display: flex;
                  justify-content : space-between;
                  .ant-btn-default {
                    padding: 6px;
                  }
                }
                .item {
                  align-items: center;
                  display: flex;
                  padding:0 10px 0 10px;
                  height: 28px;
                }
              }
              .recent-meeting-footer {
                height: 48px;
                border-top: 1px solid #e0e0e0;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                cursor: pointer;
                background: #4A5FC4;
                color: #ffffff;
              }

            }
          }
        }
      }

    }
  }
</style>
