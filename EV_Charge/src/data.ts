/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChargingStation, ChargingSession, RegisteredCard } from './types';

export const INITIAL_STATIONS: ChargingStation[] = [
  {
    id: 'st-01',
    name: 'Yangjae-yeok Station',
    nameKo: '양재역 공영주차장 충전소',
    address: '255 Gangnam-daero, Seocho-gu, Seoul',
    addressKo: '서울특별시 서초구 강남대로 255',
    lat: 37.4843,
    lng: 127.0346,
    speed: 100,
    status: 'available',
    distance: 1.2,
    operator: 'KEPCO',
    pricePerKwh: 310,
    connectors: [
      { type: 'CCS1', power: 100, status: 'available' },
      { type: 'CHAdeMO', power: 100, status: 'available' }
    ]
  },
  {
    id: 'st-02',
    name: 'Seocho-gu Office',
    nameKo: '서초구청 주차장 충전소',
    address: '258 Gangnam-daero, Seocho-gu, Seoul',
    addressKo: '서울특별시 서초구 강남대로 258',
    lat: 37.4854,
    lng: 127.0324,
    speed: 50,
    status: 'in_use',
    distance: 0.8,
    operator: 'KEPCO',
    pricePerKwh: 310,
    connectors: [
      { type: 'CCS1', power: 50, status: 'in_use' }
    ]
  },
  {
    id: 'st-03',
    name: 'Gangnam Square EV Zone',
    nameKo: '강남역 스퀘어 에이치 EV존',
    address: '826 Yeoksam-dong, Gangnam-gu, Seoul',
    addressKo: '서울특별시 강남구 역삼동 826',
    lat: 37.4979,
    lng: 127.0276,
    speed: 200,
    status: 'available',
    distance: 2.5,
    operator: 'KEPCO',
    pricePerKwh: 320,
    connectors: [
      { type: 'CCS1', power: 200, status: 'available' },
      { type: 'AC_3Phase', power: 50, status: 'available' }
    ]
  },
  {
    id: 'st-04',
    name: 'Gwanghwamun Building',
    nameKo: '광화문 빌딩 급속충전기',
    address: '149 Sejong-daero, Jongno-gu, Seoul',
    addressKo: '서울특별시 종로구 세종대로 149',
    lat: 37.5698,
    lng: 126.9765,
    speed: 350,
    status: 'available',
    distance: 8.4,
    operator: 'KEPCO',
    pricePerKwh: 347,
    connectors: [
      { type: 'CCS1', power: 350, status: 'available' },
      { type: 'CHAdeMO', power: 100, status: 'available' }
    ]
  },
  {
    id: 'st-05',
    name: 'Incheon Port Logistics',
    nameKo: '인천항 물류센터 충전소',
    address: '10 Hang-dong 7-ga, Jung-gu, Incheon',
    addressKo: '인천광역시 중구 항동7가 10',
    lat: 37.4580,
    lng: 126.6025,
    speed: 100,
    status: 'maintenance',
    distance: 32.5,
    operator: 'Environment Ministry',
    pricePerKwh: 324,
    connectors: [
      { type: 'CCS1', power: 100, status: 'maintenance' }
    ]
  },
  {
    id: 'st-06',
    name: 'Busan City Hall Plaza',
    nameKo: '부산시청 야외광장 충전기',
    address: '1001 Jungang-daero, Yeonje-gu, Busan',
    addressKo: '부산광역시 연제구 중앙대로 1001',
    lat: 35.1798,
    lng: 129.0750,
    speed: 100,
    status: 'offline',
    distance: 325.1,
    operator: 'KEPCO',
    pricePerKwh: 310,
    connectors: [
      { type: 'CHAdeMO', power: 100, status: 'offline' },
      { type: 'AC_3Phase', power: 50, status: 'offline' }
    ]
  },
  {
    id: 'st-07',
    name: 'Daegu Innovation Hub',
    nameKo: '대구 혁신지구 기술 밸리',
    address: '20 Dongnae-ro, Dong-gu, Daegu',
    addressKo: '대구광역시 동구 동내로 20',
    lat: 35.8711,
    lng: 128.6014,
    speed: 150,
    status: 'available',
    distance: 238.4,
    operator: 'Daeyoung Chaevi',
    pricePerKwh: 335,
    connectors: [
      { type: 'CCS1', power: 150, status: 'available' }
    ]
  },
  {
    id: 'st-08',
    name: 'Yeouido Hangang Park',
    nameKo: '여의도 한강공원 3주차장',
    address: '330 Yeouidong-ro, Yeongdeungpo-gu, Seoul',
    addressKo: '서울특별시 영등포구 여의동로 330',
    lat: 37.5278,
    lng: 126.9324,
    speed: 100,
    status: 'available',
    distance: 6.8,
    operator: 'KEPCO',
    pricePerKwh: 310,
    connectors: [
      { type: 'CCS1', power: 100, status: 'available' },
      { type: 'AC_3Phase', power: 50, status: 'available' }
    ]
  },
  {
    id: 'st-09',
    name: 'Mapo Public Parking',
    nameKo: '마포 용강공영주차장 충전소',
    address: '12 Mapo-daero, Mapo-gu, Seoul',
    addressKo: '서울특별시 마포구 마포대로 12',
    lat: 37.5391,
    lng: 126.9458,
    speed: 50,
    status: 'in_use',
    distance: 5.1,
    operator: 'Environment Ministry',
    pricePerKwh: 324,
    connectors: [
      { type: 'CHAdeMO', power: 50, status: 'in_use' },
      { type: 'Slow', power: 7, status: 'available' }
    ]
  },
  {
    id: 'st-10',
    name: 'COEX Mall EV Zone',
    nameKo: '코엑스몰 지하 주차장 EV존',
    address: '513 Yeongdong-daero, Gangnam-gu, Seoul',
    addressKo: '서울특별시 강남구 영동대로 513',
    lat: 37.5117,
    lng: 127.0592,
    speed: 350,
    status: 'available',
    distance: 4.2,
    operator: 'KEPCO',
    pricePerKwh: 347,
    connectors: [
      { type: 'CCS1', power: 350, status: 'available' },
      { type: 'CHAdeMO', power: 100, status: 'available' },
      { type: 'AC_3Phase', power: 50, status: 'available' }
    ]
  }
];

export const INITIAL_HISTORY: ChargingSession[] = [
  {
    id: 'ch-01',
    date: '2026-06-27',
    time: '14:32 PM',
    stationId: 'st-04',
    stationName: 'Gwanghwamun Building',
    stationNameKo: '광화문 빌딩 급속충전기',
    address: '149 Sejong-daero, Jongno-gu, Seoul',
    energyUsed: 45.8,
    cost: 14200,
    status: 'Completed',
    plugType: 'CCS1'
  },
  {
    id: 'ch-02',
    date: '2026-06-26',
    time: '08:15 AM',
    stationId: 'st-05',
    stationName: 'Incheon Port Logistics',
    stationNameKo: '인천항 물류센터 충전소',
    address: '10 Hang-dong 7-ga, Jung-gu, Incheon',
    energyUsed: 22.4,
    cost: 6800,
    status: 'Completed',
    plugType: 'CCS1'
  },
  {
    id: 'ch-03',
    date: '2026-06-24',
    time: '19:20 PM',
    stationId: 'st-06',
    stationName: 'Busan City Hall Plaza',
    stationNameKo: '부산시청 야외광장 충전기',
    address: '1001 Jungang-daero, Yeonje-gu, Busan',
    energyUsed: 62.1,
    cost: 18500,
    status: 'Failed',
    plugType: 'CHAdeMO'
  },
  {
    id: 'ch-04',
    date: '2026-06-21',
    time: '11:05 AM',
    stationId: 'st-07',
    stationName: 'Daegu Innovation Hub',
    stationNameKo: '대구 혁신지구 기술 밸리',
    address: '20 Dongnae-ro, Dong-gu, Daegu',
    energyUsed: 31.2,
    cost: 9150,
    status: 'Completed',
    plugType: 'CCS1'
  },
  {
    id: 'ch-05',
    date: '2026-06-18',
    time: '16:45 PM',
    stationId: 'st-01',
    stationName: 'Yangjae-yeok Station',
    stationNameKo: '양재역 공영주차장 충전소',
    address: '255 Gangnam-daero, Seocho-gu, Seoul',
    energyUsed: 38.5,
    cost: 11400,
    status: 'Completed',
    plugType: 'CCS1'
  },
  {
    id: 'ch-06',
    date: '2026-06-15',
    time: '09:10 AM',
    stationId: 'st-08',
    stationName: 'Yeouido Hangang Park',
    stationNameKo: '여의도 한강공원 3주차장',
    address: '330 Yeouidong-ro, Yeongdeungpo-gu, Seoul',
    energyUsed: 52.0,
    cost: 15600,
    status: 'Completed',
    plugType: 'AC_3Phase'
  },
  {
    id: 'ch-07',
    date: '2026-06-11',
    time: '21:30 PM',
    stationId: 'st-03',
    stationName: 'Gangnam Square EV Zone',
    stationNameKo: '강남역 스퀘어 에이치 EV존',
    address: '826 Yeoksam-dong, Gangnam-gu, Seoul',
    energyUsed: 40.2,
    cost: 12100,
    status: 'Completed',
    plugType: 'CCS1'
  },
  {
    id: 'ch-08',
    date: '2026-06-05',
    time: '13:00 PM',
    stationId: 'st-10',
    stationName: 'COEX Mall EV Zone',
    stationNameKo: '코엑스몰 지하 주차장 EV존',
    address: '513 Yeongdong-daero, Gangnam-gu, Seoul',
    energyUsed: 55.4,
    cost: 17200,
    status: 'Completed',
    plugType: 'CCS1'
  }
];

export const INITIAL_CARDS: RegisteredCard[] = [
  {
    id: 'card-1',
    isPrimary: true,
    type: 'visa',
    number: '•••• •••• •••• 8812',
    name: 'VISA CORPORATE',
    expiry: '12/28'
  },
  {
    id: 'card-2',
    isPrimary: false,
    type: 'mastercard',
    number: '•••• •••• •••• 4402',
    name: 'MASTERCARD PERSONAL',
    expiry: '09/27'
  }
];

export const FAQS = [
  {
    question: 'How do I upgrade my membership tier?',
    questionKo: '멤버십 등급을 업그레이드하려면 어떻게 해야 하나요?',
    answer: "Membership upgrades can be managed through the 'Account Settings' page. Premium membership offers a 15% discount on all rapid charging stations and early access to newly commissioned KEPCO hubs.",
    answerKo: "멤버십 등급 업그레이드는 '계정 설정' 페이지에서 신청하실 수 있습니다. 프리미엄 멤버십 가입 시 모든 급속 충전소 이용 요금 15% 할인 혜택과 한전 신규 충전소 우선 이용 권한이 제공됩니다."
  },
  {
    question: 'What should I do if a station is offline?',
    questionKo: '충전소가 오프라인(미작동) 상태이면 어떻게 해야 하나요?',
    answer: "Please use the 'Report Issue' button within the Station Details view on the map or app. Our technical team is notified immediately. You can also call our 24/7 support line listed in the Footer.",
    answerKo: "충전소 상세 화면의 '오류 신고' 버튼을 이용해주시면 기술 지원팀으로 즉시 상황이 전파됩니다. 급하신 경우 하단에 기재된 24시간 고객지원센터(1588-XXXX)로 유선 연락 주시면 신속하게 조치해 드리겠습니다."
  },
  {
    question: 'How are charging rates calculated?',
    questionKo: '충전 요금은 어떻게 계산되나요?',
    answer: 'Rates are based on kWh consumed plus any applicable parking fees determined by the host location. Premium members enjoy a unified tariff across the national grid.',
    answerKo: '충전 요금은 실제 사용한 전력량(kWh)을 기준으로 부과되며, 충전소가 위치한 시설물의 기준에 따라 주차 요금이 별도로 부과될 수 있습니다. 프리미엄 멤버십 회원은 전국 한전 충전소에서 단일 할인 요금이 적용됩니다.'
  }
];
