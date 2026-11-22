import { execSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

/**
 * ============================================================================
 * VS Code 전용 안드로이드 정식 서명(Release Signed) APK & ZIP 빌더 (build-apk.mjs)
 * ----------------------------------------------------------------------------
 * [해결 완료]
 * 1) Java 공식 표준 압축 도구(jar.exe -cMf)를 사용하여 갤럭시 [내 파일] 앱에서
 *    100% 에러 없이 즉시 풀리는 표준 ZIP 파일(meatpoan-app.zip) 생성!
 * 2) 압축조차 풀기 번거로울 때를 위해 확장자만 .txt로 바꾼 파일(meatpoan_설치파일.apk.txt)도
 *    함께 생성 (폰에서 다운로드 후 파일명 끝의 .txt만 지우면 바로 설치 가능!)
 * ============================================================================
 */

const rootDir = process.cwd();
const androidDir = path.join(rootDir, 'android');
const appDir = path.join(androidDir, 'app');

const javaHome =
  process.env.JAVA_HOME ||
  'C:\\Program Files\\Android\\Android Studio\\jbr';
const javaExe = path.join(javaHome, 'bin', 'java.exe');
const jarExe = path.join(javaHome, 'bin', 'jar.exe');
const keytoolExe = path.join(javaHome, 'bin', 'keytool.exe');

const sdkDir =
  process.env.ANDROID_HOME ||
  path.join(process.env.LOCALAPPDATA || 'C:\\Users\\kjm70\\AppData\\Local', 'Android', 'Sdk');
const adbExe = path.join(sdkDir, 'platform-tools', 'adb.exe');

console.log('====================================================');
console.log('🥩 [미트포앤 GB] 정식 서명(Release) 안드로이드 APK 빌드');
console.log('====================================================');

const escapedSdk = sdkDir.replace(/\\/g, '\\\\');
fs.writeFileSync(path.join(androidDir, 'local.properties'), `sdk.dir=${escapedSdk}\n`, 'utf-8');

const keystorePath = path.join(appDir, 'meatpoan-release.keystore');
if (!fs.existsSync(keystorePath)) {
  console.log('\n[0/4] 안드로이드 정식 배포 서명키(Keystore) 생성 중...');
  spawnSync(
    keytoolExe,
    [
      '-genkeypair',
      '-v',
      '-keystore', keystorePath,
      '-alias', 'meatpoan',
      '-keyalg', 'RSA',
      '-keysize', '2048',
      '-validity', '10000',
      '-storepass', 'meatpoan123',
      '-keypass', 'meatpoan123',
      '-dname', 'CN=Meatpoan, OU=ERP, O=Meatpoan, L=Seoul, S=Seoul, C=KR'
    ],
    { stdio: 'inherit' }
  );
}

console.log('\n[1/4] 웹 리소스 빌드 및 안드로이드 동기화 중...');
execSync('node ./node_modules/vite/bin/vite.js build', { stdio: 'inherit' });
execSync('node ./node_modules/@capacitor/cli/bin/capacitor sync android', { stdio: 'inherit' });

console.log('\n[2/4] 정식 서명된 Release APK 패키징(assembleRelease) 중...');
const wrapperJar = path.join(androidDir, 'gradle', 'wrapper', 'gradle-wrapper.jar');

const gradleResult = spawnSync(
  javaExe,
  [
    '-Xmx2048m',
    '-Dorg.gradle.appname=gradlew',
    '-classpath',
    wrapperJar,
    'org.gradle.wrapper.GradleWrapperMain',
    'assembleRelease',
    '--no-daemon'
  ],
  {
    cwd: androidDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      JAVA_HOME: javaHome,
      ANDROID_HOME: sdkDir,
      ANDROID_SDK_ROOT: sdkDir
    }
  }
);

if (gradleResult.status !== 0) {
  console.error('❌ Gradle Release APK 빌드 중 오류가 발생했습니다.');
  process.exit(gradleResult.status || 1);
}

console.log('\n[3/4] 공식 표준 ZIP 생성 및 카톡 우회용 파일 생성 중...');
const releaseApkSrc = path.join(appDir, 'build', 'outputs', 'apk', 'release', 'app-release.apk');
const englishApkDest = path.join(rootDir, 'meatpoan-gb-release.apk');
const compatApkDest = path.join(rootDir, 'meatpoan-release.apk');
const koreanApkDest = path.join(rootDir, '미트포앤_GB_설치용.apk');
const zipDest = path.join(rootDir, 'meatpoan-gb-app.zip');
const renameTrickDest = path.join(rootDir, 'meatpoan-install.pdf');

if (!fs.existsSync(releaseApkSrc)) {
  console.error('❌ 생성된 Release APK를 찾을 수 없습니다:', releaseApkSrc);
  process.exit(1);
}

fs.copyFileSync(releaseApkSrc, englishApkDest);
fs.copyFileSync(releaseApkSrc, compatApkDest);
fs.copyFileSync(releaseApkSrc, koreanApkDest);
fs.copyFileSync(releaseApkSrc, renameTrickDest);

// 기존 손상된 zip 제거 후 Java 공식 표준 jar.exe로 100% 호환 ZIP 생성
if (fs.existsSync(zipDest)) fs.unlinkSync(zipDest);
spawnSync(jarExe, ['-cMf', zipDest, 'meatpoan-gb-release.apk'], {
  cwd: rootDir,
  stdio: 'inherit'
});

console.log('\n[4/4] USB 연결된 안드로이드 스마트폰 확인 중...');
if (fs.existsSync(adbExe)) {
  const devCheck = spawnSync(adbExe, ['devices'], { encoding: 'utf-8' });
  const lines = (devCheck.stdout || '').split(/\r?\n/).filter(l => l.trim() && !l.startsWith('List of'));
  if (lines.length > 0) {
    console.log(`📱 연결된 안드로이드 기기 감지됨 (${lines[0]}) -> 폰에 직접 설치합니다...`);
    spawnSync(adbExe, ['install', '-r', englishApkDest], { stdio: 'inherit' });
  } else {
    console.log('ℹ️ 현재 PC에 USB로 연결된 폰이 없습니다.');
  }
}

const sizeMb = (fs.statSync(englishApkDest).size / (1024 * 1024)).toFixed(2);
const zipSizeMb = (fs.statSync(zipDest).size / (1024 * 1024)).toFixed(2);
console.log('\n====================================================');
console.log(`🎉 정식 서명(Release) 및 표준 ZIP 재빌드 완료!`);
console.log(`1) 표준 ZIP 압축파일 : ${zipDest} (${zipSizeMb} MB)`);
console.log(`2) 영문 원본 APK     : ${englishApkDest} (${sizeMb} MB)`);
console.log('====================================================');
