@echo off
echo ############## Begin to execute job:upload ##############
::<================ user modify(please modify content of script)
if exist %PACKAGE_UPLOAD_PATH% (
    del /S /Q  %PACKAGE_UPLOAD_PATH%\*
) else (
    mkdir %PACKAGE_UPLOAD_PATH%
)
git log --graph -n 50  --pretty="[%%cd] - <%%an> %%s" > CHANGELOG.txt
copy /Y %PACKAGE_PATH_WINDOWS% gitlab_ci_upload
cd %PACKAGE_UPLOAD_PATH%
7z a ../%PACKAGE_NAME%.tar *
7z a ../%PACKAGE_NAME%.tar.gz ../%PACKAGE_NAME%.tar

::for /f %%i in ('echo %CI_COMMIT_TAG% ^|awk -F"-" "{print $1}"') do set TAG_PREFIX=%%i
set TAG_PREFIX=release
::for /f %%i in ('echo %CI_COMMIT_TAG% ^|awk -F "-" "BEGIN{ OFS=\"-\" } {sub(/develop-|release-/,\"\",$0);print $0}"') do set VERSION=%%i
set VERSION=%CI_COMMIT_TAG%

curl -v -u %REPOSITORY_USER%:%REPOSITORY_PASSWORD% -T {../%PACKAGE_NAME%.tar.gz,../CHANGELOG.txt} %REPOSITORY_URL%/%PROJECT_NAME%/%MODULE_NAME%/%TAG_PREFIX%/%VERSION%/%1/
::=============================================================>
echo ############## End to execute job:upload ##############
