#Conference  会议日程展开类调用说明


###实例化：
######参数
 * @param scheduleds 未展开的原始数据
 * @param exceptions 变更的数据
 * @param dstEnable 是否开启夏令时
 * @param utcOffset 当前浏览器时间偏移量
 * @param serverTime 服务器时间
  
```
const conference = new Conference({scheduleds:scheduledList, exceptions:data});
this.listData = conference.getResult();
```
  #

###方法：
#####getResult
`返回展开后的所有数据`
######参数
 无
 
  #
 
 #####getReadyResult
`获取已预约的会议`
######参数
 * @param serverTime 服务器时间
 * @param duplicate 周期会议只显示一条
 
 #
 
#####getNowResult
`返回展开后指定时间的前{number}条数据`
 * @param number  返回的条数，默认-1，全部返回
 * @param time 指定开始时间。默认当前时间
 * @param utcOffset
 ######参数
  无
 
 
 
 
 
 
 