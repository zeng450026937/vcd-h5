<template>
  <div class="flex flex-col h-full  w-full new-meeting">

    <app-header title="新的会议"/>

    <div class="flex h-full new-meeting-content">
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
               {{tip}}
                <a-button v-if="hasRecentScheduleEvent" type="primary" @click="join">加入</a-button>
              </div>
              <div class="recent-meeting-content">
                <div class="card" v-if="hasRecentScheduleEvent">
                  <div class="card-content">
                    <div class="title item">
                     {{recentScheduleEvent.subject}}
                    </div>
                    <div class="conference-id item">
                      ID : {{recentScheduleEvent.conferenceNumber}}
                    </div>
                    <div class="duration item">
                     {{recentScheduleEvent.startTime}} ~ {{recentScheduleEvent.expiryTime}}
                    </div>
                  </div>
                </div>
              </div>
              <div class="recent-meeting-footer" @click="goSchedule">
                查看会议日程
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

      const distance = deltatime / 1000 / 60;

      return `下一场会议${Math.abs(Math.floor(distance))}分钟后开始`;
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
      .left {
        display: flex;
        width: 40%;
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
            transform: scale(1.3);
            transition: transform 0.3s;
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
              justify-content: space-between;
              align-items: center;
              padding: 0 20px;
            }
            .recent-meeting-content {
              height: calc(100% - 108px);
              padding: 0 20px;
              .card {
                height: 90px;
                width: 100%;

                display: flex;
                flex-direction: column;
                background: #FFFFFF;
                box-shadow: 0 2px 8px 0 rgba(0,0,0,0.12);
                border-radius: 4px;
                justify-content: center;
                .card-content {
                  border-left: 4px solid #4A5FC4;
                  display: flex;
                  flex-direction: column;
                  .item {
                    align-items: center;
                    display: flex;
                    height: 24px;
                    padding-left: 10px;
                  }
                }
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
            }

          }
        }
      }
    }
  }
</style>
