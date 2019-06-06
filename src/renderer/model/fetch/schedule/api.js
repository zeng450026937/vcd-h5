import { BASE_URL } from '../config';

// 获取当前登陆用户的日程列表
const GET_SCHEDULE_LIST = '/api/v10/external/conference/scheduled/calendar';
// // 查询预约会议特例列表
const GET_EXCEPTION_LIST = '/api/v10/external/conference/scheduled/exception/list';
// // 查询预约会议详情
const GET_SCHEDULE_INFO = '/api/v10/external/conference/scheduled/info';
// // 删除日程
const DELETE_SCHEDULE = '/api/v10/external/conference/scheduled/delete';
// 新建预约会议
const ADD_SCHEDULE = '/api/v10/external/conference/scheduled/add';

export default {
  BASE_URL,
  GET_SCHEDULE_LIST,
  GET_EXCEPTION_LIST,
  GET_SCHEDULE_INFO,
  DELETE_SCHEDULE,
  ADD_SCHEDULE,
};
