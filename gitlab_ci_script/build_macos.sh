#！/bin/bash
set -eo pipefail
set -x
echo "############## Begin to execute job:build ##############"
#<================ user modify(please modify content of script)
yarn build:prod
#=============================================================>
echo "############## End to execute job:build ##############"