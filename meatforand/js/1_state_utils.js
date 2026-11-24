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
        const clean = (o.displayContent || o.content).replace(/"/g, '""').replace(/\n/g, ' ');
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



/* 전역 바인딩 (1_state_utils.js) */
window.setUiMode = setUiMode;
window.setUiZoom = setUiZoom;
window.toggleOnlyOrder = toggleOnlyOrder;
window.toggleKnownClient = toggleKnownClient;
window.clearSavedBrowserData = clearSavedBrowserData;
window.downloadOrdersCsv = downloadOrdersCsv;
window.downloadStockCsv = downloadStockCsv;
