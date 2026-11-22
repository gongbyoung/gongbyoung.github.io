import { defineConfig } from 'vite';

// Vite 환경 설정 파일
export default defineConfig({
  // 안드로이드 WebView(로컬 파일 시스템/로컬 서버)에서 리소스 경로가 깨지지 않도록 상대 경로('./')로 설정
  base: './',
  resolve: {
    // 심볼릭 링크/실제 경로(realpath) 변환 시 윈도우 환경 권한 충돌을 방지하고 상대 경로를 유지
    preserveSymlinks: true
  },
  build: {
    // Capacitor가 바라볼 최종 빌드 결과물 폴더
    outDir: 'dist',
    emptyOutDir: true,
    // 디버깅 용이성을 위해 소스맵 생성 활성화 (배포 시에는 false로 변경 가능)
    sourcemap: true
  },
  server: {
    // 모바일 기기에서 동일 와이파이로 접속해 라이브 리로드 테스트를 할 수 있도록 호스트 개방
    host: true,
    port: 5173
  }
});
