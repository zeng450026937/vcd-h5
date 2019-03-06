const errorMap = {
  // meeting
  'Has End'               : '会议号码错误，请重新输入！',
  'Unallocated Number'    : '会议号码错误，请重新输入！',
  'Miss Book Info By ID'  : '会议号码错误，请重新输入！',
  'Invalid PIN'           : '密码错误，请重新输入！',
  Unavailable             : '当前会议或通话无法获取，请稍后再来！', // P2P 通话
  Locked                  : '该会议已被锁定，无法加入！',
  NoMpsAvailable          : '会议人数已达上限，请稍后再试！',
  'User Count Exceed'     : '会议人数已达上限，请稍后再试！',
  // login
  'Password Error'        : '登录密码错误',
  'User No Exist'         : '账号错误',
  'Number Resource Limit' : '无法找到该账号',
  ENOTFOUND               : '服务器地址错误',
  // call
  'Not Found'             : '未找到当前号码',
  Canceled                : '当前通话已取消',
};

export default Object.assign({}, errorMap);
