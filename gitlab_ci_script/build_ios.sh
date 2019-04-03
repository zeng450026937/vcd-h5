#！/bin/bash
echo "############## Begin to execute job:build ##############"
#<================ user modify(please modify content of script)
if [ ! -d "example_out" ];then
  mkdir example_out
fi
date >> example_out/date.log
#=============================================================>
echo "############## End to execute job:build ##############"