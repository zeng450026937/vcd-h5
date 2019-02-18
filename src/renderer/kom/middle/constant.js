const errorMap = {
  // meeting
  'Has End'              : '会议号码错误，请重新输入！',
  'Unallocated Number'   : '会议号码错误，请重新输入！',
  'Miss Book Info By ID' : '会议号码错误，请重新输入！',
  'Invalid PIN'          : '密码错误，请重新输入！',
  Unavailable            : '当前会议尚未开始，请稍后再来！',
  Locked                 : '该会议已被锁定，无法加入！',
  NoMpsAvailable         : '会议人数已达上限，请稍后再试！',
  'User Count Exceed'    : '会议人数已达上限，请稍后再试！',
  // login
  'Password Error'       : '登陆密码错误',
};

export default Object.assign({}, errorMap);
