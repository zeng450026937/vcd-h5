import { BASE_URL } from '../config';

const APP = 'conference-manager';

// 获取当前登陆用户的日程列表
const GET_SCHEDULE_LIST = `/${APP}/api/v10/external/conference/plan/calendar`;
// // 查询预约会议特例列表
const GET_EXCEPTION_LIST = `/${APP}/api/v10/external/conference/plan/exception/list`;
// // 查询预约会议详情
const GET_SCHEDULE_INFO = `/${APP}/api/v10/external/conference/plan/info`;
// // 删除日程
const DELETE_SCHEDULE = `/${APP}/api/v10/external/conference/plan/delete`;
// 新建预约会议
const ADD_SCHEDULE = `/${APP}/api/v10/external/conference/plan/add`;

export default {
  BASE_URL,
  GET_SCHEDULE_LIST,
  GET_EXCEPTION_LIST,
  GET_SCHEDULE_INFO,
  DELETE_SCHEDULE,
  ADD_SCHEDULE,
};
