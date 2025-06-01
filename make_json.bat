@echo off
setlocal EnableDelayedExpansion

set "output=files.json"
set "folder=mp3"

if not exist "%folder%" (
    echo ❌ %folder% 폴더가 존재하지 않습니다.
    pause
    exit /b
)

:: temp 파일 초기화
del temp.txt >nul 2>nul
del temp2.txt >nul 2>nul

:: mp3 파일 목록을 임시 파일에 기록
for %%f in ("%folder%\*.mp3") do (
    echo "%%~nxf" >> temp.txt
)

:: JSON 파일 시작
echo [ > "%output%"

:: 줄 수 계산
set count=0
for /f %%x in ('type temp.txt ^| find /c /v ""') do set count=%%x
set line=0

:: 한 줄씩 읽어서 JSON 형식으로 저장
for /f "usebackq delims=" %%a in ("temp.txt") do (
    set /a line+=1
    set "file=%%a"
    if !line! lss %count% (
        echo     !file!, >> "%output%"
    ) else (
        echo     !file! >> "%output%"
    )
)

:: JSON 닫기
echo ] >> "%output%"

:: 정리
del temp.txt
del temp2.txt >nul 2>nul

echo.
echo ✅ files.json 생성 완료!
echo.
pause
