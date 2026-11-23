/* =========================================================================
   1. 내장 거래처 명칭·별명 매핑 (개인정보·주소·출입비번 비포함 - GitHub 공개 안전 버전)
      ※ 상세 주소·연락처·출입비번은 로컬/비공개 clients.csv 로드 시 자동 병합됩니다.
   ========================================================================= */
const DEFAULT_CLIENTS = [{"name": "(주)태광푸드", "ceo": "", "phone": "", "addr": "", "alias": ["태광"], "note": ""}, {"name": "(주)한마음마트(일동)=>정육으로", "ceo": "", "phone": "", "addr": "", "alias": ["한마음마트", "한마음"], "note": ""}, {"name": "주식회사 농민(본오)", "ceo": "", "phone": "", "addr": "", "alias": ["본오농민마트", "본오농민"], "note": ""}, {"name": "전라도연탄구이", "ceo": "", "phone": "", "addr": "", "alias": ["전라도연탄구이", "전라도"], "note": ""}, {"name": "농민마트와동(주)중지", "ceo": "", "phone": "", "addr": "", "alias": ["농민마트와동", "와동"], "note": ""}, {"name": "성대지마트(주)", "ceo": "", "phone": "", "addr": "", "alias": ["성대g마트", "성대G마트", "성대g", "성대"], "note": ""}, {"name": "출고안됨(주)스타마트", "ceo": "", "phone": "", "addr": "", "alias": ["스타마트", "스타"], "note": ""}, {"name": "서창별빛정육점", "ceo": "", "phone": "", "addr": "", "alias": ["별빛정육점", "별빛"], "note": ""}, {"name": "횡성생고기(본점)", "ceo": "", "phone": "", "addr": "", "alias": ["횡성본점", "횡성생고기", "횡성본정ㅅ"], "note": ""}, {"name": "횡성생고기(인천점)", "ceo": "", "phone": "", "addr": "", "alias": ["횡성생고기 인천점", "횡성인천점", "횡성 인천"], "note": ""}, {"name": "청정맛집(하중동)", "ceo": "", "phone": "", "addr": "", "alias": ["청정맛집", "청정"], "note": ""}, {"name": "덕이네쌈밥", "ceo": "", "phone": "", "addr": "", "alias": ["덕이네쌈밥", "덕이네"], "note": ""}, {"name": "농민마트 고잔점", "ceo": "", "phone": "", "addr": "", "alias": ["농민마트고잔", "농민 고잔", "고잔"], "note": ""}, {"name": "(주)원신산업-보미마트", "ceo": "", "phone": "", "addr": "", "alias": ["원신산업", "원신"], "note": ""}, {"name": "꿀돼지꿀한우(가리봉)", "ceo": "", "phone": "", "addr": "", "alias": ["가리봉꿀돼지꿀한우", "가리봉꿀"], "note": ""}, {"name": "(주)다온마트(10/1부터)", "ceo": "", "phone": "", "addr": "", "alias": ["다온마트", "다온"], "note": ""}, {"name": "쌈&쌈(신길점)", "ceo": "", "phone": "", "addr": "", "alias": ["사동쌈엔쌈", "쌈엔쌈", "쌈쌈", "쌈&쌈"], "note": ""}, {"name": "풍년돼지양념구이(상미네곱창집)", "ceo": "", "phone": "", "addr": "", "alias": ["풍년돼지양념구이", "풍년"], "note": ""}, {"name": "에스에이치미트(음성)", "ceo": "", "phone": "", "addr": "", "alias": ["에스에이치마트 음성", "음성엘마트", "음성"], "note": ""}, {"name": "원대성정육점", "ceo": "", "phone": "", "addr": "", "alias": ["원대성정육점", "원대성"], "note": ""}, {"name": "고기바보푸주간(부곡)", "ceo": "", "phone": "", "addr": "", "alias": ["고기바보부곡", "부곡 고기바보", "부곡점 고기바보"], "note": ""}, {"name": "고기바보푸줏간(장안점)", "ceo": "", "phone": "", "addr": "", "alias": ["고기바보장안", "장안점"], "note": ""}, {"name": "고기바보(송정점)", "ceo": "", "phone": "", "addr": "", "alias": ["고기바보송정", "송정점"], "note": ""}, {"name": "꿀돼지꿀한우(금천)", "ceo": "", "phone": "", "addr": "", "alias": ["금천꿀돼지꿀한우", "금천꿀", "꿀돼지시흥점"], "note": ""}, {"name": "꿀돼지꿀한우정육점(광명)", "ceo": "", "phone": "", "addr": "", "alias": ["광명꿀", "광꿀"], "note": ""}, {"name": "동탄식자재마트", "ceo": "", "phone": "", "addr": "", "alias": ["동탄식자재마트", "동탄식자재"], "note": ""}, {"name": "정성마트정육코너(아차산)", "ceo": "", "phone": "", "addr": "", "alias": ["정성마트", "아차산점발주입니다"], "note": ""}, {"name": "한결축산", "ceo": "", "phone": "", "addr": "", "alias": ["한결축산"], "note": ""}, {"name": "한돈미트(N마트)기흥", "ceo": "", "phone": "", "addr": "", "alias": ["한돈미트", "주식회사 엔마트용인점", "엔마트"], "note": ""}, {"name": "삼사오", "ceo": "", "phone": "", "addr": "", "alias": ["삼사오"], "note": ""}, {"name": "에스농축수산마트(율전)", "ceo": "", "phone": "", "addr": "", "alias": ["에스농축산마트 율전", "율전동에스할인마트입니다", "s율전", "율전"], "note": ""}, {"name": "주식회사에스할인마트(지점)평택", "ceo": "", "phone": "", "addr": "", "alias": ["에스할인마트 평택", "에스할인마트 (평택)", "s평택", "에스평택"], "note": ""}, {"name": "신박축산", "ceo": "", "phone": "", "addr": "", "alias": ["신박축산"], "note": ""}, {"name": "천하제일정육점(배곧동)", "ceo": "", "phone": "", "addr": "", "alias": ["천하제일정육점", "천하제일"], "note": ""}, {"name": "오늘은고기다(일동)", "ceo": "", "phone": "", "addr": "", "alias": ["오늘은고기다"], "note": ""}, {"name": "참새방앗간", "ceo": "", "phone": "", "addr": "", "alias": ["참새방앗간"], "note": ""}, {"name": "막뚱이정육점", "ceo": "", "phone": "", "addr": "", "alias": ["막뚱이정육점"], "note": ""}, {"name": "삼겹연구소", "ceo": "", "phone": "", "addr": "", "alias": ["삼겹연구소"], "note": ""}, {"name": "하늘소(광명점)", "ceo": "", "phone": "", "addr": "", "alias": ["하늘소광명", "하늘소 광명"], "note": ""}, {"name": "하늘소(화곡)", "ceo": "", "phone": "", "addr": "", "alias": ["하늘소화곡", "하늘소 화곡"], "note": ""}, {"name": "하늘소(역곡점)", "ceo": "", "phone": "", "addr": "", "alias": ["하늘소역곡", "역곡하늘소"], "note": ""}, {"name": "상미왕할인마트(식자재)산본", "ceo": "", "phone": "", "addr": "", "alias": ["상미마트", "상미마트 산본", "상미마트(군포)"], "note": ""}, {"name": "상미왕할인마트(반월점)", "ceo": "", "phone": "", "addr": "", "alias": ["상미마트(반월점)"], "note": ""}, {"name": "참예소(포동)", "ceo": "", "phone": "", "addr": "", "alias": ["참예소"], "note": ""}, {"name": "일신할인마트(정육점)", "ceo": "", "phone": "", "addr": "", "alias": ["일신할인마트"], "note": ""}, {"name": "한우세상(폐업)", "ceo": "", "phone": "", "addr": "", "alias": ["한우세상"], "note": ""}, {"name": "양평해장국(폐업)", "ceo": "", "phone": "", "addr": "", "alias": ["신길양평해장국"], "note": ""}, {"name": "한양축산도매센타(봉천동)", "ceo": "", "phone": "", "addr": "", "alias": ["한양봉천", "한양 봉천"], "note": ""}, {"name": "대부지마트(주)", "ceo": "", "phone": "", "addr": "", "alias": ["대부g마트", "대부지마트"], "note": ""}, {"name": "충북G마트", "ceo": "", "phone": "", "addr": "", "alias": ["충북g마트", "충북지"], "note": ""}, {"name": "유포리바베큐장", "ceo": "", "phone": "", "addr": "", "alias": ["유포리바베큐장", "유포리"], "note": ""}, {"name": "SK축산물도소매", "ceo": "", "phone": "", "addr": "", "alias": ["sk축산", "SK축산"], "note": ""}, {"name": "오소돈", "ceo": "", "phone": "", "addr": "", "alias": ["오소돈"], "note": ""}, {"name": "소문난정육점", "ceo": "", "phone": "", "addr": "", "alias": ["소문난정육점"], "note": ""}, {"name": "진안축산", "ceo": "", "phone": "", "addr": "", "alias": ["진안축산"], "note": ""}, {"name": "삼대축산정육점양평점", "ceo": "", "phone": "", "addr": "", "alias": ["삼대축산"], "note": ""}, {"name": "(주)큐엔씨육가공", "ceo": "", "phone": "", "addr": "", "alias": ["큐엔씨육가공"], "note": ""}, {"name": "에이스미트", "ceo": "", "phone": "", "addr": "", "alias": ["에이스미트주안", "에이스미트 주안"], "note": ""}, {"name": "형제정육점1호점", "ceo": "", "phone": "", "addr": "", "alias": ["형제정육점1호점"], "note": ""}, {"name": "더갈비(폐업)", "ceo": "", "phone": "", "addr": "", "alias": ["더갈비"], "note": ""}, {"name": "삼부자돌판골", "ceo": "", "phone": "", "addr": "", "alias": ["삼부자돈판골"], "note": ""}, {"name": "원산면옥", "ceo": "", "phone": "", "addr": "", "alias": ["원산면옥"], "note": ""}, {"name": "푸른목장(삼평동)", "ceo": "", "phone": "", "addr": "", "alias": ["푸른목장 삼평점", "푸른목장삼평"], "note": ""}, {"name": "푸른목장(판교)", "ceo": "", "phone": "", "addr": "", "alias": ["푸른목장 판교점", "푸른목장판교", "푸른목장 판교"], "note": ""}, {"name": "(주)판교1등축산(구-푸른 대장동", "ceo": "", "phone": "", "addr": "", "alias": ["판교1등축산", "1등판교"], "note": ""}, {"name": "(주)좋은축산유통", "ceo": "", "phone": "", "addr": "", "alias": ["좋은축산유통"], "note": ""}, {"name": "다연홈마트", "ceo": "", "phone": "", "addr": "", "alias": ["다연"], "note": ""}, {"name": "소하축산(광명)", "ceo": "", "phone": "", "addr": "", "alias": ["소하축산광명", "소하축산 광명"], "note": ""}, {"name": "토종축산(광명철산동)", "ceo": "", "phone": "", "addr": "", "alias": ["토종축산"], "note": ""}, {"name": "린이네축산동탄점(구미래)", "ceo": "", "phone": "", "addr": "", "alias": ["린이네축산 동탄", "린이네축산(동탄)"], "note": ""}, {"name": "린이네축산(본점-영통)", "ceo": "", "phone": "", "addr": "", "alias": ["린이네축산 본점", "린이네본점", "린이네축산 (본점)"], "note": ""}, {"name": "골목대장삼겹살", "ceo": "", "phone": "", "addr": "", "alias": ["골목대장"], "note": ""}, {"name": "김치왕뚜껑삼겹살", "ceo": "", "phone": "", "addr": "", "alias": ["김치왕뚜껑삼겹살1호점", "김치왕뚜껑삼겹살 2호점", "김치왕뚜껑삼겹살3호점"], "note": ""}, {"name": "신풍푸줏간(신길점)", "ceo": "", "phone": "", "addr": "", "alias": ["신풍푸줏간", "신풍푸줏간 신길"], "note": ""}, {"name": "거시기 함흥냉면", "ceo": "", "phone": "", "addr": "", "alias": ["거시기함흥냉면", "거시기"], "note": ""}, {"name": "전설갈비은행점", "ceo": "", "phone": "", "addr": "", "alias": ["전설은행"], "note": ""}, {"name": "옥이네주물럭", "ceo": "", "phone": "", "addr": "", "alias": ["옥이네주물럭"], "note": ""}, {"name": "예서감자탕", "ceo": "", "phone": "", "addr": "", "alias": ["예서감자탕"], "note": ""}, {"name": "찌그러진주전자", "ceo": "", "phone": "", "addr": "", "alias": ["찌그러진"], "note": ""}, {"name": "이모네(거래종료)", "ceo": "", "phone": "", "addr": "", "alias": ["이모네민물메운탕", "이모네민물매운탕"], "note": ""}, {"name": "오늘은냉삼(구-이구집)", "ceo": "", "phone": "", "addr": "", "alias": ["오늘은냉삼"], "note": ""}, {"name": "국민생고기(장곡동)", "ceo": "", "phone": "", "addr": "", "alias": ["국민생고기 장곡"], "note": ""}, {"name": "갈비면옥(갈비나라2호점)", "ceo": "", "phone": "", "addr": "", "alias": ["대패나라", "갈비면옥"], "note": ""}, {"name": "푸줏단(동춘)", "ceo": "", "phone": "", "addr": "", "alias": ["동춘동푸줏단"], "note": ""}, {"name": "오빠막창", "ceo": "", "phone": "", "addr": "", "alias": ["오빠막창"], "note": ""}, {"name": "착한정육점(신정동)", "ceo": "", "phone": "", "addr": "", "alias": ["착한정육점 산현", "착한정육점 (산현)", "착한정육점"], "note": ""}, {"name": "대박축산(금천)하늘소", "ceo": "", "phone": "", "addr": "", "alias": ["대박축산금천", "대박축산 금천", "시흥대박축산"], "note": ""}, {"name": "차이나감자탕", "ceo": "", "phone": "", "addr": "", "alias": ["차이나감자탕"], "note": ""}, {"name": "여기식당", "ceo": "", "phone": "", "addr": "", "alias": ["여기식당"], "note": ""}, {"name": "곱창연가", "ceo": "", "phone": "", "addr": "", "alias": ["곱창연가"], "note": ""}, {"name": "주식회사 정육점", "ceo": "", "phone": "", "addr": "", "alias": ["주식회사정육점"], "note": ""}, {"name": "맛있는한우(부천상동)", "ceo": "", "phone": "", "addr": "", "alias": ["맛있는한우", "맛있는한우 상동"], "note": ""}, {"name": "효자축산(일산)", "ceo": "", "phone": "", "addr": "", "alias": ["효자축산"], "note": ""}, {"name": "도담(은행)", "ceo": "", "phone": "", "addr": "", "alias": ["도담(은행동) 식당", "도담"], "note": ""}, {"name": "바른정육점(사동)", "ceo": "", "phone": "", "addr": "", "alias": ["바른정육점"], "note": ""}, {"name": "한상궁한식주점", "ceo": "", "phone": "", "addr": "", "alias": ["한상궁"], "note": ""}, {"name": "구들장2호점", "ceo": "", "phone": "", "addr": "", "alias": ["구들장"], "note": ""}, {"name": "셀프정육점(포동)", "ceo": "", "phone": "", "addr": "", "alias": ["셀프정육점", "포동셀프정육점", "포동셀프정육"], "note": ""}, {"name": "샛터돌왕구이", "ceo": "", "phone": "", "addr": "", "alias": ["샛터"], "note": ""}, {"name": "백봉(선부동)", "ceo": "", "phone": "", "addr": "", "alias": ["백봉"], "note": ""}, {"name": "정성가득집밥", "ceo": "", "phone": "", "addr": "", "alias": ["정성가득집밥"], "note": ""}, {"name": "오늘도고기&장어((구)으뜸장어)", "ceo": "", "phone": "", "addr": "", "alias": ["으뜸장어", "오늘도고기앤장어", "오늘도고기&장어", "고기앤장어"], "note": ""}, {"name": "맛닭꼬치", "ceo": "", "phone": "", "addr": "", "alias": ["신천동 맛닭꼬치입니다", "맛닭꼬치"], "note": ""}, {"name": "슈퍼킹(사동)", "ceo": "", "phone": "", "addr": "", "alias": ["슈퍼킹"], "note": ""}, {"name": "구워랑", "ceo": "", "phone": "", "addr": "", "alias": ["구워랑"], "note": ""}, {"name": "행복한 숯불돌쇠구이", "ceo": "", "phone": "", "addr": "", "alias": ["돌쇠구이"], "note": ""}, {"name": "장터국밥", "ceo": "", "phone": "", "addr": "", "alias": ["장터국밥"], "note": ""}, {"name": "우리축산정육점(수암동)", "ceo": "", "phone": "", "addr": "", "alias": ["우리축산정육점"], "note": ""}, {"name": "아이비유통(성남)", "ceo": "", "phone": "", "addr": "", "alias": ["아이비유통"], "note": ""}, {"name": "프리미엄정육점(구리)", "ceo": "", "phone": "", "addr": "", "alias": ["프리미엄정육점"], "note": ""}, {"name": "인화숯불갈비", "ceo": "", "phone": "", "addr": "", "alias": ["인화숯불갈비"], "note": ""}, {"name": "대박마포숯불갈비", "ceo": "", "phone": "", "addr": "", "alias": ["대박마포"], "note": ""}, {"name": "찐하오마라탕 그랑시티시그니처", "ceo": "", "phone": "", "addr": "", "alias": ["찐하오마라탕"], "note": ""}, {"name": "안심한우(광명)", "ceo": "", "phone": "", "addr": "", "alias": ["안심한우"], "note": ""}, {"name": "매일정육점(신규)", "ceo": "", "phone": "", "addr": "", "alias": ["매일정육점"], "note": ""}, {"name": "두근반세근반", "ceo": "", "phone": "", "addr": "", "alias": ["두근반세근반"], "note": ""}, {"name": "장군축산도매센터(광명)", "ceo": "", "phone": "", "addr": "", "alias": ["장군축산(광명)", "장군축산"], "note": ""}, {"name": "현대축산(금천)", "ceo": "", "phone": "", "addr": "", "alias": ["현대축산 금천"], "note": ""}, {"name": "농우축산", "ceo": "", "phone": "", "addr": "", "alias": ["농우축산"], "note": ""}, {"name": "오복정육(옥련점)베스트식자재정", "ceo": "", "phone": "", "addr": "", "alias": ["오복정육"], "note": ""}, {"name": "까만돼지", "ceo": "", "phone": "", "addr": "", "alias": ["까만돼지"], "note": ""}, {"name": "대반전", "ceo": "", "phone": "", "addr": "", "alias": ["대반전"], "note": ""}, {"name": "주식회사 두둑", "ceo": "", "phone": "", "addr": "", "alias": ["두둑 양념육 업체신규", "두둑에"], "note": ""}];

let clientDB = DEFAULT_CLIENTS.map(c => ({ ...c, alias: [...c.alias] }));
let cleanedCsvRowsForExport = [];
let allChatItems = [];
let stockItems = [];
let showOnlyOrder = true;
let showOnlyKnownClient = false;

// 6대 차량 기본 설정, 배차 저장소, 수동 납품일 지정 저장소
const DEFAULT_VEHICLES = [
    "1호차 (장거리: 화성·평택·음성)",
    "2호차 (김석민: 시흥·대부권)",
    "3호차 (한승희: 군포·수원·판교·동부)",
    "4호차 (최규진: 안산 단원·상록권)",
    "5호차 (엄태원: 인천·부천권)",
    "6호차 (최청호: 광명·서울·고양권)"
];
let _rawSavedVehicles = null;
try { _rawSavedVehicles = JSON.parse(localStorage.getItem('mf_vehicles') || 'null'); } catch (e) {}
let vehicleNames = (Array.isArray(_rawSavedVehicles) && _rawSavedVehicles.length > 0)
    ? _rawSavedVehicles.slice(0, 6)
    : [...DEFAULT_VEHICLES];
while (vehicleNames.length < 6) {
    vehicleNames.push(DEFAULT_VEHICLES[vehicleNames.length]);
}

// 냉장창고 4곳 기본 설정 (사용자 편집 및 호차 선택 가능)
const DEFAULT_COLD_STORAGES = [
    { id: "CS0", name: "유상냉장", addr: "경기도 안산시 단원구 신길동", assigned: "NONE" },
    { id: "CS1", name: "포크빌리지(냉창)", addr: "경기도 용인시 처인구 백암면", assigned: "NONE" },
    { id: "CS2", name: "대산냉장", addr: "경기도 안산시 단원구 원시동", assigned: "NONE" },
    { id: "CS3", name: "황금비앤피(냉창)", addr: "경기도 안산시 상록구 청곡길 36", assigned: "NONE" }
];
let _rawSavedCS = null;
try { _rawSavedCS = JSON.parse(localStorage.getItem('mf_cold_storages') || 'null'); } catch (e) {}
let coldStorages = (Array.isArray(_rawSavedCS) && _rawSavedCS.length === 4)
    ? _rawSavedCS
    : DEFAULT_COLD_STORAGES.map(x => ({ ...x }));

let dispatchMap = JSON.parse(localStorage.getItem('mf_dispatch') || '{}');
let manualDelivMap = JSON.parse(localStorage.getItem('mf_manual_deliv_dates') || '{}');
let dispatchSortMode = localStorage.getItem('mf_dispatch_sort') || 'name'; // 'name' | 'distance' | 'items'

// UI 디바이스 모드 ('mobile' | 'tablet' | 'desktop') 및 UI 확대 배율 (기본 115%, 범위 100~150%)
let currentUiMode = localStorage.getItem('mf_ui_mode') || '';
let currentUiZoom = parseInt(localStorage.getItem('mf_ui_zoom') || '115', 10);
if (isNaN(currentUiZoom) || currentUiZoom < 100 || currentUiZoom > 150) {
    currentUiZoom = 115;
}

// 초기 샘플 재고 데이터 세팅
const INITIAL_STOCK_TEXT = `11월 10일 재고현황

삼겹   (대산) 4박 5
                 26박 6
                 12박 7
                  2박 9 
         (포크) 0박 낱 4
                  0박 낱 5 
                27박 낱 7
                25박 10
                                                  
암삼겹 (대산) 6박 6
                   5박 9
         (포크) 2박 5
                  6박 7
                 10박 10

특삼겹 (대산) 4박 4
          (포크) 2박 7
                  3박 10 
                     
빵삼겹 (포크) 0박                 

미삼 (대산) 7박 9
       (포크) 2박 7
               13박 10
           
암미삼 (대산) 0박 낱 6
         (포크) 5박 7
                  4박 10

특미삼  (대산) 1박 6
          (포크) 0박 

목살 (대산) 19박 9
       (포크) 12박 7
                30박 10
                 
특목살 (대산) 4박 6
                  8박 9
         (포크) 6박 낱 4
                  2박 7

B목살 (대산) 0박 
         (포크) 0박 

미전지 (대산) 6박 6
                  33박 낱 7
                  46박 9
        (포크) 2박 7
                10박 10

전지 (대산) 2박 6  
       (포크) 1박 7
                5박 10

지전지 (대산) 0박

갈비 (대산) 10박 9
       (포크) 20박 10
                               
등갈비 (대산) 0박 낱 4
          (포크) 3박 7
                  10박 10

등심 (대산) 4박 4
       (포크) 9박 낱 4
                 3박 10

안심  (대산) 0박 
        (포크) 5박 10

사태 (대산) 1박 4
       (포크) 2박 7
               3박 10              

앞미사태 (대산) 10박 9
            (포크) 3박 낱 7
                     5박 10

항정  (대산) 0박 낱 6
                2박 7
        (포크) 5박 7
                3박 10
                  
가브리 (대산) 0박 낱 4
                  1박 7
          (포크) 4박 10

갈매기 (대산) 0박 낱 6
                  1박 9
           (포크) 2박 7
                   1박 10

미후지 (포크) 0박
          (황금) 8박 5
                  13박 10

후지 (포크) 0박
        (대산) 0박
        (황금) 7박 9
                 5박 10
                
등뼈 (대산) 14박 9
        (포크) 30박 10
                 
냉장잡육 (포크) 2박 10

토레인 삼겹 3박 4
                 1박 5
                 7박 10

냉장 알목심f PR
    IBP 5박 

냉장 살치f PR
   엑셀 1팩

냉장 늑간f CH NBP 7박 낱
                               
냉장 수입 올리멜 삼겹 7박 ~12/3
                                 
냉장 수입 올리멜 목살 6박 ~12/5`;

/* =========================================================================
   디바이스 UI 모드 전환 (스마트폰 / 태블릿 / 데스크탑) & UI 확대 슬라이더 (100%~150%)
   ========================================================================= */
function setUiMode(mode, skipSave) {
    if (!['mobile', 'tablet', 'desktop'].includes(mode)) mode = 'desktop';
    currentUiMode = mode;

    document.body.classList.remove('ui-mobile', 'ui-tablet', 'ui-desktop');
    document.body.classList.add('ui-' + mode);

    const btnM = document.getElementById('btnUiMobile');
    const btnT = document.getElementById('btnUiTablet');
    const btnD = document.getElementById('btnUiDesktop');
    if (btnM) btnM.classList.toggle('active', mode === 'mobile');
    if (btnT) btnT.classList.toggle('active', mode === 'tablet');
    if (btnD) btnD.classList.toggle('active', mode === 'desktop');

    if (!skipSave) {
        localStorage.setItem('mf_ui_mode', mode);
    }
    if (vworldMapInstance) {
        setTimeout(() => vworldMapInstance.invalidateSize(), 260);
    }
}

function setUiZoom(zoomPct, skipSave) {
    let val = parseInt(zoomPct, 10);
    if (isNaN(val)) val = 115;
    val = Math.max(100, Math.min(150, val));
    currentUiZoom = val;

    document.documentElement.style.setProperty('--ui-zoom', (val / 100).toFixed(2));

    const sTop = document.getElementById('uiZoomSlider');
    const vTop = document.getElementById('uiZoomValue');
    const sP1 = document.getElementById('uiZoomSliderPage1');
    const vP1 = document.getElementById('uiZoomValuePage1');

    if (sTop) sTop.value = val;
    if (vTop) vTop.innerText = `${val}%`;
    if (sP1) sP1.value = val;
    if (vP1) vP1.innerText = `${val}%`;

    if (!skipSave) {
        localStorage.setItem('mf_ui_zoom', String(val));
    }
    if (vworldMapInstance) {
        setTimeout(() => vworldMapInstance.invalidateSize(), 200);
    }
}

function initDeviceAndZoomUI() {
    if (!currentUiMode) {
        const w = window.innerWidth;
        if (w <= 560) currentUiMode = 'mobile';
        else if (w <= 980) currentUiMode = 'tablet';
        else currentUiMode = 'desktop';
    }
    setUiMode(currentUiMode, true);
    setUiZoom(currentUiZoom, true);
}

/* =========================================================================
   브라우저 자동 저장(localStorage) 및 업데이트 시각 기록 기능
   ========================================================================= */
function getNowTimeFormatted() {
    const now = new Date();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${m}/${d} ${hh}:${mm}:${ss}`;
}

function recordLastUpdatedTime(customAction) {
    const stamp = getNowTimeFormatted();
    localStorage.setItem('mf_last_updated', stamp);
    const pill = document.getElementById('pillUpdated');
    if (pill) {
        pill.innerText = `🕒 ${stamp}`;
        pill.title = customAction ? `마지막 작업: ${customAction} (${stamp})` : `마지막 업데이트: ${stamp}`;
    }
}

function saveStateToBrowser(actionLabel) {
    try {
        const settings = {
            targetDate: document.getElementById('orderTargetDate').value || '',
            timeMode: document.getElementById('orderTimeMode').value || 'smart',
            showOnlyOrder: showOnlyOrder,
            showOnlyKnownClient: showOnlyKnownClient
        };
        localStorage.setItem('mf_saved_settings', JSON.stringify(settings));

        const stockRaw = document.getElementById('stockTextarea').value || '';
        if (stockRaw.trim()) {
            localStorage.setItem('mf_saved_stock_text', stockRaw);
        }

        if (allChatItems.length > 0) {
            const serializableChats = allChatItems.map(it => ({
                dateFull: it.dateFull,
                dateShort: it.dateShort,
                timeStr: it.timeStr,
                timeMins: it.timeMins,
                sender: it.sender,
                content: it.content,
                splitIndex: it.splitIndex || 0,
                splitTotal: it.splitTotal || 0
            }));
            localStorage.setItem('mf_saved_chat_items', JSON.stringify(serializableChats));
        }
        recordLastUpdatedTime(actionLabel || '자동 저장');
    } catch (e) {
        console.warn('브라우저 저장 용량 초과 또는 제한:', e);
    }
}

function restoreStateFromBrowser() {
    try {
        const savedSettings = JSON.parse(localStorage.getItem('mf_saved_settings') || 'null');
        if (savedSettings) {
            if (savedSettings.targetDate) {
                document.getElementById('orderTargetDate').value = savedSettings.targetDate;
            }
            if (savedSettings.timeMode) {
                document.getElementById('orderTimeMode').value = savedSettings.timeMode;
            }
            if (typeof savedSettings.showOnlyOrder === 'boolean') {
                showOnlyOrder = savedSettings.showOnlyOrder;
            }
            if (typeof savedSettings.showOnlyKnownClient === 'boolean') {
                showOnlyKnownClient = savedSettings.showOnlyKnownClient;
            }
        }
    } catch (e) {}

    updateHeaderToggleButtonsUI();

    const savedStock = localStorage.getItem('mf_saved_stock_text');
    document.getElementById('stockTextarea').value = savedStock && savedStock.trim() ? savedStock : INITIAL_STOCK_TEXT;
    parseAndApplyStock(false, true);

    try {
        const savedChats = JSON.parse(localStorage.getItem('mf_saved_chat_items') || 'null');
        if (savedChats && Array.isArray(savedChats) && savedChats.length > 0) {
            allChatItems = [];
            savedChats.forEach(rawIt => {
                if (rawIt.splitTotal > 1) {
                    const item = { ...rawIt };
                    classifyChatItem(item);
                    allChatItems.push(item);
                } else {
                    pushParsedMessageWithSplit(rawIt);
                }
            });
            allChatItems.forEach((item, idx) => { item.idx = idx; });
            inferDeliveryDatesForAllItems();

            if (!document.getElementById('orderTargetDate').value) {
                const lastDate = allChatItems[allChatItems.length - 1].dateFull;
                document.getElementById('orderTargetDate').value = lastDate;
            }

            const orderCnt = allChatItems.filter(x => x.type === '발주').length;
            const weightCnt = allChatItems.filter(x => x.type === '계근').length;
            document.getElementById('kakaoLoadMsg').innerText = `💾 이전 저장된 카톡 데이터 자동 복원됨 (총 ${allChatItems.length}건 중 순수발주 ${orderCnt}건 / 계근 ${weightCnt}건)`;
        }
    } catch (e) {}

    const lastUpd = localStorage.getItem('mf_last_updated');
    if (lastUpd) {
        document.getElementById('pillUpdated').innerText = `🕒 ${lastUpd}`;
    } else {
        recordLastUpdatedTime('초기 로드');
    }

    onFilterCriteriaChange(true);
}

function clearSavedBrowserData() {
    if (!confirm('브라우저에 자동 저장된 카톡 발주 내역, 수동 납품일 지정, 재고 텍스트, 배차 기록을 모두 초기화할까요?')) return;
    localStorage.removeItem('mf_saved_chat_items');
    localStorage.removeItem('mf_saved_stock_text');
    localStorage.removeItem('mf_saved_settings');
    localStorage.removeItem('mf_last_updated');
    localStorage.removeItem('mf_dispatch');
    localStorage.removeItem('mf_manual_deliv_dates');
    localStorage.removeItem('mf_cold_storages');
    location.reload();
}

window.addEventListener('DOMContentLoaded', () => {
    initDeviceAndZoomUI();
    renderVehicleConfigInputs();
    renderColdStorageInputs();
    restoreStateFromBrowser();

    if (window.location.protocol.startsWith('http') && !window.location.hostname.endsWith('github.io')) {
        fetch('./clients.csv')
            .then(res => {
                if (!res.ok) throw new Error('No local clients.csv');
                return res.arrayBuffer();
            })
            .then(buf => {
                let text = new TextDecoder('utf-8').decode(buf);
                if (text.includes('\ufffd')) text = new TextDecoder('euc-kr').decode(buf);
                processClientCsvText(text, true);
            })
            .catch(() => {});
    }
});

/* 탭 전환 함수 */
function switchTab(pageId, btnEl) {
    document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');
    if (btnEl) btnEl.classList.add('active');

    if (pageId === 'page2') renderOrdersTable();
    if (pageId === 'pageLoose') renderLooseItemsPage();
    if (pageId === 'page5') renderDiffTable();
    if (pageId === 'page6') {
        renderDispatchPage();
        initVworldMap();
    }
}

function onFilterCriteriaChange(skipSave) {
    renderOrdersTable();
    renderLooseItemsPage();
    renderDiffTable();
    renderDispatchPage();
    if (!skipSave) {
        saveStateToBrowser('날짜/필터 변경');
    }
}

/* =========================================================================
   2. 거래처 CSV 파싱 및 병합 매칭 로직
   ========================================================================= */
function loadClientCsvFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        if (text.includes('\ufffd')) {
            const r2 = new FileReader();
            r2.onload = ev => processClientCsvText(ev.target.result, false);
            r2.readAsText(file, 'euc-kr');
        } else {
            processClientCsvText(text, false);
        }
    };
    reader.readAsText(file, 'utf-8');
}

async function loadCsvFromGithub() {
    const url = document.getElementById('githubCsvUrl').value.trim();
    if (!url) { alert('GitHub Raw CSV URL을 입력해주세요.'); return; }
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('네트워크 오류');
        const buf = await res.arrayBuffer();
        let text = new TextDecoder('utf-8').decode(buf);
        if (text.includes('\ufffd')) text = new TextDecoder('euc-kr').decode(buf);
        processClientCsvText(text, false);
    } catch (err) {
        alert('GitHub CSV를 불러오지 못했습니다. Raw URL인지 확인해주세요.');
    }
}

function parseCsvLine(line) {
    const result = [];
    let cur = '', inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') inQuotes = !inQuotes;
        else if (ch === ',' && !inQuotes) { result.push(cur.trim()); cur = ''; }
        else cur += ch;
    }
    result.push(cur.trim());
    return result;
}

function upsertClientRecord(rec) {
    const idx = clientDB.findIndex(c => c.name === rec.name);
    if (idx >= 0) {
        const mergedAliases = [...new Set([...(clientDB[idx].alias || []), ...(rec.alias || [])])];
        clientDB[idx] = {
            name: rec.name,
            ceo: rec.ceo || clientDB[idx].ceo || '',
            phone: rec.phone || clientDB[idx].phone || '',
            addr: rec.addr || clientDB[idx].addr || '',
            alias: mergedAliases,
            note: rec.note || clientDB[idx].note || ''
        };
    } else {
        clientDB.push(rec);
    }
}

function processClientCsvText(csvText, isSilentAutoLoad) {
    const lines = csvText.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length < 2) return;

    const headerCols = parseCsvLine(lines[0]);
    cleanedCsvRowsForExport = [];
    let addedCount = 0;

    if (headerCols[0].includes('거래처') && headerCols.some(h => h.includes('별명'))) {
        for (let i = 1; i < lines.length; i++) {
            const c = parseCsvLine(lines[i]);
            if (!c[0]) continue;
            const aliases = c[4] ? c[4].split('|').map(s => s.trim()).filter(Boolean) : [c[0]];
            upsertClientRecord({ name: c[0], ceo: c[1]||'', phone: c[2]||'', addr: c[3]||'', alias: aliases, note: c[5]||'' });
            cleanedCsvRowsForExport.push([c[0], c[1]||'', c[2]||'', c[3]||'', aliases.join('|'), c[5]||'']);
            addedCount++;
        }
    } else {
        for (let i = 2; i < lines.length; i += 2) {
            const row1 = parseCsvLine(lines[i]);
            const row2 = (i + 1 < lines.length) ? parseCsvLine(lines[i + 1]) : [];
            const rawName = (row1[0] || '').trim();
            if (!rawName || rawName.includes('폐업') || rawName.includes('거래종료') || rawName.startsWith('X') || rawName.startsWith('x')) continue;

            const ceo = (row1[1] || '').trim();
            const phone = (row1[3] || '').trim();
            const addr = (row1[4] || '').trim();
            const note = (row2[4] || '').trim();

            const cleanAlias = rawName.replace(/\(주\)|주식회사|출고안됨/g, '').replace(/\(.*?\)/g, '').trim();
            const aliases = [rawName];
            if (cleanAlias && cleanAlias !== rawName) aliases.push(cleanAlias);

            upsertClientRecord({ name: rawName, ceo, phone, addr, alias: aliases, note });
            cleanedCsvRowsForExport.push([rawName, ceo, phone, addr, aliases.join('|'), note]);
            addedCount++;
        }
    }

    document.getElementById('clientLoadMsg').innerText = `✅ 거래처 ${addedCount}건 병합 완료! (총 ${clientDB.length}개 활성 거래처)`;
    document.getElementById('btnExportCleanCsv').style.display = 'inline-block';
    if (allChatItems.length > 0) {
        allChatItems.forEach((item, idx) => {
            item.idx = idx;
            classifyChatItem(item);
        });
        inferDeliveryDatesForAllItems();
        onFilterCriteriaChange(isSilentAutoLoad);
    }
}

function exportCleanedClientsCsv() {
    let csv = "\uFEFF거래처,대표자,전화번호,주소,별명,비고\n";
    cleanedCsvRowsForExport.forEach(r => {
        csv += r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',') + "\n";
    });
    downloadBlob(csv, "clients.csv");
}

function getSortedAliasPairs() {
    const pairs = [];
    for (const c of clientDB) {
        for (const al of (c.alias || [c.name])) {
            if (al && al.replace(/\s+/g, '').length >= 2) {
                pairs.push({ alias: al, official: c.name, clientObj: c });
            }
        }
    }
    pairs.sort((a, b) => b.alias.length - a.alias.length);
    return pairs;
}

function matchClientFromText(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return { matched: false, clientName: "미확인", officialName: "미확인", clientObj: null };

    const candidateLines = lines.slice(0, 2);
    const sortedPairs = getSortedAliasPairs();

    for (const rawLine of candidateLines) {
        const cleanLine = rawLine.replace(/^(전달:\s*|■+|●+|\*+|내일\s+|오늘\s+|월요일\s+|화요일예약\s+|수요일예약\s+|목요일\s+|금요일\s+)/g, '').trim();
        const lineNoSpace = cleanLine.replace(/\s+/g, '').toLowerCase();

        for (const p of sortedPairs) {
            const alNoSpace = p.alias.replace(/\s+/g, '').toLowerCase();
            if (lineNoSpace.startsWith(alNoSpace) || cleanLine.includes(p.alias)) {
                const pos = lineNoSpace.indexOf(alNoSpace);
                if (pos === 0) {
                    const rem = lineNoSpace.slice(alNoSpace.length);
                    if (/^(보다|쪽|에서|한테|꺼|가는|방면)/.test(rem)) continue;
                }
                return { matched: true, clientName: p.alias, officialName: p.official, clientObj: p.clientObj };
            }
        }
    }

    const firstLine = lines[0].replace(/[●■]/g, ' ').trim();
    const firstToken = firstLine.split(/[\s\.\,\~]/)[0];
    if (/정육|마트|축산|푸드|식당|갈비|감자탕|해장국|면옥|한우|삼겹|소매|택배|주물럭|쌈밥|막창|장어|꼬치|국밥/.test(firstLine)) {
        return { matched: true, clientName: firstToken, officialName: firstToken, clientObj: null };
    }
    return { matched: false, clientName: firstToken || "미확인", officialName: firstToken || "미확인", clientObj: null };
}

/* =========================================================================
   3. 계근 판별기 + 다중 거래처 합본 분할 + 카카오톡 파싱 + 스마트 납품일 판별
   ========================================================================= */
const MEAT_START_REGEX = /^(?:국내산|수입|냉장|냉동|한돈|한우|암퇘지|스페인|독일|미국산|호주산|칠레산|브라질|캐나다|테니쉬|데니쉬|두메코|올리멜|토레인|셀렉타|바텔|고원돈|티스|프레칸|프례칸|씨와이푸드|삼겹|목살|목심|미전지|전지|미삼|암삼|특삼|빵삼|등갈비|등뼈|목뼈|갈비|등심|안심|사태|앞사태|앞미사태|뒷사태|항정|가브리|갈매기|미후지|후지|오겹|우삼겹|차돌|스지|살치|부채|장족|앞장족|미니족|돈피|껍데기|잡육|등잡|왕구이|사골|오돌뼈|홍두깨|볼라|설도|늑간|알목|알목심|미추리|잡뼈|우족|덧살|덜미|민찌|수삼|모돈|엘에이|LA|백립|빽립|프렌치렉|숄더렉|삼각살|척갈비|아롱사태|스켄전지|스키너전지|지방전지|목전지|A지방|B지방|돼지)/i;
const MEAT_ANY_REGEX = /삼겹|목살|목심|미전지|전지|미삼|암삼|특삼|빵삼|특목|냉삼|대패|등갈비|등뼈|목뼈|갈비|등심|안심|사태|앞사태|앞미사태|뒷사태|항정|가브리|갈매기|미후지|후지|오겹|우삼겹|차돌|스지|LA|엘에이|살치|부채|토시|안창|장족|미니족|껍데기|돈피|잡육|등잡|왕구이|사골|오돌뼈|홍두깨|볼라|설도|늑간|알목|두메코|테니쉬|셀렉타|올리멜|토레인|바텔|고원돈|티스|프레칸|목전지|덧살|덜미|민찌|수삼|모돈|백립|빽립|프렌치렉|숄더렉|삼각살|척갈비|아롱사태/i;

function isWeighinMessage(txt) {
    if (/발주할게요|주문합니다|반품잡아서/.test(txt)) return false;

    const cleanW = txt
        .replace(/010-\d{3,4}-\d{4}|\d{10,11}/g, '')
        .replace(/\d{1,3},\d{3}\s*원?/g, '')
        .replace(/\d+\.\d{3}\s*원?/g, '')
        .replace(/\d+(?:\.\d+)?\s*~\s*\d+(?:\.\d+)?/g, '')
        .replace(/\d+\.\d+\s*(?:센치|cm|mm|미리|톤|키로|kg|k|작업|일자|일)/gi, '')
        .replace(/작업\s*\d+\.\d+/g, '')
        .replace(/\d{1,2}\.\d{1,2}일(?:자|자로|재고)?/g, '')
        .replace(/[a-zA-Z]+\d+|\d+[a-zA-Z]+/g, '')
        .replace(/\d+\s*(?:동|호|번지|층|시|구|읍|면|로|길)/g, '')
        .replace(/202\d년?/g, '')
        .replace(/(?:비번|비밀번호)\s*\d+/g, '')
        .replace(/\d{4}[*#]|8846별표|18079/g, '');

    const decMatches = cleanW.match(/\d+\.\d+/g) || [];
    if (decMatches.length >= 2) return true;
    if (decMatches.length >= 1 && /(?<!\d)\d{1,2}(?:대|포|개|각|도누|도누리)|(?<!\d)\d{2}(?:정담|황금)/.test(cleanW)) {
        return true;
    }

    const fourDigits = cleanW.match(/(?:^|[^\d])[1-3]\d{3}(?:$|[^\d])/g) || [];
    if (fourDigits.length >= 2) return true;
    if (/(?:^|[^\d])\d{3}\s+[1-3]\d{3}(?:$|[^\d])/.test(cleanW)) return true;

    return false;
}

function detectClientHeaderInLine(rawLine, sortedPairs) {
    const clean = rawLine.replace(/^(전달:\s*|■+|●+|\*+|내일\s+|오늘\s+|월요일\s+|화요일예약\s+|수요일예약\s+|목요일\s+|금요일\s+)/g, '').trim();
    if (!clean) return null;

    if (/^(삼호점|심곡동|주소|연락처|받는분|보내는|키는|비번|비밀번호|계근지|반품|패스|삭제)/.test(clean)) {
        return null;
    }
    if (MEAT_START_REGEX.test(clean)) {
        return null;
    }
    if (/부탁|감사|수고|죄송|이상입니다|보내주|입고|배송|전표|팀장님|사장님|과장님|부장님|대표님|기사님|꺼로|만요/.test(clean)) {
        if (!(MEAT_ANY_REGEX.test(clean) && /\d/.test(clean))) {
            return null;
        }
    }

    const noSpace = clean.replace(/\s+/g, '').toLowerCase();
    for (const p of sortedPairs) {
        const alNs = p.alias.replace(/\s+/g, '').toLowerCase();
        if (noSpace.startsWith(alNs)) {
            const rem = noSpace.slice(alNs.length);
            if (/^(보다|쪽|에서|한테|꺼|가는|방면|은|는|이|가|을|를|에|와|과|하고|이랑|도|점|시|구|동|로|길|정육팀장)/.test(rem)) {
                continue;
            }
            const isCorrection = /이거로\s*정정/.test(clean);
            return { alias: p.alias, official: p.official, isCorrection };
        }
    }
    return null;
}

function splitMultiOrderMessage(content) {
    const txt = String(content || '').trim();
    if (!txt) return [txt];

    if (['재고현황', '발주체크', '단가표', '분류전', '나눌꺼요', '정정해두었습니다'].some(k => txt.includes(k))) {
        return [txt];
    }
    if (/\(대산\)\s*\d+박|\(포크\)\s*\d+박/.test(txt)) {
        return [txt];
    }
    if (isWeighinMessage(txt)) {
        return [txt];
    }

    const sortedPairs = getSortedAliasPairs();
    const lines = txt.split('\n');
    const headers = [];
    let hasMeatSincePrev = false;

    lines.forEach((line, idx) => {
        const s = line.trim();
        if (!s) return;
        const hit = detectClientHeaderInLine(s, sortedPairs);
        if (hit) {
            if (headers.length === 0 || hasMeatSincePrev) {
                headers.push({ idx, alias: hit.alias, official: hit.official, isCorrection: hit.isCorrection });
                hasMeatSincePrev = Boolean(MEAT_ANY_REGEX.test(s) && /\d/.test(s));
                return;
            }
        }
        if (MEAT_ANY_REGEX.test(s)) {
            hasMeatSincePrev = true;
        }
    });

    const distinctOfficials = [...new Set(headers.map(h => h.official))];
    if (distinctOfficials.length < 2) {
        return [txt];
    }

    const leadingLines = lines.slice(0, headers[0].idx).map(l => l.trim()).filter(Boolean);
    let leadingPrefix = '';
    if (leadingLines.length > 0 && leadingLines.some(l => /내일|낼|[월화수목금토일]요일|\d{1,2}\/\d{1,2}|\d{1,2}월\s*\d{1,2}일/.test(l))) {
        leadingPrefix = leadingLines.join('\n') + '\n';
    }

    const chunks = [];
    for (let i = 0; i < headers.length; i++) {
        const startIdx = headers[i].idx;
        const endIdx = (i + 1 < headers.length) ? headers[i + 1].idx : lines.length;
        const chunkLines = lines.slice(startIdx, endIdx)
            .map(l => l.trim())
            .filter(l => l && !/^[-─=]{3,}$/.test(l));
        let chunkText = chunkLines.join('\n').trim();
        if (i > 0 && !(MEAT_ANY_REGEX.test(chunkText) && /\d/.test(chunkText))) {
            chunks[chunks.length - 1] += '\n' + chunkText;
            continue;
        }
        if (leadingPrefix) {
            chunkText = leadingPrefix + chunkText;
        }
        if (i + 1 < headers.length && headers[i + 1].isCorrection) {
            chunkText += '\n(정정취소됨)';
        }
        chunks.push(chunkText);
    }
    return chunks.length > 1 ? chunks : [txt];
}

function pushParsedMessageWithSplit(baseItem) {
    if (!baseItem) return;
    const chunks = splitMultiOrderMessage(baseItem.content);
    chunks.forEach((chunkTxt, cIdx) => {
        const subItem = {
            dateFull: baseItem.dateFull,
            dateShort: baseItem.dateShort,
            timeStr: baseItem.timeStr,
            timeMins: baseItem.timeMins,
            sender: baseItem.sender,
            content: chunkTxt,
            splitIndex: chunks.length > 1 ? (cIdx + 1) : 0,
            splitTotal: chunks.length > 1 ? chunks.length : 0
        };
        classifyChatItem(subItem);
        allChatItems.push(subItem);
    });
}

async function loadKakaoFiles(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    allChatItems = [];
    for (let i = 0; i < files.length; i++) {
        const text = await new Promise((res, rej) => {
            const r = new FileReader();
            r.onload = e => res(e.target.result);
            r.onerror = rej;
            r.readAsText(files[i], 'utf-8');
        });
        parseSingleKakaoText(text);
    }

    allChatItems.sort((a, b) => {
        if (a.dateFull !== b.dateFull) return a.dateFull.localeCompare(b.dateFull);
        return a.timeMins - b.timeMins;
    });

    allChatItems.forEach((item, idx) => { item.idx = idx; });
    inferDeliveryDatesForAllItems();

    if (allChatItems.length > 0) {
        const lastDate = allChatItems[allChatItems.length - 1].dateFull;
        document.getElementById('orderTargetDate').value = lastDate;
    }

    const orderCnt = allChatItems.filter(x => x.type === '발주').length;
    const weightCnt = allChatItems.filter(x => x.type === '계근').length;
    document.getElementById('kakaoLoadMsg').innerText = `✅ 총 ${allChatItems.length}건 분석 및 납품일 자동판별 완료! (순수발주 ${orderCnt}건 / 계근 ${weightCnt}건 분리됨)`;

    saveStateToBrowser('카톡 대화 파일 업로드');
    onFilterCriteriaChange(true);
}

function parseSingleKakaoText(text) {
    const normalized = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalized.split('\n');
    let currentDateFull = "2026-10-13";
    let currentDisplayDate = "10/13";

    const pcRegex = /^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일\s+(오전|오후)\s*(\d{1,2}:\d{2}),\s*(.*?)\s*:\s*(.*)$/;
    const mobRegex = /^\[(.*?)\]\s*\[(오전|오후)\s*(\d{1,2}:\d{2})\]\s*(.*)$/;
    const dateLineRegex = /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/;

    let curItem = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        if (line.includes('---') && line.includes('년')) {
            const dm = line.match(dateLineRegex);
            if (dm) {
                currentDateFull = `${dm[1]}-${String(dm[2]).padStart(2,'0')}-${String(dm[3]).padStart(2,'0')}`;
                currentDisplayDate = `${String(dm[2]).padStart(2,'0')}/${String(dm[3]).padStart(2,'0')}`;
            }
            continue;
        }

        if (/^\d{4}년\s*\d{1,2}월\s*\d{1,2}일\s+(오전|오후)\s*\d{1,2}:\d{2}$/.test(line) || line.includes('초대했습니다')) {
            continue;
        }

        const mPc = line.match(pcRegex);
        if (mPc) {
            if (curItem) { pushParsedMessageWithSplit(curItem); }
            const y = mPc[1], m = String(mPc[2]).padStart(2,'0'), d = String(mPc[3]).padStart(2,'0');
            currentDateFull = `${y}-${m}-${d}`;
            currentDisplayDate = `${m}/${d}`;
            const timeInfo = convertAmPmTime(mPc[4], mPc[5]);
            curItem = {
                dateFull: currentDateFull,
                dateShort: currentDisplayDate,
                timeStr: timeInfo.str,
                timeMins: timeInfo.mins,
                sender: mPc[6].trim(),
                content: mPc[7]
            };
            continue;
        }

        const mMob = line.match(mobRegex);
        if (mMob) {
            if (curItem) { pushParsedMessageWithSplit(curItem); }
            const timeInfo = convertAmPmTime(mMob[2], mMob[3]);
            curItem = {
                dateFull: currentDateFull,
                dateShort: currentDisplayDate,
                timeStr: timeInfo.str,
                timeMins: timeInfo.mins,
                sender: mMob[1].trim(),
                content: mMob[4]
            };
            continue;
        }

        if (curItem && !line.includes('카카오톡 대화') && !line.includes('저장한 날짜') && !line.includes('삭제되었습니다')) {
            curItem.content += "\n" + line;
        }
    }
    if (curItem) { pushParsedMessageWithSplit(curItem); }
}

function convertAmPmTime(ampm, hmStr) {
    const parts = hmStr.split(':');
    let h = parseInt(parts[0], 10) || 0;
    let m = parseInt(parts[1], 10) || 0;
    if (ampm === '오후' && h < 12) h += 12;
    if (ampm === '오전' && h === 12) h = 0;
    return {
        mins: h * 60 + m,
        str: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
    };
}

function classifyChatItem(item) {
    const txt = item.content.trim();
    const clientMatch = matchClientFromText(txt);
    item.clientName = clientMatch.clientName;
    item.officialName = clientMatch.officialName || clientMatch.clientName;
    item.isKnownClient = clientMatch.matched;
    item.clientObj = clientMatch.clientObj;
    item.itemKey = `${item.dateFull}_${item.timeStr}_${item.clientName}_${txt.substring(0, 18).replace(/\s+/g, '')}`;

    const ignoreKw = [
        '사진', '삭제되었습니다', '재고현황', '발주체크', '분류전', '입금', '반품장',
        '여기까지', '팩스 보냈습니다', '코드 잡았습니다', '원가내역',
        '자동차검사', '타이어', '어떤거 주문하신걸까요', '어떤걸로 할까요', '기존 재고 늑간',
        '정정 해두었습니다', '정정취소됨', '복사해서 했었는데', '그냥 박스로주시죠', '인사요'
    ];
    if (ignoreKw.some(k => txt.includes(k))) { item.type = '기타'; return; }
    if (/\(대산\)\s*\d+박|\(포크\)\s*\d+박|나눌꺼요/.test(txt)) { item.type = '기타'; return; }
    if (isWeighinMessage(txt)) { item.type = '계근'; return; }

    const validLines = txt.split('\n').filter(l => !/전체단가표요|단가표요/.test(l));
    const txtClean = validLines.join('\n').replace(/팩스/g, '').trim();

    if (MEAT_ANY_REGEX.test(txtClean) || /박스|팩|판|키로|kg|덩이|봉/i.test(txtClean)) {
        if (/납품$|반품$|교환인가요|패스래요|패스요|바꿔달래요|보내야죠|갖고감요|뿐이 안됨|두메코입니다|인가요\?$/.test(txtClean)) {
            if (!(/(?:삭제|취소|빼달)/.test(txtClean) && MEAT_ANY_REGEX.test(txtClean))) {
                item.type = '기타'; return;
            }
        }
        if (txtClean.length <= 10 && !/\d/.test(txtClean)) {
            item.type = '기타'; return;
        }
        item.type = '발주';
        return;
    }

    item.type = '기타';
}

function addDaysToDateStr(dateFullStr, days) {
    const dt = new Date(dateFullStr + "T00:00:00");
    dt.setDate(dt.getDate() + days);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function toShortDate(dateFullStr) {
    if (!dateFullStr || dateFullStr.length < 10) return dateFullStr;
    return `${dateFullStr.substring(5, 7)}/${dateFullStr.substring(8, 10)}`;
}

/* =========================================================================
   스마트 납품일(targetDeliveryDate) 자동 추론 엔진
   ========================================================================= */
const JS_WEEKDAY_MAP = { '일': 0, '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6 };

function inferDeliveryDatesForAllItems() {
    for (let i = 0; i < allChatItems.length; i++) {
        const item = allChatItems[i];
        if (item.type !== '발주') {
            item.targetDeliveryDate = item.dateFull;
            item.delivShort = item.dateShort;
            item.delivReason = '-';
            item.isManualDeliv = false;
            continue;
        }

        if (manualDelivMap[item.itemKey]) {
            item.targetDeliveryDate = manualDelivMap[item.itemKey];
            item.delivShort = toShortDate(item.targetDeliveryDate);
            item.delivReason = '수동지정';
            item.isManualDeliv = true;
            continue;
        }
        item.isManualDeliv = false;

        const txt = item.content;
        const mins = item.timeMins;
        const msgDt = new Date(item.dateFull + "T00:00:00");
        const msgWd = msgDt.getDay();

        const mDate = txt.match(/(\d{1,2})\/(\d{1,2})\s*\([월화수목금토일]\)|(\d{1,2})월\s*(\d{1,2})일\s*(?:자로|이월)/);
        if (mDate) {
            const mo = String(mDate[1] || mDate[3]).padStart(2, '0');
            const da = String(mDate[2] || mDate[4]).padStart(2, '0');
            item.targetDeliveryDate = `${msgDt.getFullYear()}-${mo}-${da}`;
            item.delivShort = `${mo}/${da}`;
            item.delivReason = `명시날짜(${mo}/${da})`;
            continue;
        }

        const mWd = txt.match(/(?:^|[^내금당명월화수목토일])(월|화|수|목|금|토|일)(?:요일|욜|주문=|발주분)|^\s*(월|화|수|목|금|토|일)\s*$/m);
        if (mWd) {
            const wdChar = mWd[1] || mWd[2];
            const targetWd = JS_WEEKDAY_MAP[wdChar];
            let daysAhead = (targetWd - msgWd + 7) % 7;
            if (daysAhead === 0 && mins >= 12 * 60) daysAhead = 7;
            item.targetDeliveryDate = addDaysToDateStr(item.dateFull, daysAhead);
            item.delivShort = toShortDate(item.targetDeliveryDate);
            item.delivReason = `요일지정(${wdChar}요일)`;
            continue;
        }

        if (/내일|낼주문|(?:^|[^가-힣])낼(?:$|[^가-힣])|아침에\s*(?:들리|갖을러|가지러)|오전\s*급\s*배송|10시\s*전에/.test(txt)) {
            item.targetDeliveryDate = addDaysToDateStr(item.dateFull, 1);
            item.delivShort = toShortDate(item.targetDeliveryDate);
            item.delivReason = '익일키워드(내일)';
            continue;
        }

        if (/오늘|당일|금일|지금\s*(?:가|갖|가지러)|조금\s*있다|퇴근\s*(?:길|때|하면서|시)|오후에|방문\s*예정|\d{1,2}시\s*(?:반\s*)?쯤?\s*(?:온데|방문|찾으러|들린데|갖으러)|즉납|전표\s*하나\s*바로|제\s*코스에서|엄과장님\s*편에/.test(txt)) {
            item.targetDeliveryDate = item.dateFull;
            item.delivShort = item.dateShort;
            item.delivReason = '당일키워드(오늘/방문)';
            continue;
        }

        const token = item.clientName.replace(/\s+/g, '').substring(0, 3);
        let weighedSameDay = false;
        if (token.length >= 2) {
            for (let j = i + 1; j < allChatItems.length; j++) {
                const nxt = allChatItems[j];
                if (nxt.dateFull !== item.dateFull) break;
                if (nxt.type === '계근' && nxt.content.includes(token)) {
                    weighedSameDay = true;
                    break;
                }
            }
        }
        if (weighedSameDay) {
            item.targetDeliveryDate = item.dateFull;
            item.delivShort = item.dateShort;
            item.delivReason = '당일계근확인';
            continue;
        }

        if (msgWd === 0) {
            item.targetDeliveryDate = addDaysToDateStr(item.dateFull, 1);
            item.delivShort = toShortDate(item.targetDeliveryDate);
            item.delivReason = '일요일→월요일';
            continue;
        }

        if (mins < 12 * 60) {
            item.targetDeliveryDate = item.dateFull;
            item.delivShort = item.dateShort;
            item.delivReason = '정오전→당일';
        } else {
            item.targetDeliveryDate = addDaysToDateStr(item.dateFull, 1);
            item.delivShort = toShortDate(item.targetDeliveryDate);
            item.delivReason = '정오후→익일';
        }
    }

    for (let i = 0; i < allChatItems.length; i++) {
        const cur = allChatItems[i];
        if (cur.type === '발주' && /이거로\s*정정/.test(cur.content)) {
            for (let p = 0; p < i; p++) {
                const prev = allChatItems[p];
                if (prev.type === '발주' && prev.officialName === cur.officialName && prev.targetDeliveryDate === cur.targetDeliveryDate) {
                    prev.type = '기타';
                    prev.delivReason = '정정대체됨';
                }
            }
        }
    }
}

function toggleItemDeliveryDate(itemIdx) {
    const item = allChatItems[itemIdx];
    if (!item || item.type !== '발주') return;

    const sameDay = item.dateFull;
    const nextDay = addDaysToDateStr(item.dateFull, 1);

    const newTarget = (item.targetDeliveryDate === sameDay) ? nextDay : sameDay;
    manualDelivMap[item.itemKey] = newTarget;
    localStorage.setItem('mf_manual_deliv_dates', JSON.stringify(manualDelivMap));

    inferDeliveryDatesForAllItems();
    recordLastUpdatedTime(`${item.clientName} 납품일 수동변경(${toShortDate(newTarget)})`);
    onFilterCriteriaChange(true);
}

/* =========================================================================
   4. [페이지 2] 발주 목록 필터링 및 6열 바둑판 렌더링 (발신자 이름만 표시)
   ========================================================================= */
function formatSenderShortName(sender) {
    if (!sender) return '';
    return String(sender)
        .replace(/\(주\)\s*미트포앤|주식회사\s*미트포앤|미트포앤/g, '')
        .replace(/\(.*?\)/g, '')
        .replace(/\s*(대표님|대표|이사님|이사|부장님|부장|차장님|차장|과장님|과장|대리님|대리|님)$/g, '')
        .trim() || sender;
}

function getFilteredOrderList(forceOnlyOrder = false) {
    const targetDateStr = document.getElementById('orderTargetDate').value;
    const mode = document.getElementById('orderTimeMode').value;

    return allChatItems.filter(item => {
        if ((showOnlyOrder || forceOnlyOrder) && item.type !== '발주') return false;
        if (showOnlyKnownClient && !item.isKnownClient) return false;
        if (mode === 'all' || !targetDateStr) return true;

        if (mode === 'smart') {
            if (item.type === '발주') {
                return item.targetDeliveryDate === targetDateStr;
            } else {
                return item.dateFull === targetDateStr;
            }
        }

        if (mode === 'fullday') {
            return item.dateFull === targetDateStr;
        }

        const prevDateStr = addDaysToDateStr(targetDateStr, -1);

        if (mode === 'prev10_to_16') {
            const isPrevFrom10 = (item.dateFull === prevDateStr && item.timeMins >= 10 * 60);
            const isCurrTo16 = (item.dateFull === targetDateStr && item.timeMins <= 16 * 60);
            return isPrevFrom10 || isCurrTo16;
        }
        if (mode === 'prev22_to_16') {
            const isPrevFrom22 = (item.dateFull === prevDateStr && item.timeMins >= 22 * 60);
            const isCurrTo16 = (item.dateFull === targetDateStr && item.timeMins <= 16 * 60);
            return isPrevFrom22 || isCurrTo16;
        }
        return true;
    });
}

function renderOrdersTable() {
    const grid = document.getElementById('orderTileGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const list = getFilteredOrderList(false);
    const targetDateStr = document.getElementById('orderTargetDate').value;
    const mode = document.getElementById('orderTimeMode').value;
    const modeLabel = mode === 'smart' ? `스마트 납품일(${toShortDate(targetDateStr)}) 기준` : '선택 시간범위 기준';
    document.getElementById('orderStats').innerText = `📋 조회된 내역: 총 ${list.length}건 (${modeLabel})`;

    if (list.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:24px; color:#dc2626; background:#fff; border-radius:8px; border:1px solid var(--border);">선택하신 납품 기준일(${escapeHtml(targetDateStr)})에 해당하는 발주 내역이 없습니다.</div>`;
        return;
    }

    list.forEach(item => {
        let badge = `<span class="badge b-other">기타</span>`;
        let cardTypeClass = 'is-other';
        if (item.type === '발주') { badge = `<span class="badge b-order">발주</span>`; cardTypeClass = ''; }
        else if (item.type === '계근') { badge = `<span class="badge b-weight">계근</span>`; cardTypeClass = 'is-weight'; }

        let clientBadge = item.isKnownClient ? `<span class="badge b-client">인증</span>` : '';
        const shortSender = formatSenderShortName(item.sender);

        let delivBadgeHtml = '';
        if (item.type === '발주') {
            const isNextDay = item.targetDeliveryDate !== item.dateFull;
            const extraCls = item.isManualDeliv ? 'manual' : (isNextDay ? 'next-day' : '');
            delivBadgeHtml = `<button class="deliv-badge-btn ${extraCls}" onclick="toggleItemDeliveryDate(${item.idx})" title="클릭하면 당일(${item.dateShort}) ↔ 익일 납품일을 수동 전환합니다">🚚 ${escapeHtml(item.delivShort)} (${escapeHtml(item.delivReason)}) 🔄</button>`;
        }

        const card = document.createElement('div');
        card.className = `order-tile-card ${cardTypeClass}`;
        card.innerHTML = `
            <div class="order-tile-head">
                <div class="order-tile-meta">
                    <span><b>${escapeHtml(item.dateShort)}</b> ${escapeHtml(item.timeStr)}</span>
                    <span><b>${escapeHtml(shortSender)}</b> ${badge}</span>
                </div>
                <div class="order-tile-client">
                    ${escapeHtml(item.clientName)}${clientBadge}${item.splitTotal > 1 ? ` <span class="badge" style="background:#7c3aed; font-size:9px;">${item.splitIndex}/${item.splitTotal}</span>` : ''}
                </div>
                ${delivBadgeHtml}
            </div>
            <div class="order-tile-body">${escapeHtml(item.content)}</div>
        `;
        grid.appendChild(card);
    });
}

function updateHeaderToggleButtonsUI() {
    const btnOrder = document.getElementById('btnOnlyOrder');
    if (btnOrder) {
        btnOrder.innerText = showOnlyOrder ? "🔍 발주만: ON" : "🔍 발주만: OFF";
        btnOrder.title = showOnlyOrder ? "발주만 보기: ON (비발주 숨김)" : "발주만 보기: OFF (전체 표시)";
        btnOrder.className = showOnlyOrder ? "hdr-icon-btn active" : "hdr-icon-btn warn";
    }
    const btnClient = document.getElementById('btnOnlyKnownClient');
    if (btnClient) {
        btnClient.innerText = showOnlyKnownClient ? "🏢 거래처: ON" : "🏢 거래처: OFF";
        btnClient.title = showOnlyKnownClient ? "등록 거래처만 보기: ON" : "등록 거래처만 보기: OFF";
        btnClient.className = showOnlyKnownClient ? "hdr-icon-btn active" : "hdr-icon-btn";
    }
}

function toggleOnlyOrder() {
    showOnlyOrder = !showOnlyOrder;
    updateHeaderToggleButtonsUI();
    onFilterCriteriaChange(false);
}

function toggleKnownClient() {
    showOnlyKnownClient = !showOnlyKnownClient;
    updateHeaderToggleButtonsUI();
    onFilterCriteriaChange(false);
}

/* =========================================================================
   5. [페이지 3] 일일 재고 현황 텍스트 파서 및 2열(한 페이지) 표 생성
   ========================================================================= */
function parseAndApplyStock(goTab, skipSave) {
    const raw = document.getElementById('stockTextarea').value;
    if (!raw.trim()) { alert('재고 텍스트를 입력해주세요.'); return; }

    const lines = raw.split(/\r?\n/);
    stockItems = [];
    let curItem = null;
    let stockTitle = "일일 재고 현황표";

    for (let rawLine of lines) {
        let line = rawLine.replace(/\u00A0/g, ' ').trim();
        if (!line) continue;

        if (line.includes('재고현황')) {
            stockTitle = line;
            continue;
        }

        const startsWithParen = line.startsWith('(');
        const startsWithNumber = /^\d/.test(line);
        const startsWithSubVendor = /^(IBP|엑셀|초이스|프라임)/i.test(line);

        if (!startsWithParen && !startsWithNumber && !startsWithSubVendor) {
            const parenIdx = line.indexOf('(');
            if (parenIdx > 0) {
                const itemName = line.substring(0, parenIdx).trim();
                curItem = getOrCreateStockItem(itemName);
                const rest = line.substring(parenIdx).trim();
                parseBrandAndQtyLine(curItem, rest);
            } else {
                const mDirect = line.match(/^([가-힣a-zA-Z\s]+?)\s+(\d+박.*)$/);
                if (mDirect) {
                    curItem = getOrCreateStockItem(mDirect[1].trim());
                    curItem.curBrand = '기타';
                    parseQtyTokens(curItem, '기타', mDirect[2]);
                } else {
                    curItem = getOrCreateStockItem(line);
                    curItem.curBrand = '기타';
                }
            }
        } else if (curItem) {
            parseBrandAndQtyLine(curItem, line);
        }
    }

    const stockTitleEl = document.getElementById('stockTitleInfo'); if (stockTitleEl) stockTitleEl.innerText = `📦 ${stockTitle}`;

    renderStockTable();
    if (!skipSave) {
        saveStateToBrowser('일일 재고현황 적용');
    }
    if (goTab) {
        switchTab('page5', document.querySelectorAll('.tab-btn')[3]);
    }
}

function getOrCreateStockItem(name) {
    let norm = name.replace(/\s+/g, ' ').trim();
    let found = stockItems.find(x => x.name === norm);
    if (!found) {
        found = {
            name: norm,
            curBrand: '기타',
            brands: {
                '대산': { boxes: 0, details: [] },
                '포크': { boxes: 0, details: [] },
                '기타': { boxes: 0, details: [] }
            }
        };
        stockItems.push(found);
    }
    return found;
}

function parseBrandAndQtyLine(itemObj, lineStr) {
    let rest = lineStr;
    const brandMatch = rest.match(/^\((.*?)\)\s*(.*)$/);
    if (brandMatch) {
        const bRaw = brandMatch[1].trim();
        if (bRaw.includes('대산')) itemObj.curBrand = '대산';
        else if (bRaw.includes('포크')) itemObj.curBrand = '포크';
        else itemObj.curBrand = bRaw;
        rest = brandMatch[2].trim();
    }
    if (rest) {
        parseQtyTokens(itemObj, itemObj.curBrand, rest);
    }
}

function parseQtyTokens(itemObj, brandName, qtyStr) {
    const targetKey = (brandName === '대산' || brandName === '포크') ? brandName : '기타';
    const boxMatch = qtyStr.match(/(\d+)\s*(?:박|박스|팩|판)/);
    const boxes = boxMatch ? parseInt(boxMatch[1], 10) : 0;
    itemObj.brands[targetKey].boxes += boxes;

    const prefix = (targetKey === '기타' && brandName !== '기타') ? `[${brandName}] ` : '';
    itemObj.brands[targetKey].details.push(prefix + qtyStr);
}

function renderStockTable() {
    const tbodyLeft = document.getElementById('stockTableBodyLeft');
    const tbodyRight = document.getElementById('stockTableBodyRight');
    if (!tbodyLeft || !tbodyRight) return;
    tbodyLeft.innerHTML = '';
    tbodyRight.innerHTML = '';

    const mid = Math.ceil(stockItems.length / 2);

    stockItems.forEach((item, idx) => {
        const d = item.brands['대산'];
        const p = item.brands['포크'];
        const o = item.brands['기타'];
        const total = d.boxes + p.boxes + o.boxes;

        const formatCell = (bObj) => {
            if (bObj.details.length === 0) return `<span class="num-zero">-</span>`;
            return `<b>${bObj.boxes}박</b> <small style="color:#555;">(${bObj.details.map(escapeHtml).join(', ')})</small>`;
        };

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><b style="color:var(--primary);">${escapeHtml(item.name)}</b></td>
            <td>${formatCell(d)}</td>
            <td>${formatCell(p)}</td>
            <td>${formatCell(o)}</td>
            <td><b>총 ${total}박</b></td>
        `;
        if (idx < mid) tbodyLeft.appendChild(tr);
        else tbodyRight.appendChild(tr);
    });
}

/* =========================================================================
   6. 품목별 발주 집계 엔진 (4페이지 일일 발주 현황표 & 5페이지 차감 계산 공용)
   ========================================================================= */
const DEFAULT_STANDARD_ITEM_NAMES = [
    "삼겹", "특삼겹", "암삼겹", "빵삼겹",
    "미삼", "암미삼", "특미삼",
    "목살", "특목살", "B목살",
    "미전지", "전지", "지전지",
    "갈비", "등갈비",
    "등심", "안심",
    "사태", "앞미사태",
    "항정", "가브리", "갈매기",
    "미후지", "후지",
    "등뼈", "냉장잡육",
    "토레인 삼겹", "냉장 알목심f PR", "냉장 살치f PR", "냉장 늑간f CH NBP",
    "냉장 수입 올리멜 삼겹", "냉장 수입 올리멜 목살"
];

const DOMESTIC_FRESH_KEYS = new Set([
    "삼겹", "특삼겹", "암삼겹", "빵삼겹",
    "미삼", "암미삼", "특미삼",
    "목살", "특목살", "B목살",
    "미전지", "전지", "지전지",
    "갈비", "등갈비",
    "등심", "안심",
    "사태", "앞미사태",
    "항정", "가브리", "갈매기",
    "미후지", "후지",
    "등뼈", "냉장잡육"
]);

const FROZEN_OR_IMPORT_REGEX = /냉동|수입|테니쉬|데니쉬|두메코|올리멜|토레인|셀렉타|바텔|고원돈|티스|프레칸|프례칸|알레한|모돈|대패|스미스|엑셀|IBP|NBP|AMH|호주|미국|스페인|독일|칠레|브라질|캐나다|와규|카라라|킬코이|내셔널|네셔널|얼리이언스|토마스/i;

const ITEM_MATCH_RULES = [
    { key: "특미삼", regex: /특미삼/ },
    { key: "암미삼", regex: /암미삼/ },
    { key: "미삼", regex: /미삼|미박삼겹/ },
    { key: "특삼겹", regex: /특삼겹|특원삼|특삼/ },
    { key: "암삼겹", regex: /암삼겹|암원삼|암삼|암퇘지\s*삼겹|A삼겹|A삼(?![a-zA-Z])/ },
    { key: "빵삼겹", regex: /빵삼겹|빵삼/ },
    { key: "토레인 삼겹", regex: /토레인\s*삼겹|삼겹\s*\d*\s*토레인/ },
    { key: "냉장 수입 올리멜 삼겹", regex: /(?:수입\s*냉장|냉장\s*수입|올리멜)\s*삼겹/ },
    { key: "삼겹", regex: /삼겹|(?<!\S)냉삼/ },
    { key: "특목살", regex: /특목살|특목심|특목/ },
    { key: "B목살", regex: /B목살|비목살|B목(?![a-zA-Z])/i },
    { key: "냉장 수입 올리멜 목살", regex: /(?:수입\s*냉장|냉장\s*수입|올리멜)\s*목살/ },
    { key: "목살", regex: /목살|목심/ },
    { key: "미전지", regex: /미전지|미\s*앞다리/ },
    { key: "지전지", regex: /지전지|지방전지|스켄전지|스키너전지/ },
    { key: "전지", regex: /전지|일반전지|A전지/ },
    { key: "등갈비", regex: /등갈비/ },
    { key: "갈비", regex: /(?<!LA|엘에이|소|척)갈비(?!살)|돈갈비|돼지갈비|생갈비/ },
    { key: "등심", regex: /(?<!꽃)등심/ },
    { key: "안심", regex: /안심/ },
    { key: "앞미사태", regex: /앞미사태|미앞사태|앞사태|앞다리사태|미사태/ },
    { key: "사태", regex: /(?<!소|우|아롱)사태|속사태|생사태|뒷사태/ },
    { key: "항정", regex: /항정/ },
    { key: "가브리", regex: /가브리/ },
    { key: "갈매기", regex: /갈매기/ },
    { key: "미후지", regex: /미후지/ },
    { key: "후지", regex: /3(?:mm|미리)\s*(?:냉장\s*)?후지|냉장\s*3(?:mm|미리)\s*후지|생후지/ },
    { key: "등뼈", regex: /(?<!목)등뼈|돈등뼈|돼지등뼈|한돈등뼈/ },
    { key: "냉장잡육", regex: /(?<!한우\s)잡육/ },
    { key: "냉장 알목심f PR", regex: /(?:냉장\s*프라임|프라임\s*냉장|수입\s*냉장|프라임)\s*알목/ },
    { key: "냉장 살치f PR", regex: /살치/ },
    { key: "냉장 늑간f CH NBP", regex: /늑간/ }
];

function matchLineItemsClean(line) {
    const isFrozenOrImp = FROZEN_OR_IMPORT_REGEX.test(line);
    const matched = [];
    for (const rule of ITEM_MATCH_RULES) {
        if (rule.regex.test(line)) {
            if (isFrozenOrImp && DOMESTIC_FRESH_KEYS.has(rule.key)) {
                continue;
            }
            matched.push(rule);
        }
    }
    return matched;
}

function parseOrderLineQuantities(line) {
    if (/반품|취소|삭제|빼달|패스/.test(line)) return [];
    if (/안녕|부탁|감사|발주|주문|이상입니다|대표님|보내주|입고|배송|스펙|선입선출|기름|지방\s*어느정도|끝까지\s*잘라|우편함|냉장고/.test(line) && !/\d/.test(line)) {
        return [];
    }

    const matchedRules = matchLineItemsClean(line);
    if (matchedRules.length === 0) return [];

    let s = line;
    s = s.replace(/\(\s*합\s*\d+\s*박스[^\)]*\)/g, ' ');
    s = s.replace(/\([^\)]*(?:일자|판당|사이|정도|만|제외|지우고|포함|재고|행사|할인)[^\)]*\)/g, ' ');
    const parenBoxOverride = s.match(/\(\s*(\d+)\s*박스로?\s*(?:작업)?\s*\)/);
    s = s.replace(/\([^\)]*\)|\[[^\]]*\]/g, ' ');

    s = s.replace(/[+-]?\d{1,3}(?:,\d{3})+(?:원|행사|할인|납)?/g, ' ');
    s = s.replace(/\d+\.\d{3}(?:원)?/g, ' ');
    s = s.replace(/-\d+\s*(?:원|할인|행사)?/g, ' ');
    s = s.replace(/\d+(?:\.\d+)?\s*(?:mm|미리|센치|cm)/gi, ' ');
    s = s.replace(/\d{1,2}\.\d{1,2}일(?:자|자로|재고)?|\d{1,2}월\s*\d{1,2}일(?:자로)?|\d{1,2}\/\d{1,2}|\d{1,2}일(?:자|자로|진|재고|포크|암삼|대산)?/g, ' ');
    s = s.replace(/\d+(?:\.\d+)?\s*~\s*\d+(?:\.\d+)?\s*(?:키로|kg)?(?:대|이상)?/gi, ' ');
    s = s.replace(/\d+\s*(?:키로|kg)\s*(?:대|이상)/gi, ' ');
    s = s.replace(/(미삼|삼겹|암삼|암미삼|특삼|특미삼)\s*1[5-9]\s*(?:키로|kg)\s+(\d+)/gi, '$1 $2');
    s = s.replace(/\d+호점|1\+\+/g, ' ');

    s = s.replace(/한박스/g, '1박스').replace(/한박/g, '1박').replace(/반박스/g, '0.5박스');
    s = s.replace(/한판/g, '1판').replace(/한덩이/g, '1덩이').replace(/한덩어리/g, '1덩어리');
    s = s.replace(/두마리분/g, '2마리분').replace(/한마리분/g, '1마리분').replace(/한마리반/g, '1마리분');

    const targetRules = (/각\s|각각/.test(s)) ? matchedRules : [matchedRules[0]];
    const results = [];

    for (const rule of targetRules) {
        if (parenBoxOverride) {
            const q = parseInt(parenBoxOverride[1], 10);
            results.push({ key: rule.key, boxes: q, packs: 0, label: `${q}박` });
            continue;
        }
        if (s.includes('0.5박스')) {
            results.push({ key: rule.key, boxes: 0.5, packs: 0, label: '반박' });
            continue;
        }
        const bm = s.match(/(\d+)\s*(?:박스|빡스|박|box|b)(?![a-zA-Z가-힣])/i);
        if (bm) {
            const q = parseInt(bm[1], 10);
            results.push({ key: rule.key, boxes: q, packs: 0, label: `${q}박` });
            continue;
        }
        const pm = s.match(/(\d+(?:\.\d+)?)\s*(팩|펙|판|봉지|봉|덩어리|덩이|진공|벌|두|마리분|마리|피스|p|개)(?![a-zA-Z가-힣])/i);
        if (pm) {
            const pq = parseFloat(pm[1]) || 1;
            results.push({ key: rule.key, boxes: 0, packs: pq, label: `${pq}${pm[2]}` });
            continue;
        }
        const km = s.match(/(\d+(?:\.\d+)?)\s*(?:키로|kg|킬|k)(?![a-zA-Z가-힣])/i);
        if (km) {
            results.push({ key: rule.key, boxes: 0, packs: 1, label: km[0].trim() });
            continue;
        }
        const bare = s.match(/(?:^|[^\d.])(\d{1,2})(?:$|[\s.포대정])/);
        if (bare) {
            const q = parseInt(bare[1], 10);
            results.push({ key: rule.key, boxes: q, packs: 0, label: `${q}박` });
        }
    }
    return results;
}

function computeOrderAggregation() {
    const orders = getFilteredOrderList(true);
    const summaryMap = {};

    const itemList = stockItems.length > 0
        ? stockItems
        : DEFAULT_STANDARD_ITEM_NAMES.map(nm => ({
            name: nm,
            brands: { '대산': { boxes: 0 }, '포크': { boxes: 0 }, '기타': { boxes: 0 } }
        }));

    itemList.forEach(s => {
        summaryMap[s.name] = {
            '대산': { stock: s.brands['대산'].boxes, orderBox: 0, orderPack: 0, clients: [] },
            '포크': { stock: s.brands['포크'].boxes, orderBox: 0, orderPack: 0, clients: [] },
            '기타': { stock: s.brands['기타'].boxes, orderBox: 0, orderPack: 0, clients: [] }
        };
    });

    const seenSignatures = new Set();

    orders.forEach(ord => {
        const txt = ord.content;

        if (/취소|삭제|빼달|패스/.test(txt) && !/반품/.test(txt)) {
            txt.split('\n').forEach(line => {
                if (/취소|삭제|빼달|패스/.test(line)) {
                    const rules = matchLineItemsClean(line);
                    if (rules.length > 0 && summaryMap[rules[0].key]) {
                        const targetItem = summaryMap[rules[0].key];
                        const bm = line.match(/(\d+)\s*(?:박스|박)?/);
                        const q = bm ? parseInt(bm[1], 10) : 1;
                        let br = '기타';
                        if (/대산/.test(line)) br = '대산';
                        else if (/포크|농협/.test(line)) br = '포크';
                        else if (targetItem['포크'].orderBox >= q) br = '포크';
                        else if (targetItem['대산'].orderBox >= q) br = '대산';
                        targetItem[br].orderBox = Math.max(0, targetItem[br].orderBox - q);
                        targetItem[br].clients.push(`${ord.clientName}(-${q}취소)`);
                    }
                }
            });
            return;
        }

        const lines = txt.split('\n').map(l => l.trim()).filter(Boolean);
        let msgDefaultBrand = '미지정';
        if (/대산꺼로|대산으로/.test(txt)) msgDefaultBrand = '대산';
        else if (/포크로|농협/.test(txt)) msgDefaultBrand = '포크';

        const lineResults = [];
        lines.forEach(line => {
            const parsed = parseOrderLineQuantities(line);
            parsed.forEach(p => lineResults.push({ line, ...p }));
        });
        if (lineResults.length > 0) {
            const sig = `${ord.officialName}|${lineResults.map(r => `${r.key}:${r.boxes}:${r.packs}`).join(',')}`;
            if (seenSignatures.has(sig)) return;
            seenSignatures.add(sig);
        }

        lineResults.forEach(res => {
            const targetItem = summaryMap[res.key];
            if (!targetItem) return;

            let br = '기타';
            if (/대산/.test(res.line)) br = '대산';
            else if (/포크|농협/.test(res.line)) br = '포크';
            else if (/정담|황금|토레인|올리멜|엑셀|IBP|NBP/i.test(res.line)) br = '기타';
            else if (msgDefaultBrand !== '미지정') br = msgDefaultBrand;
            else {
                if (targetItem['포크'].stock >= targetItem['대산'].stock && targetItem['포크'].stock > 0) br = '포크';
                else if (targetItem['대산'].stock > 0) br = '대산';
                else br = '기타';
            }

            if (res.boxes > 0) {
                targetItem[br].orderBox += res.boxes;
                targetItem[br].clients.push(`${ord.clientName}(${res.label})`);
            } else if (res.packs > 0) {
                targetItem[br].orderPack += res.packs;
                targetItem[br].clients.push(`${ord.clientName}(${res.label})`);
            }
        });
    });

    return summaryMap;
}

/* =========================================================================
   7. [페이지 4] 일일 발주 현황표 렌더링 (재고목록과 동일하게 2열 한페이지 보기)
   ========================================================================= */
function renderOrderSummaryTable() {
    const tbodyLeft = document.getElementById('orderSummaryTableBodyLeft');
    const tbodyRight = document.getElementById('orderSummaryTableBodyRight');
    if (!tbodyLeft || !tbodyRight) return;
    tbodyLeft.innerHTML = '';
    tbodyRight.innerHTML = '';

    const tDate = document.getElementById('orderTargetDate').value || '전체';
    document.getElementById('orderSummaryDateInfo').innerText = `[납품 기준일: ${tDate}]`;

    const summaryMap = computeOrderAggregation();
    const keys = Object.keys(summaryMap);
    const mid = Math.ceil(keys.length / 2);

    keys.forEach((itemName, idx) => {
        const g = summaryMap[itemName];
        const d = g['대산'], p = g['포크'], o = g['기타'];
        const totBox = d.orderBox + p.orderBox + o.orderBox;
        const totPack = d.orderPack + p.orderPack + o.orderPack;

        const formatOrderCell = (bObj) => {
            if (bObj.orderBox === 0 && bObj.orderPack === 0) return `<span class="num-zero">0박</span>`;
            let head = `<b style="color:var(--accent);">${bObj.orderBox}박</b>`;
            if (bObj.orderPack > 0) head += ` <b style="color:var(--warn);">+${bObj.orderPack}팩</b>`;
            return `${head}<br><small style="color:#4b5563;">${bObj.clients.map(escapeHtml).join(', ')}</small>`;
        };

        let totStr = `<b>총 ${totBox}박</b>`;
        if (totPack > 0) totStr += `<br><small style="color:var(--warn); font-weight:bold;">+${totPack}팩</small>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><b style="color:var(--primary);">${escapeHtml(itemName)}</b></td>
            <td>${formatOrderCell(d)}</td>
            <td>${formatOrderCell(p)}</td>
            <td>${formatOrderCell(o)}</td>
            <td>${totStr}</td>
        `;
        if (idx < mid) tbodyLeft.appendChild(tr);
        else tbodyRight.appendChild(tr);
    });
}

function copyKakaoOrderCheckText() {
    const summaryMap = computeOrderAggregation();
    let lines = ["발주체크"];
    Object.keys(summaryMap).forEach(itemName => {
        const g = summaryMap[itemName];
        const totBox = g['대산'].orderBox + g['포크'].orderBox + g['기타'].orderBox;
        const totPack = g['대산'].orderPack + g['포크'].orderPack + g['기타'].orderPack;
        const bStr = totBox > 0 ? `${totBox}박스` : `박스`;
        const pStr = totPack > 0 ? `${totPack}팩` : `팩`;
        lines.push(`${itemName} ${bStr} ${pStr}`);
    });
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
        alert("카톡용 '발주체크' 요약 텍스트가 클립보드에 복사되었습니다!");
    });
}

function downloadOrderSummaryCsv() {
    const summaryMap = computeOrderAggregation();
    let csv = "\uFEFF품목명,대산(발주박스),대산(상세),포크(발주박스),포크(상세),기타(발주박스),기타(상세),총발주(박스),총발주(팩/소분)\n";
    Object.keys(summaryMap).forEach(itemName => {
        const g = summaryMap[itemName];
        const d = g['대산'], p = g['포크'], o = g['기타'];
        const totBox = d.orderBox + p.orderBox + o.orderBox;
        const totPack = d.orderPack + p.orderPack + o.orderPack;
        csv += `"${itemName}",${d.orderBox},"${d.clients.join(' / ')}",${p.orderBox},"${p.clients.join(' / ')}",${o.orderBox},"${o.clients.join(' / ')}",${totBox},${totPack}\n`;
    });
    downloadBlob(csv, "미트포앤_일일발주현황표.csv");
}


/* =========================================================================
   7-B. [페이지 3] 당일 낱개·소분·작업 목록 추출 및 6열 바둑판 관리
   ========================================================================= */
let looseTypeFilter = localStorage.getItem('mf_loose_type') || 'ALL';     // 'ALL' | 'WORK' | 'SIMPLE'
let looseGroupMode = localStorage.getItem('mf_loose_group') || 'client';  // 'client' | 'item' | 'vehicle'
let looseDoneMap = {};
try { looseDoneMap = JSON.parse(localStorage.getItem('mf_loose_done') || '{}'); } catch (e) {}

const LOOSE_UNIT_REGEX = /(?:0\.5박스|\d+(?:\.\d+)?\s*(?:팩|펙|판|봉지|봉|덩어리|덩이|진공|벌|두|마리분|마리|피스|p|개|키로|kg|킬|k)(?![a-zA-Z가-힣]))/i;
const WORK_KEYWORD_REGEX = /작업|슬라이스|세절|절단|제육|찌개|찌게|대패|수육|구이용|구이반|깍뚝|반반|소분|다짐|민찌|미리작업|썰어|등분|갈라|쪼개/i;

function detectLooseCategoryName(lineText, fallbackName) {
    const matched = matchLineItemsClean(lineText);
    if (matched.length > 0) return matched[0].key;
    if (/우삼겹|차돌/.test(lineText)) return '우삼겹·차돌';
    if (/갈비살|늑간|살치|부채|홍두깨|설도|사골|우족|잡뼈|아롱|척갈비/.test(lineText)) return '소고기·기타';
    if (/목전지|볼라/.test(lineText)) return '목전지·전각';
    if (/장족|미니족|족발/.test(lineText)) return '장족·미니족';
    if (/돈피|껍데기|오돌뼈|덜미|덧살|민찌|모돈|왕구이/.test(lineText)) return '부산물·특수부위';
    if (/테니쉬|데니쉬|두메코|올리멜|토레인|바텔|고원돈|셀렉타|수입/.test(lineText)) return '수입돈육';
    return fallbackName || '기타품목';
}

function getFilteredLooseEntries() {
    const orders = getFilteredOrderList(true);
    const entries = [];

    orders.forEach(ord => {
        const txt = ord.content || '';
        if (/취소|삭제|빼달|패스/.test(txt) && !/반품/.test(txt)) return;

        const rawLines = txt.split('\n');
        let lastCategoryName = '';

        rawLines.forEach((rawLine, lineIdx) => {
            const line = rawLine.trim();
            if (!line) return;
            if (/반품|취소|삭제|빼달|패스/.test(line)) return;

            const hasMeat = MEAT_ANY_REGEX.test(line);
            const startsWithQtyOnly = /^\d+(?:\.\d+)?\s*(?:팩|펙|판|봉지|봉|덩어리|덩이|진공|벌|두|마리분|마리|피스|p|개|키로|kg|킬|k)/i.test(line);

            if (!hasMeat && !(startsWithQtyOnly && lastCategoryName)) return;

            const norm = line
                .replace(/한박스/g, '1박스')
                .replace(/한박/g, '1박')
                .replace(/반박스/g, '0.5박스')
                .replace(/한판/g, '1판')
                .replace(/한덩이/g, '1덩이')
                .replace(/한덩어리/g, '1덩어리')
                .replace(/두마리분/g, '2마리분')
                .replace(/한마리분/g, '1마리분')
                .replace(/한마리반/g, '1마리분');

            const noSpec = norm
                .replace(/\d+(?:\.\d+)?\s*~\s*\d+(?:\.\d+)?\s*(?:키로|kg)?(?:대|이상)?/gi, ' ')
                .replace(/\d+\s*(?:키로|kg)\s*(?:대|이상)/gi, ' ')
                .replace(/(미삼|삼겹|암삼|암미삼|특삼|특미삼)\s*1[5-9]\s*(?:키로|kg)\s+(\d+)/gi, '$1 $2')
                .replace(/\(\s*대략[^)]*\)/g, ' ');

            if (!/\d/.test(noSpec) && !noSpec.includes('돈피')) return;

            const catName = detectLooseCategoryName(line, lastCategoryName);
            if (hasMeat) lastCategoryName = catName;

            const hasLoose = LOOSE_UNIT_REGEX.test(noSpec);
            const hasWork = WORK_KEYWORD_REGEX.test(noSpec);

            if (hasLoose || hasWork) {
                const entryKey = `${ord.itemKey}_L${lineIdx}_${line.substring(0, 14).replace(/\s+/g, '')}`;
                const vCode = dispatchMap[ord.clientName] || 'UNASSIGNED';
                let vLabel = '미배차';
                if (vCode.startsWith('V')) {
                    const vIdx = parseInt(vCode.substring(1), 10);
                    vLabel = `${vIdx + 1}호차`;
                } else if (vCode === 'PICKUP') {
                    vLabel = '방문/택배';
                }

                entries.push({
                    entryKey,
                    clientName: ord.clientName,
                    sender: formatSenderShortName(ord.sender),
                    timeStr: ord.timeStr,
                    delivShort: ord.delivShort,
                    category: catName,
                    lineText: line,
                    isWork: hasWork,
                    vCode,
                    vLabel,
                    isDone: Boolean(looseDoneMap[entryKey])
                });
            }
        });
    });

    return entries;
}

function setLooseTypeFilter(mode) {
    looseTypeFilter = mode;
    localStorage.setItem('mf_loose_type', mode);
    renderLooseItemsPage();
}

function setLooseGroupMode(mode) {
    looseGroupMode = mode;
    localStorage.setItem('mf_loose_group', mode);
    renderLooseItemsPage();
}

function toggleLooseEntryDone(entryKey) {
    looseDoneMap[entryKey] = !looseDoneMap[entryKey];
    if (!looseDoneMap[entryKey]) delete looseDoneMap[entryKey];
    localStorage.setItem('mf_loose_done', JSON.stringify(looseDoneMap));
    recordLastUpdatedTime('낱개 작업 체크');
    renderLooseItemsPage();
}

function clearLooseChecks() {
    if (!confirm('현재 체크된 낱개 완료 표시를 모두 해제할까요?')) return;
    looseDoneMap = {};
    localStorage.removeItem('mf_loose_done');
    renderLooseItemsPage();
}

function renderLooseItemsPage() {
    const grid = document.getElementById('looseTileGrid');
    const statsEl = document.getElementById('looseStats');
    if (!grid) return;
    grid.innerHTML = '';

    const allEntries = getFilteredLooseEntries();
    const workCnt = allEntries.filter(e => e.isWork).length;
    const simpleCnt = allEntries.filter(e => !e.isWork).length;
    const doneCnt = allEntries.filter(e => e.isDone).length;

    const btnAll = document.getElementById('btnLooseTypeAll');
    const btnWork = document.getElementById('btnLooseTypeWork');
    const btnSimple = document.getElementById('btnLooseTypeSimple');
    if (btnAll) { btnAll.classList.toggle('active', looseTypeFilter === 'ALL'); btnAll.innerText = `전체 (${allEntries.length})`; }
    if (btnWork) { btnWork.classList.toggle('active', looseTypeFilter === 'WORK'); btnWork.innerText = `🔪 작업·세절만 (${workCnt})`; }
    if (btnSimple) { btnSimple.classList.toggle('active', looseTypeFilter === 'SIMPLE'); btnSimple.innerText = `⚖️ 단순 낱개만 (${simpleCnt})`; }

    const btnGC = document.getElementById('btnLooseGroupClient');
    const btnGI = document.getElementById('btnLooseGroupItem');
    const btnGV = document.getElementById('btnLooseGroupVehicle');
    if (btnGC) btnGC.classList.toggle('active', looseGroupMode === 'client');
    if (btnGI) btnGI.classList.toggle('active', looseGroupMode === 'item');
    if (btnGV) btnGV.classList.toggle('active', looseGroupMode === 'vehicle');

    const filtered = allEntries.filter(e => {
        if (looseTypeFilter === 'WORK') return e.isWork;
        if (looseTypeFilter === 'SIMPLE') return !e.isWork;
        return true;
    });

    if (statsEl) {
        statsEl.innerText = `🔪 당일 낱개·작업 목록: 총 ${filtered.length}건 (완료 ${doneCnt}/${allEntries.length}건)`;
    }

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:24px; color:#6b7280; background:#fff; border-radius:8px; border:1px solid var(--border);">선택하신 기준일에 해당하는 낱개·작업 주문이 없습니다.</div>`;
        return;
    }

    // Group entries by client / item / vehicle
    const groupMap = new Map();
    filtered.forEach(e => {
        let gKey = e.clientName;
        let gSub = e.vLabel;
        let topColor = '#1f4e79';

        if (looseGroupMode === 'item') {
            gKey = e.category;
            gSub = '품목별 묶음';
            topColor = '#047857';
        } else if (looseGroupMode === 'vehicle') {
            gKey = e.vCode;
            gSub = '배차 호차별';
            if (e.vCode.startsWith('V')) {
                const idx = parseInt(e.vCode.substring(1), 10);
                topColor = VEHICLE_COLORS[idx] || '#1f4e79';
            } else {
                topColor = '#4b5563';
            }
        } else {
            if (e.vCode.startsWith('V')) {
                const idx = parseInt(e.vCode.substring(1), 10);
                topColor = VEHICLE_COLORS[idx] || '#1f4e79';
            }
        }

        if (!groupMap.has(gKey)) {
            let titleText = gKey;
            if (looseGroupMode === 'vehicle') {
                if (gKey.startsWith('V')) {
                    titleText = vehicleNames[parseInt(gKey.substring(1), 10)] || gKey;
                } else if (gKey === 'PICKUP') {
                    titleText = '📦 직접방문 / 택배';
                } else {
                    titleText = '⚠️ 미배차';
                }
            }
            groupMap.set(gKey, { title: titleText, sub: gSub, color: topColor, items: [] });
        }
        groupMap.get(gKey).items.push(e);
    });

    const groups = Array.from(groupMap.values());
    if (looseGroupMode === 'client') {
        groups.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    }

    groups.forEach(grp => {
        const doneInGrp = grp.items.filter(x => x.isDone).length;
        let rowsHtml = '';
        grp.items.forEach(it => {
            const tagHtml = it.isWork
                ? `<span class="loose-tag-work">작업</span>`
                : `<span class="loose-tag-simple">낱개</span>`;
            const prefixLabel = (looseGroupMode !== 'client')
                ? `<b style="color:var(--primary);">[${escapeHtml(it.clientName)}]</b> `
                : '';
            const rowCls = `loose-row ${it.isWork ? 'is-work' : ''} ${it.isDone ? 'is-done' : ''}`;
            rowsHtml += `
                <label class="${rowCls}">
                    <input type="checkbox" ${it.isDone ? 'checked' : ''} onchange="toggleLooseEntryDone('${escapeHtml(it.entryKey)}')">
                    <span>${tagHtml} ${prefixLabel}${escapeHtml(it.lineText)}</span>
                </label>
            `;
        });

        const card = document.createElement('div');
        card.className = 'order-tile-card';
        card.style.borderTopColor = grp.color;
        card.innerHTML = `
            <div class="order-tile-head">
                <div class="order-tile-meta">
                    <span style="font-weight:bold; color:${grp.color};">${escapeHtml(grp.sub)}</span>
                    <span>${doneInGrp}/${grp.items.length} 완료</span>
                </div>
                <div class="order-tile-client">${escapeHtml(grp.title)}</div>
            </div>
            <div class="loose-item-list">${rowsHtml}</div>
        `;
        grid.appendChild(card);
    });
}

function copyKakaoLooseListText() {
    const entries = getFilteredLooseEntries();
    if (entries.length === 0) {
        alert('복사할 당일 낱개 목록이 없습니다.');
        return;
    }
    const tDate = document.getElementById('orderTargetDate').value || '';
    const byClient = new Map();
    entries.forEach(e => {
        if (!byClient.has(e.clientName)) byClient.set(e.clientName, []);
        byClient.get(e.clientName).push(`${e.isWork ? '[작업]' : ''}${e.lineText}`);
    });

    const lines = [`[낱개·작업 목록 ${toShortDate(tDate)}]`];
    byClient.forEach((items, cName) => {
        lines.push(`\n${cName}`);
        items.forEach(it => lines.push(`- ${it}`));
    });

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
        alert(`카톡용 낱개·작업 목록(${entries.length}건)이 클립보드에 복사되었습니다!`);
    });
}

function downloadLooseCsv() {
    const entries = getFilteredLooseEntries();
    let csv = "\uFEFF납품일,배차차량,거래처명,품목분류,구분,낱개주문내용,완료여부\n";
    entries.forEach(e => {
        const clean = e.lineText.replace(/"/g, '""');
        csv += `"${e.delivShort}","${e.vLabel}","${e.clientName}","${e.category}","${e.isWork ? '작업·세절' : '단순낱개'}","${clean}","${e.isDone ? '완료' : '대기'}"\n`;
    });
    downloadBlob(csv, "미트포앤_당일낱개목록.csv");
}

/* =========================================================================
   8. [페이지 5] 발주차감 잔여재고 렌더링
   ========================================================================= */
function renderDiffTable() {
    const tbody = document.getElementById('diffTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const summaryMap = computeOrderAggregation();

    Object.keys(summaryMap).forEach(itemName => {
        const bGroup = summaryMap[itemName];
        ['대산', '포크', '기타'].forEach(br => {
            const data = bGroup[br];
            if (data.stock === 0 && data.orderBox === 0 && data.orderPack === 0) return;

            const remain = data.stock - data.orderBox;
            const remainClass = remain < 0 ? 'num-neg' : (remain > 0 ? 'num-pos' : 'num-zero');
            const remainText = remain < 0 ? `${remain}박 (부족!)` : `${remain}박`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><b>${escapeHtml(itemName)}</b></td>
                <td>${escapeHtml(br)}</td>
                <td><b>${data.stock}박</b></td>
                <td><b>${data.orderBox}박</b></td>
                <td>${data.orderPack > 0 ? data.orderPack + '팩(건)' : '-'}</td>
                <td class="${remainClass}">${remainText}</td>
                <td style="font-size:11px; color:#4b5563;">${data.clients.map(escapeHtml).join(', ') || '-'}</td>
            `;
            tbody.appendChild(tr);
        });
    });
}

function downloadDiffCsv() {
    const summaryMap = computeOrderAggregation();
    let csv = "\uFEFF품목명,브랜드,현재재고(박스),금일발주(박스),소분/팩발주,차감후잔여재고(박스),발주거래처내역\n";
    Object.keys(summaryMap).forEach(itemName => {
        const bGroup = summaryMap[itemName];
        ['대산', '포크', '기타'].forEach(br => {
            const d = bGroup[br];
            if (d.stock === 0 && d.orderBox === 0 && d.orderPack === 0) return;
            const rem = d.stock - d.orderBox;
            csv += `"${itemName}","${br}",${d.stock},${d.orderBox},${d.orderPack},${rem},"${d.clients.join(', ')}"\n`;
        });
    });
    downloadBlob(csv, "미트포앤_발주차감_잔여재고표.csv");
}

/* =========================================================================
   9. [페이지 6] 권역·동선 · 냉장창고 4곳 · VWorld 지도 · 6열 기사배차 & 6열 전체배정
   ========================================================================= */
const WAREHOUSE_ORIGIN = { name: "미트포앤 출발거점 (안산 선부·시흥 하상)", lat: 37.3445, lng: 126.8115 };
const VWORLD_API_KEY = "3351CCD7-07E8-40AB-97D0-243A592B74C3";
const VEHICLE_COLORS = ["#be123c", "#b45309", "#047857", "#1d4ed8", "#0369a1", "#6d28d9"];

let geoCache = {};
try { geoCache = JSON.parse(localStorage.getItem('mf_geo_cache') || '{}'); } catch (e) {}

function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371.0;
    const toRad = d => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateFallbackCoords(clientName, addr) {
    const s = `${clientName} ${addr}`;
    if (/음성|맹동|충북|진천|청주/.test(s)) return { lat: 36.9380, lng: 127.5350 };
    if (/평택|동삭/.test(s)) return { lat: 37.0150, lng: 127.0950 };
    if (/오산|외삼미|동탄|반송동|병점|진안/.test(s)) return { lat: 37.1850, lng: 127.0750 };
    if (/매송|비봉|태광|유포리|향남/.test(s)) return { lat: 37.2650, lng: 126.9050 };
    if (/의정부|매일정육점/.test(s)) return { lat: 37.7380, lng: 127.0450 };
    if (/구리|프리미엄정육점/.test(s)) return { lat: 37.5940, lng: 127.1300 };
    if (/광진|구의|아차산|정성마트/.test(s)) return { lat: 37.5450, lng: 127.0880 };
    if (/고양|일산|화정|덕양|원신산업|효자축산/.test(s)) return { lat: 37.6580, lng: 126.8320 };
    if (/성남|분당|판교|삼평|대장동|중원|푸른목장|1등축산|아이비유통/.test(s)) return { lat: 37.3940, lng: 127.1110 };
    if (/용인|기흥|공세동|동백|한돈미트|엔마트|주식회사정육점/.test(s)) return { lat: 37.2450, lng: 127.1150 };
    if (/수원|율전|영화동|권선|영통|이의동|차이나|구들장|린이네.*본점/.test(s)) return { lat: 37.2750, lng: 127.0350 };
    if (/의왕|장안중앙|고기바보장안|안양|평촌/.test(s)) return { lat: 37.3450, lng: 126.9680 };
    if (/군포|산본|금정|도마교|부곡동|송정|고기바보부곡|고기바보송정|거시기|돌쇠구이/.test(s)) return { lat: 37.3580, lng: 126.9350 };
    if (/동작|상도|성대/.test(s)) return { lat: 37.5030, lng: 126.9480 };
    if (/관악|봉천|한양봉천|용산|농우축산/.test(s)) return { lat: 37.4820, lng: 126.9520 };
    if (/영등포|양평동|신길동.*래미안|신풍푸줏간|삼대축산/.test(s)) return { lat: 37.5150, lng: 126.9050 };
    if (/금천|가산|시흥동|가리봉|참새방앗간|소문난정육점|대박축산금천|현대축산/.test(s)) return { lat: 37.4650, lng: 126.8950 };
    if (/강서|화곡|하늘소화곡|양천|신정동|대반전/.test(s)) return { lat: 37.5350, lng: 126.8450 };
    if (/광명|철산|소하|하늘소광명|광명꿀|토종축산|안심한우|장군축산|대박마포/.test(s)) return { lat: 37.4780, lng: 126.8660 };
    if (/부천|원미|소사|오정|상동|심곡|역곡|원종|김치왕|하늘소역곡|원대성|맛있는한우/.test(s)) return { lat: 37.4850, lng: 126.8110 };
    if (/부평|십정|일신|산곡|신박축산|막뚱이|형제정육점1호점/.test(s)) return { lat: 37.4950, lng: 126.7150 };
    if (/미추홀|주안|에이스미트주안|인천\s*동구|화평동|횡성.*인천/.test(s)) return { lat: 37.4650, lng: 126.6750 };
    if (/연수|동춘|옥련|오복정육/.test(s)) return { lat: 37.4100, lng: 126.6700 };
    if (/남동|서창|논현|별빛|한우세상|sk축산/i.test(s)) return { lat: 37.4250, lng: 126.7450 };
    if (/대부/.test(s)) return { lat: 37.2450, lng: 126.5850 };
    if (/거모|정왕|배곧|좋은축산|오빠막창|덕이네|까만돼지|전라도|옥이네|찌그러진|장터국밥|두근반|이모네|천하제일/.test(s)) return { lat: 37.3460, lng: 126.7350 };
    if (/신천|은행동|은계|포동|참예소|맛닭꼬치|골목대장|전설은행|도담|한결축산/.test(s)) return { lat: 37.4350, lng: 126.7880 };
    if (/시흥|하상|하중|장곡|능곡|목감|인화|곱창연가|다연|여기식당|청정맛집|오늘은냉삼|국민생고기|얼음막걸리/.test(s)) return { lat: 37.3810, lng: 126.8050 };
    if (/본오|건건|반월|수암|본오농민|삼겹연구소|원산면옥|고기앤장어|으뜸장어|더갈비|상미.*반월|우리축산/.test(s)) return { lat: 37.2980, lng: 126.8620 };
    if (/사동|이동|일동|와동|성포|월피|한마음|오늘은고기다|다온|스타마트|오소돈|한상궁|슈퍼킹|바른|삼사오|예서/.test(s)) return { lat: 37.3180, lng: 126.8350 };
    if (/초지|고잔|새솔|풍년|큐엔씨|농민.*고잔|구워랑/.test(s)) return { lat: 37.3120, lng: 126.8120 };
    if (/선부|신길|삼부자|대패나라|갈비면옥|백봉|횡성본점|사동쌈엔쌈|쌈엔쌈|샛터|신길양평/.test(s)) return { lat: 37.3350, lng: 126.8090 };
    return { lat: 37.3445, lng: 126.8115 };
}

function getCoordsForClient(clientName, addr) {
    const cacheKey = (addr && addr.trim()) ? addr.trim() : clientName;
    if (geoCache[cacheKey]) {
        return { ...geoCache[cacheKey], exact: true };
    }
    const est = estimateFallbackCoords(clientName, addr);
    return { ...est, exact: false };
}

function countOrderBoxesLooseAndItems(orderText) {
    const lines = orderText.split('\n').map(l => l.trim()).filter(Boolean);
    let totalBoxes = 0;
    let totalLoose = 0;
    let itemCount = 0;

    lines.forEach((line, idx) => {
        if (/반품|취소|삭제|빼달|패스/.test(line)) return;
        if (/010-\d{3,4}-\d{4}|안녕하|발주드리려고|부탁드립|부탁해요|보내주세요|보내주세여|이상입니다|감사합니다|주문합니다|주문드립니다|방문예정|들리겠습니다|차차장님|우편함에|넣어주세요|기름 적은거로/.test(line)) {
            if (!MEAT_ANY_REGEX.test(line)) return;
        }
        if (idx === 0 && !/\d+\s*(박스|빡스|박|box|팩|펙|판|봉|덩이|벌|p|k|kg)/i.test(line)) {
            return;
        }

        let s = line;
        s = s.replace(/\(\s*합\s*\d+\s*박스[^\)]*\)/g, ' ');
        s = s.replace(/\([^\)]*(?:일자|판당|사이|정도|만|제외|지우고|포함|재고|행사|할인)[^\)]*\)/g, ' ');
        const parenBoxOverride = s.match(/\(\s*(\d+)\s*박스로?\s*(?:작업)?\s*\)/);
        s = s.replace(/\([^\)]*\)|\[[^\]]*\]/g, ' ');

        s = s.replace(/[+-]?\d{1,3}(?:,\d{3})+(?:원|행사|할인|납)?/g, ' ');
        s = s.replace(/\d+\.\d{3}(?:원)?/g, ' ').replace(/-\d+\s*(?:원|할인|행사)?/g, ' ');
        s = s.replace(/\d+(?:\.\d+)?\s*(?:mm|미리|센치|cm)/gi, ' ');
        s = s.replace(/\d{1,2}\.\d{1,2}일(?:자|자로|재고)?|\d{1,2}월\s*\d{1,2}일(?:자로)?|\d{1,2}\/\d{1,2}|\d{1,2}일(?:자|자로|진|재고|포크|암삼|대산)?/g, ' ');
        s = s.replace(/\d+(?:\.\d+)?\s*~\s*\d+(?:\.\d+)?\s*(?:키로|kg)?(?:대|이상)?/gi, ' ');
        s = s.replace(/\d+\s*(?:키로|kg)\s*(?:대|이상)/gi, ' ');
        s = s.replace(/(미삼|삼겹|암삼|암미삼|특삼|특미삼)\s*1[5-9]\s*(?:키로|kg)\s+(\d+)/gi, '$1 $2');
        s = s.replace(/\d+호점|1\+\+/g, ' ');

        s = s.replace(/한박스/g, '1박스').replace(/한박/g, '1박').replace(/반박스/g, '0.5박스');
        s = s.replace(/한판/g, '1판').replace(/한덩이/g, '1덩이').replace(/한덩어리/g, '1덩어리');
        s = s.replace(/두마리분/g, '2마리분').replace(/한마리분/g, '1마리분').replace(/한마리반/g, '1마리분');

        if (!MEAT_ANY_REGEX.test(s)) return;
        itemCount++;

        if (parenBoxOverride) {
            totalBoxes += parseInt(parenBoxOverride[1], 10);
            return;
        }

        const boxMatches = [...s.matchAll(/(\d+(?:\.\d+)?)\s*(?:박스|빡스|박|box|b)(?![a-zA-Z가-힣])/gi)];
        let sRem = s.replace(/\d+(?:\.\d+)?\s*(?:박스|빡스|박|box|b)(?![a-zA-Z가-힣])/gi, ' ');
        const looseMatches = [...sRem.matchAll(/(\d+(?:\.\d+)?)\s*(?:팩|펙|판|봉|봉지|덩이|덩어리|진공|벌|두|마리분|마리|피스|p|개)(?![a-zA-Z가-힣])/gi)];

        if (boxMatches.length > 0 || looseMatches.length > 0) {
            boxMatches.forEach(m => { totalBoxes += parseFloat(m[1]); });
            looseMatches.forEach(m => { totalLoose += parseFloat(m[1]); });
        } else {
            const kgMatches = [...sRem.matchAll(/(\d+(?:\.\d+)?)\s*(?:kg|키로|킬|k)(?![a-zA-Z가-힣])/gi)];
            if (kgMatches.length > 0) {
                totalLoose += kgMatches.length;
            } else {
                const bareNums = [...sRem.matchAll(/(?:^|[^\d.])(\d{1,2})(?!\d)/g)];
                if (bareNums.length > 0) {
                    totalBoxes += parseInt(bareNums[0][1], 10);
                }
            }
        }
    });

    return { boxes: totalBoxes, loose: totalLoose, items: itemCount };
}

function analyzeZoneAndRoute(clientName, addr, orderTextsCombined) {
    const nameAndAddr = `${clientName} ${addr}`;

    if (/포동셀프|셀프정육|착한정육|착한\s*산현/.test(clientName) || /택배|방문\s*예정|찾으러|갖으러\s*온데|가지러\s*오신|들리겠습니다/.test(orderTextsCombined)) {
        return {
            zoneCode: 'PICKUP',
            zoneName: '직접방문/택배',
            subArea: /택배/.test(orderTextsCombined + clientName) ? '택배발송' : '매장방문수령',
            stopOrder: 999,
            color: '#4b5563'
        };
    }

    if (/음성|충북|맹동|진천|청주/.test(nameAndAddr)) {
        return { zoneCode: 'V0', zoneName: '6권역(평택·음성)', subArea: '④ 충북 음성', stopOrder: 140, color: '#be123c' };
    }
    if (/평택|동삭/.test(nameAndAddr)) {
        return { zoneCode: 'V0', zoneName: '6권역(평택·음성)', subArea: '③ 평택 동삭', stopOrder: 130, color: '#be123c' };
    }
    if (/오산|외삼미|동탄|반송동|병점|진안/.test(nameAndAddr)) {
        return { zoneCode: 'V0', zoneName: '6권역(평택·음성)', subArea: '② 병점·동탄·오산', stopOrder: 120, color: '#be123c' };
    }
    if (/매송|비봉|태광|유포리|향남/.test(nameAndAddr)) {
        return { zoneCode: 'V0', zoneName: '6권역(평택·음성)', subArea: '① 화성 매송·비봉', stopOrder: 110, color: '#be123c' };
    }

    if (/동작|상도|성대/.test(nameAndAddr)) {
        return { zoneCode: 'V5', zoneName: '4권역(서울·광명)', subArea: '① 동작 상도(1순위)', stopOrder: 410, color: '#6d28d9' };
    }
    if (/관악|봉천|용산|효창|영등포|양평동|신풍푸줏간/.test(nameAndAddr)) {
        return { zoneCode: 'V5', zoneName: '4권역(서울·광명)', subArea: '② 관악·영등포', stopOrder: 420, color: '#6d28d9' };
    }
    if (/금천|가산|시흥동|시흥대로|가리봉|참새방앗간|소문난정육점|대박축산금천|현대축산/.test(nameAndAddr)) {
        return { zoneCode: 'V5', zoneName: '4권역(서울·광명)', subArea: '③ 금천 가산·시흥동', stopOrder: 430, color: '#6d28d9' };
    }
    if (/광명|철산|소하|하늘소광명|광명꿀|토종축산|안심한우|장군축산|대박마포/.test(nameAndAddr)) {
        return { zoneCode: 'V5', zoneName: '4권역(서울·광명)', subArea: '④ 광명(소하·철산·광명)', stopOrder: 440, color: '#6d28d9' };
    }
    if (/양천|신정동|대반전|강서|화곡|고양|덕양|일산|화정|원신산업|효자축산/.test(nameAndAddr)) {
        return { zoneCode: 'V5', zoneName: '4권역(서울·광명)', subArea: '⑤ 강서·양천·고양', stopOrder: 450, color: '#6d28d9' };
    }

    if (/남동구|서창|논현|별빛|한우세상|sk축산/i.test(nameAndAddr)) {
        return { zoneCode: 'V4', zoneName: '3권역(인천·부천)', subArea: '① 인천 서창·논현', stopOrder: 310, color: '#0369a1' };
    }
    if (/연수구|동춘|옥련|오복정육|미추홀|주안|에이스미트주안|인천\s*동구|화평동|횡성.*인천/.test(nameAndAddr)) {
        return { zoneCode: 'V4', zoneName: '3권역(인천·부천)', subArea: '② 연수·주안·동구', stopOrder: 320, color: '#0369a1' };
    }
    if (/부평|십정|일신|산곡|신박축산|막뚱이|형제정육점1호점/.test(nameAndAddr)) {
        return { zoneCode: 'V4', zoneName: '3권역(인천·부천)', subArea: '③ 인천 부평(일신·산곡)', stopOrder: 330, color: '#0369a1' };
    }
    if (/부천|원미|소사|오정|상동|심곡|역곡|원종|김치왕|하늘소역곡|원대성|맛있는한우/.test(nameAndAddr)) {
        return { zoneCode: 'V4', zoneName: '3권역(인천·부천)', subArea: '④ 부천(상동·역곡·원종)', stopOrder: 340, color: '#0369a1' };
    }

    if (/군포|산본|금정|도마교|부곡동|송정|고기바보부곡|고기바보송정|거시기|돌쇠구이/.test(nameAndAddr)) {
        return { zoneCode: 'V2', zoneName: '5권역(군포·수원·판교)', subArea: '① 군포(산본·송정·부곡)', stopOrder: 510, color: '#047857' };
    }
    if (/의왕|장안중앙|고기바보장안|안양|평촌/.test(nameAndAddr)) {
        return { zoneCode: 'V2', zoneName: '5권역(군포·수원·판교)', subArea: '② 의왕 장안·안양', stopOrder: 520, color: '#047857' };
    }
    if (/수원|장안구|율전|영화동|권선|영통|이의동|차이나|구들장|린이네.*본점/.test(nameAndAddr)) {
        return { zoneCode: 'V2', zoneName: '5권역(군포·수원·판교)', subArea: '③ 수원(율전·광교·영통)', stopOrder: 530, color: '#047857' };
    }
    if (/용인|기흥|공세동|동백|한돈미트|엔마트|주식회사정육점/.test(nameAndAddr)) {
        return { zoneCode: 'V2', zoneName: '5권역(군포·수원·판교)', subArea: '④ 용인 기흥·동백', stopOrder: 540, color: '#047857' };
    }
    if (/성남|분당|판교|삼평|대장동|중원|푸른목장|1등축산|아이비유통/.test(nameAndAddr)) {
        return { zoneCode: 'V2', zoneName: '5권역(군포·수원·판교)', subArea: '⑤ 성남 판교·분당', stopOrder: 550, color: '#047857' };
    }
    if (/광진|구의|아차산|정성마트|구리|프리미엄정육점|의정부|매일정육점/.test(nameAndAddr)) {
        return { zoneCode: 'V2', zoneName: '5권역(군포·수원·판교)', subArea: '⑥ 광진·구리·의정부', stopOrder: 560, color: '#047857' };
    }

    if (/시흥|하상|하중|장곡|능곡|포동|신천|은행동|은계|거모|정왕|배곧|목감|대부|얼음막걸리/.test(nameAndAddr)) {
        let sub = '② 시흥 신천·은계·포동';
        let seq = 220;
        if (/하상|하중|장곡|능곡|목감|인화|곱창연가|다연|여기식당|청정맛집|오늘은냉삼|국민생고기|얼음막걸리/.test(nameAndAddr)) {
            sub = '① 시흥 하상·하중·장곡'; seq = 210;
        } else if (/거모|정왕|배곧|좋은축산|오빠막창|덕이네|까만돼지|전라도|옥이네|찌그러진|장터국밥|두근반|이모네|천하제일/.test(nameAndAddr)) {
            sub = '③ 시흥 거모·정왕·배곧'; seq = 230;
        } else if (/대부/.test(nameAndAddr)) {
            sub = '④ 안산 대부도'; seq = 240;
        }
        return { zoneCode: 'V1', zoneName: '2권역(시흥·대부)', subArea: sub, stopOrder: seq, color: '#b45309' };
    }

    if (/안산|단원|상록|선부|신길|초지|고잔|와동|성포|월피|사동|이동|일동|본오|건건|반월|수암|새솔|구워랑|대패나라|갈비면옥/.test(nameAndAddr)) {
        let sub = '④ 안산 사동·이동·일동';
        let seq = 640;
        if (/선부|신길|삼부자|대패나라|갈비면옥|백봉|횡성본점|사동쌈엔쌈|쌈엔쌈|샛터|신길양평/.test(nameAndAddr)) {
            sub = '① 안산 선부·신길'; seq = 610;
        } else if (/초지|고잔|새솔|풍년|큐엔씨|농민.*고잔|구워랑/.test(nameAndAddr)) {
            sub = '② 안산 초지·고잔·새솔'; seq = 620;
        } else if (/와동|성포|월피|농민.*와동|스타마트|다온마트/.test(nameAndAddr)) {
            sub = '③ 안산 와동·성포·월피'; seq = 630;
        } else if (/본오|건건|반월|수암|본오농민|삼겹연구소|원산면옥|고기앤장어|으뜸장어|더갈비|상미.*반월|우리축산/.test(nameAndAddr)) {
            sub = '⑤ 안산 본오·건건·수암'; seq = 650;
        }
        return { zoneCode: 'V3', zoneName: '1권역(안산 단원·상록)', subArea: sub, stopOrder: seq, color: '#1d4ed8' };
    }

    return { zoneCode: 'V3', zoneName: '기타/미분류권역', subArea: '주소확인필요', stopOrder: 900, color: '#6b7280' };
}

function renderVehicleConfigInputs() {
    const grid = document.getElementById('vehicleConfigGrid');
    if (!grid) return;
    grid.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        const div = document.createElement('div');
        div.className = 'vehicle-config-item';
        div.innerHTML = `
            <span>🚚 ${i + 1}호차 기사/권역</span>
            <input type="text" value="${escapeHtml(vehicleNames[i])}" onchange="updateVehicleName(${i}, this.value)">
        `;
        grid.appendChild(div);
    }
}

function updateVehicleName(idx, newVal) {
    vehicleNames[idx] = newVal.trim() || `${idx + 1}호차`;
    localStorage.setItem('mf_vehicles', JSON.stringify(vehicleNames));
    recordLastUpdatedTime('차량 기사명 변경');
    renderDispatchPage();
}

/* 냉장창고 4곳 설정 렌더링 및 제어 */
function renderColdStorageInputs() {
    const grid = document.getElementById('coldStorageGrid');
    if (!grid) return;
    grid.innerHTML = '';

    coldStorages.forEach((cs, idx) => {
        let opts = `<option value="NONE" ${cs.assigned === 'NONE' ? 'selected' : ''}>경유안함</option>`;
        for (let v = 0; v < 6; v++) {
            const code = `V${v}`;
            opts += `<option value="${code}" ${cs.assigned === code ? 'selected' : ''}>${v + 1}호차</option>`;
        }
        const card = document.createElement('div');
        card.className = 'cs-slot-card';
        card.innerHTML = `
            <div class="cs-slot-top">
                <input type="text" value="${escapeHtml(cs.name)}" placeholder="냉장창고 ${idx + 1}" onchange="updateColdStorage(${idx}, 'name', this.value)" title="냉장창고 이름">
                <select onchange="updateColdStorage(${idx}, 'assigned', this.value)" title="경유할 차량 선택">
                    ${opts}
                </select>
            </div>
            <input type="text" class="cs-slot-addr" value="${escapeHtml(cs.addr)}" placeholder="주소 입력 (지도 표시용)" onchange="updateColdStorage(${idx}, 'addr', this.value)">
        `;
        grid.appendChild(card);
    });
}

function updateColdStorage(idx, field, val) {
    if (!coldStorages[idx]) return;
    coldStorages[idx][field] = val.trim();
    localStorage.setItem('mf_cold_storages', JSON.stringify(coldStorages));
    recordLastUpdatedTime('냉장창고 경유 설정 변경');
    renderDispatchPage();
}

function getAggregatedDeliveryDestinations() {
    const orders = getFilteredOrderList(true);
    const destMap = new Map();

    orders.forEach(ord => {
        const key = ord.clientName;
        if (!destMap.has(key)) {
            destMap.set(key, {
                clientName: key,
                officialName: ord.clientObj ? ord.clientObj.name : key,
                addr: ord.clientObj ? ord.clientObj.addr : '',
                phone: ord.clientObj ? ord.clientObj.phone : '',
                note: ord.clientObj ? ord.clientObj.note : '',
                totalBoxes: 0,
                totalLoose: 0,
                itemCount: 0,
                isUrgent: false,
                rawContents: []
            });
        }
        const entry = destMap.get(key);
        const cnt = countOrderBoxesLooseAndItems(ord.content);
        entry.totalBoxes += cnt.boxes;
        entry.totalLoose += cnt.loose;
        entry.itemCount += cnt.items;
        entry.rawContents.push(ord.content);
        if (/급|일찍|오전|10시|11시/.test(ord.content)) entry.isUrgent = true;
    });

    const destList = Array.from(destMap.values());
    destList.forEach(d => {
        const routeInfo = analyzeZoneAndRoute(d.clientName, d.addr, d.rawContents.join('\n'));
        d.zoneCode = routeInfo.zoneCode;
        d.zoneName = routeInfo.zoneName;
        d.subArea = routeInfo.subArea;
        d.stopOrder = routeInfo.stopOrder;
        d.zoneColor = routeInfo.color;

        const coords = getCoordsForClient(d.clientName, d.addr);
        d.lat = coords.lat;
        d.lng = coords.lng;
        d.isExactCoord = coords.exact;
        d.distKm = haversineKm(WAREHOUSE_ORIGIN.lat, WAREHOUSE_ORIGIN.lng, d.lat, d.lng);

        if (!dispatchMap[d.clientName]) {
            dispatchMap[d.clientName] = d.zoneCode;
        }
    });

    return destList;
}

function autoDispatchByZoneAndRoute(showAlert) {
    const destinations = getAggregatedDeliveryDestinations();
    destinations.forEach(d => {
        dispatchMap[d.clientName] = d.zoneCode;
    });
    localStorage.setItem('mf_dispatch', JSON.stringify(dispatchMap));
    recordLastUpdatedTime('권역·동선별 스마트 자동배차');
    renderDispatchPage();
    if (showAlert) {
        alert(`✅ 총 ${destinations.length}개 납품처가 6대 권역 및 최적 이동 동선 순서로 자동 배차되었습니다!`);
    }
}

function resetCurrentDispatch() {
    if (!confirm('현재 지정된 배차 내역을 모두 미배차 상태로 초기화할까요?')) return;
    const destinations = getAggregatedDeliveryDestinations();
    destinations.forEach(d => {
        dispatchMap[d.clientName] = 'UNASSIGNED';
    });
    localStorage.setItem('mf_dispatch', JSON.stringify(dispatchMap));
    renderDispatchPage();
}

function setDispatchSortMode(mode) {
    dispatchSortMode = mode;
    localStorage.setItem('mf_dispatch_sort', mode);
    renderDispatchPage();
}

function toggleAddressDrawer(drawerId, lat, lng, label) {
    const el = document.getElementById(drawerId);
    if (el) {
        el.classList.toggle('open');
    }
    if (vworldMapInstance && lat && lng) {
        vworldMapInstance.setView([lat, lng], 14);
    }
}

function renderDispatchPage() {
    const destinations = getAggregatedDeliveryDestinations();
    const driverGrid = document.getElementById('driverSixColGrid');
    const allDestGrid = document.getElementById('allDestSixGrid');
    const pickupBadge = document.getElementById('pickupSummaryBadge');
    const allCountInfo = document.getElementById('allDestCountInfo');
    if (!driverGrid || !allDestGrid) return;

    driverGrid.innerHTML = '';
    allDestGrid.innerHTML = '';

    // 1. 상단: 기사별 배차 거래처 목록 (6열 바둑판: 거래처 이름만 + 옆에 [📍주소] 버튼)
    const pickupList = destinations.filter(d => (dispatchMap[d.clientName] || 'UNASSIGNED') === 'PICKUP');
    const unassignedList = destinations.filter(d => (dispatchMap[d.clientName] || 'UNASSIGNED') === 'UNASSIGNED');
    if (pickupBadge) {
        pickupBadge.innerText = `📦 직접방문/택배: ${pickupList.length}곳 | ⚠️ 미배차: ${unassignedList.length}곳`;
    }

    for (let i = 0; i < 6; i++) {
        const vCode = `V${i}`;
        const vColor = VEHICLE_COLORS[i];

        // 해당 호차에 배정된 일반 거래처 (동선 순서 정렬)
        const vStops = destinations
            .filter(d => (dispatchMap[d.clientName] || 'UNASSIGNED') === vCode)
            .sort((a, b) => a.stopOrder - b.stopOrder || a.distKm - b.distKm);

        // 해당 호차에 배정된 냉장창고
        const vColdStorages = coldStorages.filter(cs => cs.assigned === vCode && cs.name.trim());

        const totBox = vStops.reduce((acc, x) => acc + x.totalBoxes, 0);
        const totLoose = vStops.reduce((acc, x) => acc + x.totalLoose, 0);

        let rowsHtml = '';
        let seq = 0;

        // 냉장창고 먼저/함께 표기
        vColdStorages.forEach((cs, cIdx) => {
            seq++;
            const csCoords = getCoordsForClient(cs.name, cs.addr);
            const drawerId = `drv_cs_${vCode}_${cIdx}`;
            rowsHtml += `
                <div class="driver-client-row is-cold">
                    <div class="driver-client-main">
                        <span class="driver-client-name">
                            <b style="color:#0e7490;">#${seq}</b> ❄️ ${escapeHtml(cs.name)}
                        </span>
                        <button type="button" class="addr-toggle-btn" onclick="toggleAddressDrawer('${drawerId}', ${csCoords.lat}, ${csCoords.lng}, '${escapeHtml(cs.name)}')">📍주소</button>
                    </div>
                    <div id="${drawerId}" class="addr-drawer">
                        📍 ${escapeHtml(cs.addr || '주소 미입력')}
                    </div>
                </div>
            `;
        });

        // 배차된 거래처 (거래처 이름만 + 옆에 [📍주소] 버튼)
        vStops.forEach((d, sIdx) => {
            seq++;
            const drawerId = `drv_st_${vCode}_${sIdx}`;
            const urgentMark = d.isUrgent ? `<span style="color:#dc2626; font-weight:bold;">⚡</span>` : '';
            rowsHtml += `
                <div class="driver-client-row" style="border-left-color:${vColor};">
                    <div class="driver-client-main">
                        <span class="driver-client-name">
                            <b style="color:${vColor};">#${seq}</b> ${urgentMark}${escapeHtml(d.clientName)}
                        </span>
                        <button type="button" class="addr-toggle-btn" onclick="toggleAddressDrawer('${drawerId}', ${d.lat}, ${d.lng}, '${escapeHtml(d.clientName)}')">📍주소</button>
                    </div>
                    <div id="${drawerId}" class="addr-drawer">
                        <div>📍 ${escapeHtml(d.addr || '주소 미등록 (clients.csv 로드 필요)')}</div>
                        ${d.phone ? `<div>📞 ${escapeHtml(d.phone)}</div>` : ''}
                        ${d.note ? `<div style="color:#b45309; font-weight:bold;">🔑 ${escapeHtml(d.note)}</div>` : ''}
                        <div style="color:#047857; font-weight:bold; margin-top:2px;">📦 ${d.totalBoxes}박 / 낱개 ${d.totalLoose} (${d.distKm.toFixed(1)}km)</div>
                    </div>
                </div>
            `;
        });

        if (seq === 0) {
            rowsHtml = `<div style="text-align:center; padding:14px 4px; color:#9ca3af; font-size:10.5px;">배차 없음</div>`;
        }

        const colCard = document.createElement('div');
        colCard.className = 'driver-col-card';
        colCard.innerHTML = `
            <div class="driver-col-head" style="background:${vColor};">
                <div class="driver-col-title" title="${escapeHtml(vehicleNames[i])}">${escapeHtml(vehicleNames[i])}</div>
                <div class="driver-col-stat">${vStops.length}곳${vColdStorages.length > 0 ? `+냉창${vColdStorages.length}` : ''} · 📦${totBox}박/낱${totLoose}</div>
            </div>
            <div class="driver-col-body">${rowsHtml}</div>
        `;
        driverGrid.appendChild(colCard);
    }

    // 2. 하단: 전체 배송처별 기사 배정 (6열 바둑판 + 3가지 정렬: 가나다순 / 시점부터 먼거리순 / 품목많은 순)
    const btnName = document.getElementById('btnSortName');
    const btnDist = document.getElementById('btnSortDist');
    const btnItems = document.getElementById('btnSortItems');
    if (btnName) btnName.classList.toggle('active', dispatchSortMode === 'name');
    if (btnDist) btnDist.classList.toggle('active', dispatchSortMode === 'distance');
    if (btnItems) btnItems.classList.toggle('active', dispatchSortMode === 'items');

    const sortedAll = [...destinations];
    if (dispatchSortMode === 'name') {
        sortedAll.sort((a, b) => a.clientName.localeCompare(b.clientName, 'ko'));
    } else if (dispatchSortMode === 'distance') {
        sortedAll.sort((a, b) => b.distKm - a.distKm || a.clientName.localeCompare(b.clientName, 'ko'));
    } else if (dispatchSortMode === 'items') {
        sortedAll.sort((a, b) => {
            const scoreA = a.itemCount * 100 + a.totalBoxes * 10 + a.totalLoose;
            const scoreB = b.itemCount * 100 + b.totalBoxes * 10 + b.totalLoose;
            return scoreB - scoreA || a.clientName.localeCompare(b.clientName, 'ko');
        });
    }

    if (allCountInfo) {
        allCountInfo.innerText = `(총 ${sortedAll.length}곳 · 1~6호차 버튼 클릭 즉시 배정)`;
    }

    if (sortedAll.length === 0) {
        allDestGrid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:20px; color:#888; background:#fff; border-radius:8px; border:1px solid var(--border);">조건에 해당하는 당일 배송처가 없습니다.</div>`;
    } else {
        sortedAll.forEach((d, idx) => {
            const curVal = dispatchMap[d.clientName] || 'UNASSIGNED';
            const drawerId = `all_dest_addr_${idx}`;
            let topColor = '#64748b';
            if (curVal.startsWith('V')) {
                const vIdx = parseInt(curVal.substring(1), 10);
                topColor = VEHICLE_COLORS[vIdx] || '#1f4e79';
            } else if (curVal === 'PICKUP') {
                topColor = '#374151';
            }

            let quickBtnsHtml = '';
            for (let v = 0; v < 6; v++) {
                const code = `V${v}`;
                const isAct = curVal === code ? 'active' : '';
                quickBtnsHtml += `<button type="button" class="qv-btn ${isAct}" onclick="assignVehicle('${escapeHtml(d.clientName)}', '${code}')" title="${escapeHtml(vehicleNames[v])}">${v + 1}</button>`;
            }
            quickBtnsHtml += `<button type="button" class="qv-btn pickup ${curVal === 'PICKUP' ? 'active' : ''}" onclick="assignVehicle('${escapeHtml(d.clientName)}', 'PICKUP')" title="직접방문/택배">방문</button>`;

            const card = document.createElement('div');
            card.className = 'dest-assign-card';
            card.style.borderTopColor = topColor;
            card.innerHTML = `
                <div class="dest-assign-top">
                    <span class="dest-assign-title">${escapeHtml(d.clientName)}</span>
                    <button type="button" class="addr-toggle-btn" onclick="toggleAddressDrawer('${drawerId}', ${d.lat}, ${d.lng}, '${escapeHtml(d.clientName)}')">📍주소</button>
                </div>
                <div class="dest-assign-meta">
                    <span>📏 <b>${d.distKm.toFixed(1)}km</b></span>
                    <span>📦<b>${d.totalBoxes}박</b>/낱<b>${d.totalLoose}</b> (${d.itemCount}품목)</span>
                </div>
                <div id="${drawerId}" class="addr-drawer">
                    <div>📍 ${escapeHtml(d.addr || '주소 미등록')}</div>
                    ${d.phone ? `<div>📞 ${escapeHtml(d.phone)}</div>` : ''}
                    ${d.note ? `<div style="color:#b45309; font-weight:bold;">🔑 ${escapeHtml(d.note)}</div>` : ''}
                </div>
                <div class="quick-v-btns">${quickBtnsHtml}</div>
            `;
            allDestGrid.appendChild(card);
        });
    }

    refreshVworldMapMarkers(destinations);
}

function assignVehicle(clientName, vCode) {
    dispatchMap[clientName] = vCode;
    localStorage.setItem('mf_dispatch', JSON.stringify(dispatchMap));
    recordLastUpdatedTime(`${clientName} 배차 지정`);
    renderDispatchPage();
}

function downloadDispatchCsv() {
    const destinations = getAggregatedDeliveryDestinations();
    let csv = "\uFEFF차량동선순번,배차차량,구분,납품거래처명,정식상호,거리(km),주소,연락처,출입비번/비고,박스수,낱개수\n";
    for (let i = 0; i < 6; i++) {
        const vCode = `V${i}`;
        const vLabel = vehicleNames[i];
        let seq = 0;
        coldStorages.filter(cs => cs.assigned === vCode && cs.name.trim()).forEach(cs => {
            seq++;
            csv += `"#${seq}","${vLabel}","냉장창고","${cs.name}","${cs.name}","","${cs.addr}","","",0,0\n`;
        });
        destinations
            .filter(d => (dispatchMap[d.clientName] || 'UNASSIGNED') === vCode)
            .sort((a, b) => a.stopOrder - b.stopOrder || a.distKm - b.distKm)
            .forEach(d => {
                seq++;
                csv += `"#${seq}","${vLabel}","일반거래처","${d.clientName}","${d.officialName}",${d.distKm.toFixed(1)},"${d.addr}","${d.phone}","${d.note}",${d.totalBoxes},${d.totalLoose}\n`;
            });
    }
    destinations.filter(d => (dispatchMap[d.clientName] || 'UNASSIGNED') === 'PICKUP').forEach((d, idx) => {
        csv += `"#방문${idx + 1}","직접방문/택배","방문/택배","${d.clientName}","${d.officialName}",${d.distKm.toFixed(1)},"${d.addr}","${d.phone}","${d.note}",${d.totalBoxes},${d.totalLoose}\n`;
    });
    downloadBlob(csv, "미트포앤_권역동선별_배차목록.csv");
}

/* =========================================================================
   10. VWorld WMTS 지도 & JSONP Geocoding 엔진
   ========================================================================= */
let vworldMapInstance = null;
let vworldBaseLayer = null;
let vworldSatLayer = null;
let vworldHybridLayer = null;
let osmFallbackLayer = null;
let mapLayerGroup = null;
let isSatelliteMode = false;
let isMapCollapsed = false;

function initVworldMap() {
    const mapEl = document.getElementById('vworldMapCanvas');
    if (!mapEl || typeof L === 'undefined') return;

    if (!vworldMapInstance) {
        vworldMapInstance = L.map('vworldMapCanvas', {
            center: [WAREHOUSE_ORIGIN.lat, WAREHOUSE_ORIGIN.lng],
            zoom: 11
        });

        vworldBaseLayer = L.tileLayer(
            `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Base/{z}/{y}/{x}.png`,
            { maxZoom: 19, attribution: '&copy; VWorld 국토교통부' }
        );
        vworldSatLayer = L.tileLayer(
            `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Satellite/{z}/{y}/{x}.jpeg`,
            { maxZoom: 19, attribution: '&copy; VWorld Satellite' }
        );
        vworldHybridLayer = L.tileLayer(
            `https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Hybrid/{z}/{y}/{x}.png`,
            { maxZoom: 19 }
        );
        osmFallbackLayer = L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            { maxZoom: 19, attribution: '&copy; OpenStreetMap' }
        );

        let vworldErrorCount = 0;
        vworldBaseLayer.on('tileerror', () => {
            vworldErrorCount++;
            if (vworldErrorCount >= 4 && !vworldMapInstance.hasLayer(osmFallbackLayer)) {
                vworldMapInstance.addLayer(osmFallbackLayer);
            }
        });

        vworldBaseLayer.addTo(vworldMapInstance);
        mapLayerGroup = L.layerGroup().addTo(vworldMapInstance);
    }

    setTimeout(() => {
        if (vworldMapInstance) {
            vworldMapInstance.invalidateSize();
            refreshVworldMapMarkers();
        }
    }, 150);
}

function toggleVworldSatellite() {
    if (!vworldMapInstance) initVworldMap();
    if (!vworldMapInstance) return;

    isSatelliteMode = !isSatelliteMode;
    const btn = document.getElementById('btnToggleSatMap');
    if (isSatelliteMode) {
        vworldMapInstance.removeLayer(vworldBaseLayer);
        vworldSatLayer.addTo(vworldMapInstance);
        vworldHybridLayer.addTo(vworldMapInstance);
        if (btn) btn.innerText = '🗺️ 일반지도 전환';
    } else {
        vworldMapInstance.removeLayer(vworldSatLayer);
        vworldMapInstance.removeLayer(vworldHybridLayer);
        vworldBaseLayer.addTo(vworldMapInstance);
        if (btn) btn.innerText = '🛰️ 위성지도 전환';
    }
}

function toggleMapCollapse() {
    const mapEl = document.getElementById('vworldMapCanvas');
    const btn = document.getElementById('btnToggleMapCollapse');
    if (!mapEl) return;

    isMapCollapsed = !isMapCollapsed;
    mapEl.classList.toggle('collapsed', isMapCollapsed);
    if (btn) btn.innerText = isMapCollapsed ? '🔼 지도 펼치기' : '🔽 지도 접기';
    if (!isMapCollapsed && vworldMapInstance) {
        setTimeout(() => vworldMapInstance.invalidateSize(), 150);
    }
}

function refreshVworldMapMarkers(precomputedDests) {
    if (!vworldMapInstance || !mapLayerGroup) return;
    mapLayerGroup.clearLayers();

    const destinations = precomputedDests || getAggregatedDeliveryDestinations();
    const filterVal = (document.getElementById('mapVehicleFilter') || {}).value || 'ALL';

    // 출발 거점 마커
    const originIcon = L.divIcon({
        className: '',
        html: `<div style="background:#111827; color:#fde68a; border:2px solid #fff; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:bold; box-shadow:0 2px 6px rgba(0,0,0,0.4);">🏭</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
    });
    L.marker([WAREHOUSE_ORIGIN.lat, WAREHOUSE_ORIGIN.lng], { icon: originIcon })
        .bindPopup(`<b>${WAREHOUSE_ORIGIN.name}</b>`)
        .addTo(mapLayerGroup);

    const bounds = [[WAREHOUSE_ORIGIN.lat, WAREHOUSE_ORIGIN.lng]];

    for (let i = 0; i < 6; i++) {
        const vCode = `V${i}`;
        if (filterVal !== 'ALL' && filterVal !== vCode) continue;

        const vColor = VEHICLE_COLORS[i];
        const routePts = [[WAREHOUSE_ORIGIN.lat, WAREHOUSE_ORIGIN.lng]];
        let seq = 0;

        // 냉장창고 핀
        coldStorages.filter(cs => cs.assigned === vCode && cs.name.trim()).forEach(cs => {
            seq++;
            const cPos = getCoordsForClient(cs.name, cs.addr);
            routePts.push([cPos.lat, cPos.lng]);
            bounds.push([cPos.lat, cPos.lng]);

            const csIcon = L.divIcon({
                className: '',
                html: `<div style="background:#0891b2; color:#fff; border:2px solid #fff; border-radius:6px; padding:1px 5px; font-size:10px; font-weight:bold; white-space:nowrap; box-shadow:0 2px 5px rgba(0,0,0,0.35);">❄️${i + 1}-${seq} ${escapeHtml(cs.name)}</div>`,
                iconAnchor: [20, 12]
            });
            L.marker([cPos.lat, cPos.lng], { icon: csIcon })
                .bindPopup(`<b>[${i + 1}호차 #${seq} 경유] ❄️ ${escapeHtml(cs.name)}</b><br>${escapeHtml(cs.addr || '')}`)
                .addTo(mapLayerGroup);
        });

        // 일반 거래처 핀
        const vStops = destinations
            .filter(d => (dispatchMap[d.clientName] || 'UNASSIGNED') === vCode)
            .sort((a, b) => a.stopOrder - b.stopOrder || a.distKm - b.distKm);

        vStops.forEach(d => {
            seq++;
            routePts.push([d.lat, d.lng]);
            bounds.push([d.lat, d.lng]);

            const pinIcon = L.divIcon({
                className: '',
                html: `<div style="background:${vColor}; color:#fff; border:2px solid #fff; border-radius:12px; padding:1px 6px; font-size:10.5px; font-weight:bold; white-space:nowrap; box-shadow:0 2px 5px rgba(0,0,0,0.35);">${i + 1}-${seq} ${escapeHtml(d.clientName)}</div>`,
                iconAnchor: [22, 12]
            });
            L.marker([d.lat, d.lng], { icon: pinIcon })
                .bindPopup(`<b>[${escapeHtml(vehicleNames[i])} #${seq}] ${escapeHtml(d.clientName)}</b><br>📍 ${escapeHtml(d.addr || '주소 미등록')}<br>📦 ${d.totalBoxes}박 / 낱개 ${d.totalLoose} (${d.distKm.toFixed(1)}km)`)
                .addTo(mapLayerGroup);
        });

        if (routePts.length > 1) {
            L.polyline(routePts, { color: vColor, weight: 3, opacity: 0.75, dashArray: '6, 4' }).addTo(mapLayerGroup);
        }
    }

    if (bounds.length > 1) {
        vworldMapInstance.fitBounds(bounds, { padding: [28, 28], maxZoom: 13 });
    }
}

function geocodeSingleAddressJsonp(address, type) {
    return new Promise((resolve) => {
        const cbName = 'vworld_cb_' + Math.random().toString(36).substring(2, 10);
        const script = document.createElement('script');
        const timer = setTimeout(() => {
            delete window[cbName];
            if (script.parentNode) script.parentNode.removeChild(script);
            resolve(null);
        }, 5000);

        window[cbName] = function(data) {
            clearTimeout(timer);
            delete window[cbName];
            if (script.parentNode) script.parentNode.removeChild(script);
            try {
                if (data && data.response && data.response.status === 'OK') {
                    const pt = data.response.result.point;
                    resolve({ lat: parseFloat(pt.y), lng: parseFloat(pt.x) });
                    return;
                }
            } catch (e) {}
            resolve(null);
        };

        const cleanAddr = address.split(',')[0].split('(')[0].trim();
        script.src = `https://api.vworld.kr/req/address?service=address&request=getcoord&version=2.0&crs=epsg:4326&address=${encodeURIComponent(cleanAddr)}&refine=true&simple=false&format=json&type=${type}&key=${VWORLD_API_KEY}&callback=${cbName}`;
        document.body.appendChild(script);
    });
}

async function geocodeMissingDestinations() {
    const statusEl = document.getElementById('mapGeoStatus');
    const destinations = getAggregatedDeliveryDestinations();
    const targets = destinations.filter(d => d.addr && !geoCache[d.addr.trim()]);

    if (targets.length === 0) {
        if (statusEl) statusEl.innerText = '✅ 모든 등록 주소가 좌표 변환 완료되었습니다!';
        refreshVworldMapMarkers(destinations);
        return;
    }

    let converted = 0;
    for (let i = 0; i < targets.length; i++) {
        const d = targets[i];
        if (statusEl) statusEl.innerText = `⏳ VWorld 좌표 변환 중... (${i + 1}/${targets.length}) ${d.clientName}`;
        let pt = await geocodeSingleAddressJsonp(d.addr, 'ROAD');
        if (!pt) pt = await geocodeSingleAddressJsonp(d.addr, 'PARCEL');
        if (pt) {
            geoCache[d.addr.trim()] = pt;
            converted++;
        }
    }

    localStorage.setItem('mf_geo_cache', JSON.stringify(geoCache));
    if (statusEl) statusEl.innerText = `✅ VWorld 좌표 변환 완료 (${converted}건 신규 반영)`;
    renderDispatchPage();
}

/* 유틸리티 및 CSV 다운로드 */
function escapeHtml(str) {
    return String(str || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function downloadBlob(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

function downloadOrdersCsv() {
    const list = getFilteredOrderList(false);
    let csv = "\uFEFF작성날짜,작성시간,납품기준일,판별사유,거래처,발신자,판별구분,발주내용\n";
    list.forEach(o => {
        const clean = o.content.replace(/"/g, '""').replace(/\n/g, ' ');
        csv += `"${o.dateShort}","${o.timeStr}","${o.delivShort||''}","${o.delivReason||''}","${o.clientName}","${formatSenderShortName(o.sender)}","${o.type}","${clean}"\n`;
    });
    downloadBlob(csv, "미트포앤_추출발주목록.csv");
}

function downloadStockCsv() {
    let csv = "\uFEFF품목명,대산(박스),대산(상세),포크(박스),포크(상세),기타(박스),기타(상세),총합계(박스)\n";
    stockItems.forEach(item => {
        const d = item.brands['대산'], p = item.brands['포크'], o = item.brands['기타'];
        const tot = d.boxes + p.boxes + o.boxes;
        csv += `"${item.name}",${d.boxes},"${d.details.join(' / ')}",${p.boxes},"${p.details.join(' / ')}",${o.boxes},"${o.details.join(' / ')}",${tot}\n`;
    });
    downloadBlob(csv, "미트포앤_일일재고현황표.csv");
}

/* 전역 함수 명시적 바인딩 */
window.switchTab = switchTab;
window.setUiMode = setUiMode;
window.setUiZoom = setUiZoom;
window.onFilterCriteriaChange = onFilterCriteriaChange;
window.toggleOnlyOrder = toggleOnlyOrder;
window.toggleKnownClient = toggleKnownClient;
window.toggleItemDeliveryDate = toggleItemDeliveryDate;
window.loadKakaoFiles = loadKakaoFiles;
window.parseAndApplyStock = parseAndApplyStock;
window.loadCsvFromGithub = loadCsvFromGithub;
window.loadClientCsvFile = loadClientCsvFile;
window.exportCleanedClientsCsv = exportCleanedClientsCsv;
window.clearSavedBrowserData = clearSavedBrowserData;
window.downloadOrdersCsv = downloadOrdersCsv;
window.downloadStockCsv = downloadStockCsv;
window.copyKakaoOrderCheckText = copyKakaoOrderCheckText;
window.downloadOrderSummaryCsv = downloadOrderSummaryCsv;
window.setLooseTypeFilter = setLooseTypeFilter;
window.setLooseGroupMode = setLooseGroupMode;
window.toggleLooseEntryDone = toggleLooseEntryDone;
window.clearLooseChecks = clearLooseChecks;
window.copyKakaoLooseListText = copyKakaoLooseListText;
window.downloadLooseCsv = downloadLooseCsv;
window.downloadDiffCsv = downloadDiffCsv;
window.updateVehicleName = updateVehicleName;
window.updateColdStorage = updateColdStorage;
window.autoDispatchByZoneAndRoute = autoDispatchByZoneAndRoute;
window.resetCurrentDispatch = resetCurrentDispatch;
window.setDispatchSortMode = setDispatchSortMode;
window.toggleAddressDrawer = toggleAddressDrawer;
window.assignVehicle = assignVehicle;
window.downloadDispatchCsv = downloadDispatchCsv;
window.initVworldMap = initVworldMap;
window.toggleVworldSatellite = toggleVworldSatellite;
window.toggleMapCollapse = toggleMapCollapse;
window.refreshVworldMapMarkers = refreshVworldMapMarkers;
window.geocodeMissingDestinations = geocodeMissingDestinations;
