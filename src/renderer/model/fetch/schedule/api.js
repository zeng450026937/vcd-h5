import { BASE_URL } from '../config';

// 获取当前登陆用户的日程列表
const GET_SCHEDULE_LIST = `${BASE_URL}/api/v10/external/conference/scheduled/calendar`;
// // 查询预约会议特例列表
const GET_EXCEPTION_LIST = `${BASE_URL}/api/v10/external/conference/scheduled/exception/list`;
// // 查询预约会议详情
const GET_SCHEDULE_INFO = `${BASE_URL}/api/v10/external/conference/scheduled/info`;
// // 删除日程
const DELETE_SCHEDULE = `${BASE_URL}/api/v10/external/conference/scheduled/delete`;

export default {
  BASE_URL,
  GET_SCHEDULE_LIST,
  GET_EXCEPTION_LIST,
  GET_SCHEDULE_INFO,
  DELETE_SCHEDULE,
};
