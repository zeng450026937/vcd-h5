export const ERROR_MAP = {
  // meeting
  'Has End'                : 'common.message.hasEnd',
  'Unallocated Number'     : 'common.message.unallocatedNumber',
  'Miss Book Info By ID'   : 'common.message.missBookInfoByID',
  'Conference uri unknown' : 'common.message.missBookInfoByID',
  'Invalid PIN'            : 'common.message.invalidPIN',
  Unavailable              : {
    call       : 'common.message.unavailableCall',
    conference : 'common.message.unavailableConference',
  }, // P2P 通话
  Busy                              : 'common.message.busy',
  Locked                            : 'common.message.locked',
  NoMpsAvailable                    : 'common.message.noMpsAvailable',
  'User Count Exceed'               : 'common.message.userCountExceed',
  'Conference license amount limit' : 'common.message.conferenceLicenseAmountLimit',
  'Password Error'                  : 'common.message.passwordError',
  'User No Exist'                   : 'common.message.accountError',
  'Number Resource Limit'           : 'common.message.numberResourceLimit',
  ENOTFOUND                         : 'common.message.serverAddressError',
  Canceled                          : {
    call       : 'common.message.callCanceled',
    conference : 'common.message.conferenceCanceled',
  },
  'User not register' : 'common.message.userNotRegister',
  'Not Found'         : 'common.message.callNotFound',
  ACCOUNT_NOT_EMPTY   : 'common.message.accountNotEmpty',
  ACCOUNT_TOO_LONG    : 'common.message.accountTooLong',
  PASSWORD_NOT_EMPTY  : 'common.message.passwordNotEmpty',
  PASSWORD_TOO_LONG   : 'common.message.passwordTooLong',
  SERVER_NOT_EMPTY    : 'common.message.serverNotEmpty',
  SERVER_FORMAT_ERROR : 'common.message.serverFormatError',
  // 会议
};

export const ERROR_CODE_MAP = {
  401    : '账号或密码错误',
  559500 : '服务器内部错误',
};
