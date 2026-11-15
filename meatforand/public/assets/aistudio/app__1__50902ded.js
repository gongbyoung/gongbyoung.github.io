/* =========================================================================
   1. 내장 거래처 DB (전체거래처목록_20261111.csv + 카톡 출입비번 통합)
   ========================================================================= */
const DEFAULT_CLIENTS = [{"name": "(주)태광푸드", "ceo": "박경은", "phone": "031-292-5272", "addr": "경기도 화성시 매송면 송라길39번길23,1동(송라리) 607-3", "alias": ["태광"], "note": "*이사 현재연 010-6512-5252"}, {"name": "(주)한마음마트(일동)=>정육으로", "ceo": "장병준", "phone": "031-406-5257", "addr": "경기도 안산시 상록구 일동로20 (일동120-3)", "alias": ["한마음마트", "한마음"], "note": "25.10.16 법인대표자변경 임지영->장병준"}, {"name": "주식회사 농민(본오)", "ceo": "", "phone": "010-2499-0159", "addr": "경기도 안산시 상록구 선암로 44, 1층2층(본오동)", "alias": ["본오농민마트", "본오농민"], "note": ""}, {"name": "전라도연탄구이", "ceo": "김세민", "phone": "010-7510-5700", "addr": "경기도 시흥시 서촌상가2길 29,1층 110호(정왕동 명동프라자)", "alias": ["전라도연탄구이", "전라도"], "note": "비번: 2200"}, {"name": "농민마트와동(주)중지", "ceo": "박호자", "phone": "031-402-3838", "addr": "경기도 안산시 단원구 와동공원로162,1층2층,와동공원로164 1층(와동)", "alias": ["농민마트와동", "와동"], "note": "임택근팀장님010-7255-2476"}, {"name": "성대지마트(주)", "ceo": "이병창", "phone": "010-5544-6498", "addr": "서울 동작구 상도로 102(상도동)", "alias": ["성대g마트", "성대G마트", "성대g", "성대"], "note": "전홍숙과장님010-2071-2489"}, {"name": "출고안됨(주)스타마트", "ceo": "우병락", "phone": "031-405-7496", "addr": "경기 안산시 상록구 화랑로 513(성포동, 예술인아파트상가지하38호)", "alias": ["스타마트", "스타"], "note": ""}, {"name": "서창별빛정육점", "ceo": "김희창", "phone": "010-8259-3549", "addr": "인천시 남동구 서창남로 45,1층 105호(서창동,로데오프라자)", "alias": ["별빛정육점", "별빛"], "note": "별빛 지선미 폐업후 인수함"}, {"name": "횡성생고기(본점)", "ceo": "이동일", "phone": "031-492-9289", "addr": "경기 안산시 단원구 신길동 1660", "alias": ["횡성본점", "횡성생고기", "횡성본정ㅅ"], "note": ""}, {"name": "횡성생고기(인천점)", "ceo": "김기란", "phone": "010-8738-2519", "addr": "인천 동구 송화로20번길 11 (화평동,1층)", "alias": ["횡성생고기 인천점", "횡성인천점", "횡성 인천"], "note": ""}, {"name": "청정맛집(하중동)", "ceo": "기창임", "phone": "031-435-3130", "addr": "경기도 시흥시 연성로29번길12(하중동)", "alias": ["청정맛집", "청정"], "note": "010-9238-4867 청정사장님"}, {"name": "덕이네쌈밥", "ceo": "김순덕", "phone": "010-7739-1758", "addr": "경기도 시흥시 군자로477번길5,1층 일부호(거모동)", "alias": ["덕이네쌈밥", "덕이네"], "note": ""}, {"name": "농민마트 고잔점", "ceo": "김도경", "phone": "031-487-7343~5", "addr": "경기도 안산시 단원구 광덕4로88, 106호 외55개(고잔동)", "alias": ["농민마트고잔", "농민 고잔", "고잔"], "note": ""}, {"name": "(주)원신산업-보미마트", "ceo": "박준호", "phone": "031-966-4322", "addr": "경기도 고양시 덕양구 백양로 107-1,1층(화정동)", "alias": ["원신산업", "원신"], "note": "김용규사장님 010-2338-9293"}, {"name": "꿀돼지꿀한우(가리봉)", "ceo": "김인룡", "phone": "010-9441-9220", "addr": "서울 금천구 가산로 106,상가동 1층104호(가산동,주상복합두산아파트)", "alias": ["가리봉꿀돼지꿀한우", "가리봉꿀"], "note": "**조은축산철산점소개"}, {"name": "(주)다온마트(10/1부터)", "ceo": "장병준", "phone": "031-402-1905", "addr": "경기도 안산시 상록구 시낭로 25 (월피동)", "alias": ["다온마트", "다온"], "note": "다온마트 사업자 개인에서 법인으로변경.26.10.1~"}, {"name": "쌈&쌈(신길점)", "ceo": "문희", "phone": "031-493-3234", "addr": "경기 안산시 단원구 신길동 1641 1층", "alias": ["사동쌈엔쌈", "쌈엔쌈", "쌈쌈", "쌈&쌈"], "note": ""}, {"name": "풍년돼지양념구이(상미네곱창집)", "ceo": "김순화", "phone": "010-4124-6610", "addr": "경기도 안산시 단원구 화랑로 160, 상가동 125,126호(초지동,초지역 메이", "alias": ["풍년돼지양념구이", "풍년"], "note": "간판에는 상미네곱창으로 되어있음 | 비번: 8846* (홀에 보관)"}, {"name": "에스에이치미트(음성)", "ceo": "김세영", "phone": "", "addr": "충북 음성군 음성읍 시장로50번길5", "alias": ["에스에이치마트 음성", "음성엘마트", "음성"], "note": "에스에이치유통(광장)과 같은업체"}, {"name": "원대성정육점", "ceo": "송이한", "phone": "010-7934-9050", "addr": "경기도 부천시 오정구 성오로124번길47(원종동,49호)", "alias": ["원대성정육점", "원대성"], "note": "채명선"}, {"name": "고기바보푸주간(부곡)", "ceo": "최미란", "phone": "010-3221-5314", "addr": "경기도 군포시 송부로291번길 16,1층 103호(부곡동)", "alias": ["고기바보부곡", "부곡 고기바보", "부곡점 고기바보"], "note": "*고기바보 일반과세자로 변경 2019.7월부터"}, {"name": "고기바보푸줏간(장안점)", "ceo": "장해원", "phone": "010-3221-5314", "addr": "경기도 의왕시 장안중앙로7, 101.102호(삼동)", "alias": ["고기바보장안", "장안점"], "note": ""}, {"name": "고기바보(송정점)", "ceo": "최용인", "phone": "", "addr": "경기도 군포시 송부로34번길 35,101호일부,102호,103호일부호(도마교동)", "alias": ["고기바보송정", "송정점"], "note": "고기바보정육점(송정점)식당-20년 5.6월계산서발행"}, {"name": "꿀돼지꿀한우(금천)", "ceo": "정미혜", "phone": "010-9441-9220", "addr": "서울 금천구 금하로697 101호(시흥동)", "alias": ["금천꿀돼지꿀한우", "금천꿀", "꿀돼지시흥점"], "note": ""}, {"name": "꿀돼지꿀한우정육점(광명)", "ceo": "황지연", "phone": "010-3599-0509", "addr": "경기도 광명시 광명로 848번길 32-2,1층 103호(광명동,펠리스필)", "alias": ["광명꿀", "광꿀"], "note": "윤상웅 사장님(삼대축산)"}, {"name": "동탄식자재마트", "ceo": "박지휘", "phone": "031-8003-7152", "addr": "경기도 오산시 외삼미로 162-54(외삼미동)", "alias": ["동탄식자재마트", "동탄식자재"], "note": ""}, {"name": "정성마트정육코너(아차산)", "ceo": "김세영", "phone": "010-7225-9472", "addr": "서울특별시 광진구 천호대로661,지하1층(구의동,정성빌딩)", "alias": ["정성마트", "아차산점발주입니다"], "note": "팀장 010-6621-5697 (26.1.2)"}, {"name": "한결축산", "ceo": "김재상", "phone": "010-8577-1211", "addr": "경기도 시흥시 은계남로 12,상가동 1층147호(은행동,시흥은계 호반써밋플레", "alias": ["한결축산"], "note": ""}, {"name": "한돈미트(N마트)기흥", "ceo": "이종남", "phone": "010-5243-0200", "addr": "경기도 용인시 기흥구 공세로 236(공세동)", "alias": ["한돈미트", "주식회사 엔마트용인점", "엔마트"], "note": ""}, {"name": "삼사오", "ceo": "윤대기", "phone": "010-2113-3455", "addr": "경기 안산시 상록구 이동 공원로 53(이동,1층)", "alias": ["삼사오"], "note": "비번: 3679*"}, {"name": "에스농축수산마트(율전)", "ceo": "김아름", "phone": "010-7758-7865", "addr": "경기도 수원시 장안구 덕영대로425번길 58-2(율전동)", "alias": ["에스농축산마트 율전", "율전동에스할인마트입니다", "s율전", "율전"], "note": "에스농축산 (율전)7월부터 사업자 변경"}, {"name": "주식회사에스할인마트(지점)평택", "ceo": "김아름", "phone": "010-7758-7865", "addr": "경기도 평택시 모산영신2길34,1동1층101호 스타주차타워(동삭동)", "alias": ["에스할인마트 평택", "에스할인마트 (평택)", "s평택", "에스평택"], "note": "전대성팀장님"}, {"name": "신박축산", "ceo": "박지훈", "phone": "010-9137-0397", "addr": "인천시 부평구 십정동 486-15 1층일부(3호)", "alias": ["신박축산"], "note": "22.11.11사장님코드변경"}, {"name": "천하제일정육점(배곧동)", "ceo": "송연교", "phone": "010-8991-2135", "addr": "경기도 시흥시 서울대학로278번길 19-13,108동 제비-103호(배곧동)", "alias": ["천하제일정육점", "천하제일"], "note": "에스율전 소개"}, {"name": "오늘은고기다(일동)", "ceo": "김인숙", "phone": "010-9646-0913", "addr": "경기도 안산시 상록구 도매시장로93,1층 102호(일동)", "alias": ["오늘은고기다"], "note": "010-9646-0913 김동우사장님 (아내분명의)"}, {"name": "참새방앗간", "ceo": "LI LONGZE(이용택)", "phone": "", "addr": "서울 금천구 범안로 1138, 108호(가산동,고려테크온)", "alias": ["참새방앗간"], "note": ""}, {"name": "막뚱이정육점", "ceo": "전성현", "phone": "010-8486-0063", "addr": "인천시 부평구 마장로220번길 13, 106동(상가동)113호(산곡동,한신휴아파트", "alias": ["막뚱이정육점"], "note": "2026.3.3 김태호팀장으로"}, {"name": "삼겹연구소", "ceo": "정수길", "phone": "010-5820-9348", "addr": "경기도 안산시 상록구 본오로79,1층 (본오동)", "alias": ["삼겹연구소"], "note": "현관비번: 7788#"}, {"name": "하늘소(광명점)", "ceo": "박주하", "phone": "010-7624-7611", "addr": "경기도 광명시 오리로964번길 23-1(광명동)", "alias": ["하늘소광명", "하늘소 광명"], "note": ""}, {"name": "하늘소(화곡)", "ceo": "설민아", "phone": "010-3200-0342", "addr": "서울특별시 강서구 강서로18길 8-10 1층,103호104호(화곡동)", "alias": ["하늘소화곡", "하늘소 화곡"], "note": "11/3사업자변경"}, {"name": "하늘소(역곡점)", "ceo": "오종극", "phone": "010-7624-7611", "addr": "경기도 부천시 역곡로26번길 25,1층 101호(역곡동,대화빌딩)", "alias": ["하늘소역곡", "역곡하늘소"], "note": "주차장비번: 닫힘누르고 1856#"}, {"name": "상미왕할인마트(식자재)산본", "ceo": "김샛별", "phone": "010-2504-5691", "addr": "경기도 군포시 금산로 9,지층 101-1호,101-2호(금정동)", "alias": ["상미마트", "상미마트 산본", "상미마트(군포)"], "note": "에스평택 지인 26.10.14"}, {"name": "상미왕할인마트(반월점)", "ceo": "강승복", "phone": "", "addr": "경기도 안산시 상록구 건건8길 2,지층 비101호(건건동,건건e-편한세상 주상", "alias": ["상미마트(반월점)"], "note": ""}, {"name": "참예소(포동)", "ceo": "이영", "phone": "010-5778-8766", "addr": "경기도 시흥시 신현로 38번길 23-1. 13동 101호(포동,태산아파트상가)", "alias": ["참예소"], "note": ""}, {"name": "일신할인마트(정육점)", "ceo": "최경길", "phone": "032-528-7048", "addr": "인천광역시 부평구 경인로 1104번길 13-14 1층(일신동,대한빌딩)", "alias": ["일신할인마트"], "note": ""}, {"name": "한우세상(폐업)", "ceo": "이대일", "phone": "010-9167-1895", "addr": "인천시 남동구 장아산로158, 제상가동1층 103호(서창동,임광그대가아파트)", "alias": ["한우세상"], "note": ""}, {"name": "양평해장국(폐업)", "ceo": "이태수", "phone": "010-2987-2704", "addr": "경기도 안산시 단원구 신길로9-3, 109호(신길동)", "alias": ["신길양평해장국"], "note": ""}, {"name": "한양축산도매센타(봉천동)", "ceo": "서차석", "phone": "010-4149-8120", "addr": "서울 관악구 봉천동 66-163", "alias": ["한양봉천", "한양 봉천"], "note": "새주소-봉천7동 1619-1 고기굽는사람들 | 비번: 6884*"}, {"name": "대부지마트(주)", "ceo": "이명훈", "phone": "032-891-2255", "addr": "경기도 안산시 단원구 대부황금로 1295(대부북동)", "alias": ["대부g마트", "대부지마트"], "note": ""}, {"name": "충북G마트", "ceo": "", "phone": "", "addr": "", "alias": ["충북g마트", "충북지"], "note": ""}, {"name": "유포리바베큐장", "ceo": "윤선미", "phone": "010-5858-0989", "addr": "경기도 화성시 비봉면 유포길10-29", "alias": ["유포리바베큐장", "유포리"], "note": "오세범대표님  비밀번호 5858# | 비번: 8585#"}, {"name": "SK축산물도소매", "ceo": "유영미", "phone": "032-446-5800", "addr": "인천시 남동구 논고개로118,104(논현동,양진타워)", "alias": ["sk축산", "SK축산"], "note": "사장은 성종윤이오나 사업자는 유영미로 되있음"}, {"name": "오소돈", "ceo": "김현순", "phone": "010-2734-3913", "addr": "경기도 안산시 상록구 댕이길 80,1층(사동)", "alias": ["오소돈"], "note": "사모님 010-2734-3913 | 비번: 종 누르고 1348"}, {"name": "소문난정육점", "ceo": "오승진", "phone": "010-2050-9579", "addr": "서울특별시 금천구 시흥대로 143, 1층108호(시흥동, 신라상가)", "alias": ["소문난정육점"], "note": "**구)신풍"}, {"name": "진안축산", "ceo": "신정숙", "phone": "010-7501-0114", "addr": "경기도 화성시 병점중앙로195, 진안식자재마트 내정육코너(진안동)", "alias": ["진안축산"], "note": ""}, {"name": "삼대축산정육점양평점", "ceo": "윤상웅", "phone": "010-3599-0509", "addr": "서울 영등포구 영등포로33,1층 104호(양평동2가,목동비즈타워)", "alias": ["삼대축산"], "note": "광명꿀사장 가게"}, {"name": "(주)큐엔씨육가공", "ceo": "유임묵", "phone": "010-8582-4018", "addr": "경기도 안산시 단원구 초지2로 59-18(초지동)", "alias": ["큐엔씨육가공"], "note": "**한샘마트"}, {"name": "에이스미트", "ceo": "전윤표", "phone": "031-223-0063", "addr": "경기 수원시 권선구 곡반정동 587-1", "alias": ["에이스미트주안", "에이스미트 주안"], "note": ""}, {"name": "형제정육점1호점", "ceo": "", "phone": "", "addr": "", "alias": ["형제정육점1호점"], "note": ""}, {"name": "더갈비(폐업)", "ceo": "김동열", "phone": "010-2002-8509", "addr": "경기도 안산시 상록구 건건로 66, 111호,112호(건건동,스마트타워)", "alias": ["더갈비"], "note": "비번: 1234*"}, {"name": "삼부자돌판골", "ceo": "", "phone": "010-8665-0131", "addr": "경기도 안산시 단원구 선부광장1로 30, 203,204호(선부동)", "alias": ["삼부자돈판골"], "note": ""}, {"name": "원산면옥", "ceo": "한원석", "phone": "010-5395-8590", "addr": "경기도 안산시 상록구 본오로70, 1층(본오동)", "alias": ["원산면옥"], "note": ""}, {"name": "푸른목장(삼평동)", "ceo": "최지나", "phone": "010-6742-1179", "addr": "경기도 성남시 분당구 판교로 376,1층 105호(삼평동,마크시티 퍼플)", "alias": ["푸른목장 삼평점", "푸른목장삼평"], "note": "서경진 대표님 삼평점"}, {"name": "푸른목장(판교)", "ceo": "서경진", "phone": "010-6742-1179", "addr": "경기도 성남시 분당구 운중로 242, 1층 110호(판교동,리버스토리)", "alias": ["푸른목장 판교점", "푸른목장판교", "푸른목장 판교"], "note": ""}, {"name": "(주)판교1등축산(구-푸른 대장동", "ceo": "서경진", "phone": "", "addr": "경기도 성남시 분당구 판교대장로6길 10, 108호(대장동)", "alias": ["판교1등축산", "1등판교"], "note": "푸른목장(대장동)사업자변경 2026. 6.23."}, {"name": "(주)좋은축산유통", "ceo": "지창용", "phone": "031-431-5717", "addr": "경기도 시흥시 군자로 387번길 21-1(거모동)", "alias": ["좋은축산유통"], "note": ""}, {"name": "다연홈마트", "ceo": "안형빈", "phone": "010-5252-4148", "addr": "경기도 시흥시 하중로128(하중동)", "alias": ["다연"], "note": "*"}, {"name": "소하축산(광명)", "ceo": "석원찬", "phone": "010-5659-5077", "addr": "경기도 광명시 소하로82,108호(소하동,한빛프라자)", "alias": ["소하축산광명", "소하축산 광명"], "note": ""}, {"name": "토종축산(광명철산동)", "ceo": "강준서", "phone": "010-7496-3735", "addr": "경기도 광명시 시청로 50, A동 1층 125호(철산동, 롯데캐슬&뷰상가)", "alias": ["토종축산"], "note": ""}, {"name": "린이네축산동탄점(구미래)", "ceo": "김세중", "phone": "010-9622-6896", "addr": "경기도 화성시 동탄중심상가1길 28,1층 미래마켓내정육코너(반송동)", "alias": ["린이네축산 동탄", "린이네축산(동탄)"], "note": "구)미래마켓동탄점"}, {"name": "린이네축산(본점-영통)", "ceo": "김세중", "phone": "010-9622-6896", "addr": "경기도 수원시 영통구 봉영로1770번길 21,상가동 지층 1호(영통동,신명.한", "alias": ["린이네축산 본점", "린이네본점", "린이네축산 (본점)"], "note": "240111 상호변경"}, {"name": "골목대장삼겹살", "ceo": "황규승", "phone": "010-8337-8416", "addr": "경기도 시흥시 시흥대로 1073번길 29,1층(신천동)", "alias": ["골목대장"], "note": "비번: 1379* (닫을때 #)"}, {"name": "김치왕뚜껑삼겹살", "ceo": "WHENG HAILN", "phone": "010-8033-9827", "addr": "경기도 부천시 역곡로 37(역곡동)", "alias": ["김치왕뚜껑삼겹살1호점", "김치왕뚜껑삼겹살 2호점", "김치왕뚜껑삼겹살3호점"], "note": "흥화맛집아시는분 | 현관: 4321 / 천막: 12349"}, {"name": "신풍푸줏간(신길점)", "ceo": "고현우", "phone": "010-5021-3804", "addr": "서울시 영등포구 신풍로 77.상가동 b105호(신길동, 래미안에스티움)", "alias": ["신풍푸줏간", "신풍푸줏간 신길"], "note": ""}, {"name": "거시기 함흥냉면", "ceo": "이종아", "phone": "010-7209-5969", "addr": "경기도 군포시 삼성로20번길 16-12, 1층(부곡동)", "alias": ["거시기함흥냉면", "거시기"], "note": ""}, {"name": "전설갈비은행점", "ceo": "", "phone": "010-5251-8777", "addr": "경기도 시흥시 대은로 16-4, 1층(은행동)", "alias": ["전설은행"], "note": ""}, {"name": "옥이네주물럭", "ceo": "김선옥", "phone": "010-2753-8063", "addr": "경기도 시흥시 함송로13번길 6-7, 101,102호(정왕동)", "alias": ["옥이네주물럭"], "note": ""}, {"name": "예서감자탕", "ceo": "이민숙", "phone": "010-5909-5815", "addr": "경기도 안산시 상록구 매화로2길 21, 1층 일부호(이동)", "alias": ["예서감자탕"], "note": "2026.04.06 주소변경됨"}, {"name": "찌그러진주전자", "ceo": "최윤덕", "phone": "010-3731-6102", "addr": "경기도 시흥시 봉우재로57(정왕동)", "alias": ["찌그러진"], "note": "비번: 1709"}, {"name": "이모네(거래종료)", "ceo": "성윤정", "phone": "010-3329-4688", "addr": "경기도 시흥시 경기과기대로 127(정왕동)", "alias": ["이모네민물메운탕", "이모네민물매운탕"], "note": "*무영사모님 | 비번: 6225*"}, {"name": "오늘은냉삼(구-이구집)", "ceo": "백현순", "phone": "010-6269-7249", "addr": "경기도 시흥시 진말로 17,1층(장곡동)", "alias": ["오늘은냉삼"], "note": "비번: 35318* (가게밖 뒤 골목 냉장고)"}, {"name": "국민생고기(장곡동)", "ceo": "김성자", "phone": "010-8786-3529", "addr": "경기도 시흥시 장곡로37번길 5-3,101호(장곡동)", "alias": ["국민생고기 장곡"], "note": ""}, {"name": "갈비면옥(갈비나라2호점)", "ceo": "천옥매", "phone": "", "addr": "경기도 안산시 단원구 선삼로22,1층(선부동)", "alias": ["갈비면옥"], "note": "갈비나라 사장님 선부동2호점 010-2466-7682갈비나라사장님"}, {"name": "푸줏단(동춘)", "ceo": "", "phone": "010-2202-2847", "addr": "인천광역시 연수구 봉재산로48, 1층101호(동춘동)", "alias": ["동춘동푸줏단"], "note": "비번: 9291"}, {"name": "오빠막창", "ceo": "강미옥", "phone": "010-7422-0089", "addr": "경기도 시흥시 한우물로7 1층 102호(거모동)", "alias": ["오빠막창"], "note": "횡성생고기 사장님 건물주"}, {"name": "착한정육점(신정동)", "ceo": "강태식", "phone": "010-2759-5738", "addr": "서울특별시 양천구 오목로 146,2층(신정동)", "alias": ["착한정육점 산현", "착한정육점 (산현)", "착한정육점"], "note": ""}, {"name": "대박축산(금천)하늘소", "ceo": "윤상호", "phone": "010-8736-9836", "addr": "서울  금천구 시흥대로62길 53(시흥동)", "alias": ["대박축산금천", "대박축산 금천", "시흥대박축산"], "note": "하늘소 금천점(상호만틀림) 김명화팀장"}, {"name": "차이나감자탕", "ceo": "유철현", "phone": "010-2187-5420", "addr": "경기도 수원시 장안구 수성로370번길32,1층 일부호(영화동)", "alias": ["차이나감자탕"], "note": ""}, {"name": "여기식당", "ceo": "박일남", "phone": "010-4258-1888", "addr": "경기도 시흥시 하중로 130-1, 1층(하중동)", "alias": ["여기식당"], "note": ""}, {"name": "곱창연가", "ceo": "김선희", "phone": "010-6340-8258", "addr": "경기도 시흥시 하상로4번길 7(하상동,1층)", "alias": ["곱창연가"], "note": "김선희"}, {"name": "주식회사 정육점", "ceo": "윤태양", "phone": "010-4400-6200", "addr": "경기도 용인시 기흥구 평촌1로2번길 10,103호(동백동)", "alias": ["주식회사정육점"], "note": ""}, {"name": "맛있는한우(부천상동)", "ceo": "장성호외1명", "phone": "010-2458-6758", "addr": "경기도 부천시 원미구 도약로13,1층102호", "alias": ["맛있는한우", "맛있는한우 상동"], "note": "*무궁화 단가로"}, {"name": "효자축산(일산)", "ceo": "김용석", "phone": "010-9990-6556", "addr": "경기도 고양시 일산서구 중앙로 1406,110호(주엽동,한솔코아)", "alias": ["효자축산"], "note": ""}, {"name": "도담(은행)", "ceo": "", "phone": "010-9049-4398", "addr": "경기도 시흥시 대은로 16-14, 1층(은행동)", "alias": ["도담(은행동) 식당", "도담"], "note": ""}, {"name": "바른정육점(사동)", "ceo": "이소연", "phone": "010-6773-1923", "addr": "경기도 안산시 상록구 해양5로11, 1층 142호 일부(사동)", "alias": ["바른정육점"], "note": ""}, {"name": "한상궁한식주점", "ceo": "이동욱", "phone": "010-8478-3146", "addr": "경기도 안산시 상록구 초당로20, 1층(사동)", "alias": ["한상궁"], "note": ""}, {"name": "구들장2호점", "ceo": "", "phone": "010-5462-3326", "addr": "경기도 수원시 영통구 이의동 1335(아이플랙스)112호", "alias": ["구들장"], "note": "자물쇠 비번: 000"}, {"name": "셀프정육점(포동)", "ceo": "정진석", "phone": "010-3258-8774", "addr": "경기도 시흥시 신현로38번길26,1층 103호(포동)", "alias": ["셀프정육점", "포동셀프정육점", "포동셀프정육"], "note": ""}, {"name": "샛터돌왕구이", "ceo": "최동명", "phone": "010-8708-9829", "addr": "경기 안산시 단원구 신길로 20 (신길동,101호)", "alias": ["샛터"], "note": "비번: 0206"}, {"name": "백봉(선부동)", "ceo": "전봉기", "phone": "010-4446-7700", "addr": "경기도 안산시 단원구 선부광장1로 82,115호(선부동, 서림프라자)", "alias": ["백봉"], "note": ""}, {"name": "정성가득집밥", "ceo": "강명희", "phone": "010-6421-4654", "addr": "경기도 안산시 상록구 네고지길 2,1층 일부호(사동)", "alias": ["정성가득집밥"], "note": ""}, {"name": "오늘도고기&장어((구)으뜸장어)", "ceo": "김만국", "phone": "", "addr": "경기도 안산시 상록구 오목로60, 1층(본오동)", "alias": ["으뜸장어", "오늘도고기앤장어", "오늘도고기&장어", "고기앤장어"], "note": "으뜸장어 상호변경"}, {"name": "맛닭꼬치", "ceo": "편영일", "phone": "010-3688-6995", "addr": "경기도 시흥시 호현로22번길 18,1층(신천동)", "alias": ["신천동 맛닭꼬치입니다", "맛닭꼬치"], "note": "편영일사장 비번050628* | 비번: 터치 050628* (큰냉장고 윗칸 냉동고)"}, {"name": "슈퍼킹(사동)", "ceo": "양종열", "phone": "010-7600-3454", "addr": "경기도 안산시 상록구 감골1로 33,728동 지하층 1호(사동,상록수타운월드아", "alias": ["슈퍼킹"], "note": ""}, {"name": "구워랑", "ceo": "신지선", "phone": "010-9154-7494", "addr": "경기도 화성시 꽃내음2길 12-2 118,119호(새솔동)", "alias": ["구워랑"], "note": "입구비번: 0401#"}, {"name": "행복한 숯불돌쇠구이", "ceo": "박인철", "phone": "010-8769-8087", "addr": "경기도 군포시 공단로 356-54(산본동,금정삼성쉐르빌상가143호,144호)", "alias": ["돌쇠구이"], "note": ""}, {"name": "장터국밥", "ceo": "황인자", "phone": "010-6694-6255", "addr": "경기도 시흥시 정왕동1738-1번지 103호", "alias": ["장터국밥"], "note": "전화번호 자주 바꾸는사람"}, {"name": "우리축산정육점(수암동)", "ceo": "박지훈", "phone": "010-6304-8223", "addr": "경기도 안산시 상록구 원당골길11,104호(수암동,이림지오팰리스)", "alias": ["우리축산정육점"], "note": ""}, {"name": "아이비유통(성남)", "ceo": "권기철", "phone": "010-7103-4525", "addr": "경기도 성남시 중원구 황송로 77", "alias": ["아이비유통"], "note": ""}, {"name": "프리미엄정육점(구리)", "ceo": "박성주", "phone": "010-3763-7346", "addr": "경기도 구리시 체육관로 73 지하층(제이식자재마트)", "alias": ["프리미엄정육점"], "note": ""}, {"name": "인화숯불갈비", "ceo": "홍순태", "phone": "010-2488-7061", "addr": "경기도 시흥시 하상로8번길 1,1층일부호(하상동)", "alias": ["인화숯불갈비"], "note": ""}, {"name": "대박마포숯불갈비", "ceo": "백옥희", "phone": "", "addr": "경기도 광명시 광명로 848번길 5(광명동,1층)", "alias": ["대박마포"], "note": ""}, {"name": "찐하오마라탕 그랑시티시그니처", "ceo": "차승현", "phone": "010-5596-6168", "addr": "경기도 안산시 상록구 해양3로 15, 1층 118호(사동)", "alias": ["찐하오마라탕"], "note": ""}, {"name": "안심한우(광명)", "ceo": "박철진", "phone": "010-6433-3967", "addr": "경기도 광명시 오리로 964번길7(광명동)", "alias": ["안심한우"], "note": "일신할인마트사장님이 소개"}, {"name": "매일정육점(신규)", "ceo": "김영섭", "phone": "010-5306-8522", "addr": "경기도 의정부시 추동로9,1층 103호 (신곡동,휴먼시티)", "alias": ["매일정육점"], "note": ""}, {"name": "두근반세근반", "ceo": "이상현", "phone": "010-3246-2978", "addr": "경기도 시흥시 정왕동1624-7번지 106호", "alias": ["두근반세근반"], "note": "031-499-2978"}, {"name": "장군축산도매센터(광명)", "ceo": "", "phone": "010-6760-9257", "addr": "경기도 광명시 오리로964번길 4, 1층 101호(광명동)", "alias": ["장군축산(광명)", "장군축산"], "note": ""}, {"name": "현대축산(금천)", "ceo": "문미경", "phone": "010-2519-7509", "addr": "서울특별시 금천구 금하로23길4,1층1호(시흥동,신영빌딩)", "alias": ["현대축산 금천"], "note": "핸폰번호 윤종오사장님"}, {"name": "농우축산", "ceo": "이홍주", "phone": "010-5240-3014", "addr": "서울 용산구 효창원로 40길-3, 1층(용문동)", "alias": ["농우축산"], "note": "*19년1월28일 사업자변경 경수남->이홍주"}, {"name": "오복정육(옥련점)베스트식자재정", "ceo": "배선우", "phone": "010-2824-7060", "addr": "인천광역시 연수구 한나루로79번길 53,1층(옥련동)", "alias": ["오복정육"], "note": "베스트식자재 정육코너"}, {"name": "까만돼지", "ceo": "김영자", "phone": "010-2983-1198", "addr": "경기도 시흥시 군자로534번안길 7, 나동 지1층 B101호(거모동)", "alias": ["까만돼지"], "note": ""}, {"name": "대반전", "ceo": "박상우", "phone": "010-8963-4741", "addr": "서울특별시 양천구 오목로 148, 1층(신정동)", "alias": ["대반전"], "note": ""}, {"name": "주식회사 두둑", "ceo": "신미경", "phone": "031-402-5993", "addr": "경기도 시흥시 동서로 1198번길 33(목감동)", "alias": ["두둑 양념육 업체신규", "두둑에"], "note": "*양념육 업체(간판 아이원푸드)"}];

let clientDB = [...DEFAULT_CLIENTS];
let cleanedCsvRowsForExport = [];
let allChatItems = [];
let stockItems = [];
let showOnlyOrder = true;
let showOnlyKnownClient = false;

// 6대 차량 기본 설정, 배차 저장소, 수동 납품일 지정 저장소
const DEFAULT_VEHICLES = [
    "1호차 (이명석 이사)",
    "2호차 (김석민 부장)",
    "3호차 (한승희 부장)",
    "4호차 (최규진 과장)",
    "5호차 (엄태원 과장)",
    "6호차 (양승준/최청호)"
];
let vehicleNames = JSON.parse(localStorage.getItem('mf_vehicles') || 'null') || [...DEFAULT_VEHICLES];
let dispatchMap = JSON.parse(localStorage.getItem('mf_dispatch') || '{}');
let manualDelivMap = JSON.parse(localStorage.getItem('mf_manual_deliv_dates') || '{}');
let selectedVehicleFilter = 'ALL';

// 초기 샘플 재고 데이터 세팅 (11월 10일 재고현황)
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
        pill.innerText = `🕒 업데이트: ${stamp}`;
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
                content: it.content
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
            allChatItems = savedChats;
            allChatItems.forEach((item, idx) => {
                item.idx = idx;
                classifyChatItem(item);
            });
            inferDeliveryDatesForAllItems();

            if (!document.getElementById('orderTargetDate').value) {
                const lastDate = allChatItems[allChatItems.length - 1].dateFull;
                document.getElementById('orderTargetDate').value = lastDate;
            }

            const orderCnt = allChatItems.filter(x => x.type === '발주').length;
            const weightCnt = allChatItems.filter(x => x.type === '계근').length;
            document.getElementById('kakaoLoadMsg').innerText = `💾 이전 저장된 카톡 데이터 자동 복원됨 (총 ${allChatItems.length}건 중 순수발주 ${orderCnt}건 / 계근 ${weightCnt}건)`;
            const pill = document.getElementById('pillKakao');
            pill.innerText = `카톡: 발주 ${orderCnt}건`;
            pill.classList.add('ok');
        }
    } catch (e) {}

    const lastUpd = localStorage.getItem('mf_last_updated');
    if (lastUpd) {
        document.getElementById('pillUpdated').innerText = `🕒 업데이트: ${lastUpd}`;
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
    location.reload();
}

window.addEventListener('DOMContentLoaded', () => {
    renderVehicleConfigInputs();
    restoreStateFromBrowser();

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
});

/* 탭 전환 함수 */
function switchTab(pageId, btnEl) {
    document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    if (btnEl) btnEl.classList.add('active');

    if (pageId === 'page2') renderOrdersTable();
    if (pageId === 'page3') renderStockTable();
    if (pageId === 'page4') renderOrderSummaryTable();
    if (pageId === 'page5') renderDiffTable();
    if (pageId === 'page6') renderDispatchPage();
}

function onFilterCriteriaChange(skipSave) {
    renderOrdersTable();
    renderOrderSummaryTable();
    renderDiffTable();
    renderDispatchPage();
    if (!skipSave) {
        saveStateToBrowser('날짜/필터 변경');
    }
}

/* =========================================================================
   2. 거래처 CSV 파싱 및 매칭 로직
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
            clientDB.push({ name: c[0], ceo: c[1]||'', phone: c[2]||'', addr: c[3]||'', alias: aliases, note: c[5]||'' });
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

            clientDB.push({ name: rawName, ceo, phone, addr, alias: aliases, note });
            cleanedCsvRowsForExport.push([rawName, ceo, phone, addr, aliases.join('|'), note]);
            addedCount++;
        }
    }

    document.getElementById('clientLoadMsg').innerText = `✅ 거래처 ${addedCount}건 추가 로드 완료! (총 ${clientDB.length}개 활성 거래처)`;
    document.getElementById('pillClient').innerText = `거래처: ${clientDB.length}곳`;
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

function matchClientFromText(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return { matched: false, clientName: "미확인", clientObj: null };

    let candidateLines = [lines[0]];
    if (lines.length > 1) candidateLines.push(lines[1]);

    for (let rawLine of candidateLines) {
        let cleanLine = rawLine.replace(/^(전달:\s*|■+|●+|\*+|내일\s+|오늘\s+|월요일\s+|화요일예약\s+|수요일예약\s+)/g, '').trim();
        let lineNoSpace = cleanLine.replace(/\s+/g, '').toLowerCase();

        for (let c of clientDB) {
            for (let al of c.alias) {
                let alNoSpace = al.replace(/\s+/g, '').toLowerCase();
                if (alNoSpace.length >= 2 && (lineNoSpace.startsWith(alNoSpace) || cleanLine.includes(al))) {
                    return { matched: true, clientName: al, officialName: c.name, clientObj: c };
                }
            }
        }
    }

    let firstLine = lines[0].replace(/[●■]/g, ' ').trim();
    let firstToken = firstLine.split(/[\s\.\,\~]/)[0];
    if (/정육|마트|축산|푸드|식당|갈비|감자탕|해장국|면옥|한우|삼겹|소매|택배|주물럭|쌈밥|막창|장어|꼬치|국밥/.test(firstLine)) {
        return { matched: true, clientName: firstToken, officialName: firstToken, clientObj: null };
    }
    return { matched: false, clientName: firstToken || "미확인", officialName: "", clientObj: null };
}

/* =========================================================================
   3. 카카오톡 대화 파일 파싱 및 5단계 스마트 납품일 자동판별 알고리즘
   ========================================================================= */
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
    const pill = document.getElementById('pillKakao');
    pill.innerText = `카톡: 발주 ${orderCnt}건`;
    pill.classList.add('ok');

    saveStateToBrowser('카톡 대화 파일 업로드');
    onFilterCriteriaChange(true);
}

function parseSingleKakaoText(text) {
    const lines = text.split(/\r?\n/);
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

        let mPc = line.match(pcRegex);
        if (mPc) {
            if (curItem) { classifyChatItem(curItem); allChatItems.push(curItem); }
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

        let mMob = line.match(mobRegex);
        if (mMob) {
            if (curItem) { classifyChatItem(curItem); allChatItems.push(curItem); }
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
    if (curItem) { classifyChatItem(curItem); allChatItems.push(curItem); }
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
    item.isKnownClient = clientMatch.matched;
    item.clientObj = clientMatch.clientObj;
    item.itemKey = `${item.dateFull}_${item.timeStr}_${item.clientName}_${txt.substring(0, 18).replace(/\s+/g, '')}`;

    const ignoreKw = [
        '사진', '삭제되었습니다', '재고현황', '발주체크', '분류전', '입금', '반품장',
        '여기까지', '팩스 보냈습니다', '코드 잡았습니다', '단가표', '원가내역',
        '자동차검사', '타이어', '어떤거 주문하신걸까요', '어떤걸로 할까요', '기존 재고 늑간',
        '정정 해두었습니다', '복사해서 했었는데', '그냥 박스로주시죠', '인사요'
    ];
    if (ignoreKw.some(k => txt.includes(k))) { item.type = '기타'; return; }
    if (/\(대산\)\s*\d+박|\(포크\)\s*\d+박|나눌꺼요/.test(txt)) { item.type = '기타'; return; }

    let cleanForWeight = txt
        .replace(/010-\d{3,4}-\d{4}|\d{10,11}/g, '')
        .replace(/\d{1,3},\d{3}\s*원?/g, '')
        .replace(/\d+\.\d{3}\s*원?/g, '')
        .replace(/\d+(?:\.\d+)?\s*~\s*\d+(?:\.\d+)?/g, '')
        .replace(/\d+\.\d+\s*(?:센치|cm|mm|미리|톤|키로|kg|k|작업)/gi, '')
        .replace(/작업\s*\d+\.\d+/g, '')
        .replace(/\d+\s*(?:동|호|번지|층|시|구|읍|면|로|길)/g, '')
        .replace(/202\d년?/g, '')
        .replace(/(?:비번|비밀번호)\s*\d+/g, '')
        .replace(/\d{4}[*#]|8846별표|18079/g, '');

    if (/\d+\.\d+|\d+,\d{2}(?!\d)/.test(cleanForWeight)) {
        if (!/발주할게요|주문합니다|반품잡아서/.test(txt)) {
            item.type = '계근'; return;
        }
    }
    if (/(?:^|[^\d])[1-3]\d{3}(?:$|[^\d])/.test(cleanForWeight)) {
        item.type = '계근'; return;
    }
    if (/\d{1,2}(?:대|포|정담|황금|도누|도누리)(?![가-힣])|\d{3}(?:개|각)(?![가-힣])/.test(cleanForWeight)) {
        item.type = '계근'; return;
    }
    if (/냉동\s*미후지\s*전환|일반목으로\s*전환/.test(txt)) {
        item.type = '계근'; return;
    }

    const txtNoFax = txt.replace(/팩스/g, '');
    const meatRegex = /삼겹|목살|미전지|전지|미삼|등갈비|등뼈|갈비|등심|안심|사태|앞사태|항정|가브리|갈매기|미후지|후지|오겹|우삼겹|차돌|스지|LA|엘에이|살치|부채|토시|안창|장족|미니족|껍데기|돈피|잡육|왕구이|목뼈|사골|오돌뼈|홍두깨|볼라|설도|늑간|알목|두메코|테니쉬|셀렉타|올리멜|박스|팩|판|키로|kg|덩이|봉/i;

    if (meatRegex.test(txtNoFax)) {
        if (/납품$|반품$|교환인가요|삭제해야해요|단가표요|전체단가표|패스래요|패스요|바꿔달래요|보내야죠|갖고감요|뿐이 안됨|더찍어주세요|두메코입니다|인가요\?$/.test(txt)) {
            item.type = '기타'; return;
        }
        if (txt.length <= 10 && !/\d/.test(txt)) {
            item.type = '기타'; return;
        }
        item.type = '발주';
        return;
    }

    item.type = '기타';
}

/* 날짜 더하기 유틸리티 ("YYYY-MM-DD" + days -> "YYYY-MM-DD") */
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
   핵심: 5단계 스마트 납품일(targetDeliveryDate) 자동 추론 엔진
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

        // 0단계: 사용자가 수동으로 지정한 납품일이 있는 경우 최우선 적용
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
        const msgWd = msgDt.getDay(); // 0(일) ~ 6(토)

        // 1단계-A: 명시적 특정 날짜/이월 (예: "10/20(화) 발주건", "11월1일자로", "11월2일자로 이월")
        const mDate = txt.match(/(\d{1,2})\/(\d{1,2})\s*\([월화수목금토일]\)|(\d{1,2})월\s*(\d{1,2})일\s*(?:자로|이월)/);
        if (mDate) {
            const mo = String(mDate[1] || mDate[3]).padStart(2, '0');
            const da = String(mDate[2] || mDate[4]).padStart(2, '0');
            item.targetDeliveryDate = `${msgDt.getFullYear()}-${mo}-${da}`;
            item.delivShort = `${mo}/${da}`;
            item.delivReason = `명시날짜(${mo}/${da})`;
            continue;
        }

        // 1단계-B: 명시적 요일 지정 (예: "월요일", "화요일예약", "수요일 보내달래요", "목요일", "금욜", "월주문=")
        const mWd = txt.match(/(?:^|[^내금당명월화수목토일])(월|화|수|목|금|토|일)(?:요일|욜|주문=)|^\s*(월|화|수|목|금|토|일)\s*$/m);
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

        // 2단계-A: 명시적·암묵적 익일 키워드 ("내일", "낼", "낼주문", "아침에 들리겠습니다", "오전 급 배송", "10시 전에")
        if (/내일|낼주문|(?:^|[^가-힣])낼(?:$|[^가-힣])|아침에\s*(?:들리|갖을러|가지러)|오전\s*급\s*배송|10시\s*전에/.test(txt)) {
            item.targetDeliveryDate = addDaysToDateStr(item.dateFull, 1);
            item.delivShort = toShortDate(item.targetDeliveryDate);
            item.delivReason = '익일키워드(내일)';
            continue;
        }

        // 2단계-B: 명시적·암묵적 당일 키워드 ("오늘", "당일", "금일", "지금", "조금있다", "퇴근길", "오후에", "11시쯤온데요", "방문예정", "즉납")
        if (/오늘|당일|금일|지금\s*(?:가|갖|가지러)|조금\s*있다|퇴근\s*(?:길|때|하면서)|오후에|방문\s*예정|\d{1,2}시\s*(?:반\s*)?쯤?\s*(?:온데|방문|찾으러|들린데|갖으러)|즉납|전표\s*하나\s*바로|제\s*코스에서|엄과장님\s*편에/.test(txt)) {
            item.targetDeliveryDate = item.dateFull;
            item.delivShort = item.dateShort;
            item.delivReason = '당일키워드(오늘/방문)';
            continue;
        }

        // 3단계-A: '●추가' 시간대 판별 (15:00 이전은 당일 출고분 추가, 15:00 이후는 익일 본발주에 대한 추가)
        if (/●\s*추가|●\s*더추가|●\s*또추가|추가요|추가할께요/.test(txt)) {
            if (mins < 15 * 60) {
                item.targetDeliveryDate = item.dateFull;
                item.delivShort = item.dateShort;
                item.delivReason = '오전추가→당일';
            } else {
                item.targetDeliveryDate = addDaysToDateStr(item.dateFull, 1);
                item.delivShort = toShortDate(item.targetDeliveryDate);
                item.delivReason = '저녁추가→익일';
            }
            continue;
        }

        // 3단계-B: 당일 후속 '계근(무게 측정)' 매칭 검증
        // 발주 직후 같은 날(D)에 동일 거래처의 계근 기록이 올라왔다면 100% 당일 출고!
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

        // 4단계: 휴일(일요일) 발주 규칙 -> 일요일에 올라온 모든 발주는 월요일(D+1) 납품
        if (msgWd === 0) {
            item.targetDeliveryDate = addDaysToDateStr(item.dateFull, 1);
            item.delivShort = toShortDate(item.targetDeliveryDate);
            item.delivReason = '일요일→월요일';
            continue;
        }

        // 5단계: 13:50 마감선 (한재호 대표의 14:00 정각 예약발송 및 오후 발주 = 익일 D+1 / 13:50 이전 = 당일 D)
        if (mins < 13 * 60 + 50) {
            item.targetDeliveryDate = item.dateFull;
            item.delivShort = item.dateShort;
            item.delivReason = '13:50이전→당일';
        } else {
            item.targetDeliveryDate = addDaysToDateStr(item.dateFull, 1);
            item.delivShort = toShortDate(item.targetDeliveryDate);
            item.delivReason = '14시예약/오후→익일';
        }
    }
}

/* 사용자가 2페이지 배지를 클릭해 당일(D) <-> 익일(D+1) 납품일을 수동 전환하는 함수 */
function toggleItemDeliveryDate(itemIdx) {
    const item = allChatItems[itemIdx];
    if (!item || item.type !== '발주') return;

    const sameDay = item.dateFull;
    const nextDay = addDaysToDateStr(item.dateFull, 1);

    // 현재 당일이면 익일로, 익일(또는 다른 날)이면 당일로 원클릭 토글
    const newTarget = (item.targetDeliveryDate === sameDay) ? nextDay : sameDay;
    manualDelivMap[item.itemKey] = newTarget;
    localStorage.setItem('mf_manual_deliv_dates', JSON.stringify(manualDelivMap));

    inferDeliveryDatesForAllItems();
    recordLastUpdatedTime(`${item.clientName} 납품일 수동변경(${toShortDate(newTarget)})`);
    onFilterCriteriaChange(true);
}

/* =========================================================================
   4. [페이지 2] 발주 목록 필터링 및 상단 헤더 소형 아이콘 토글 제어
   ========================================================================= */
function getFilteredOrderList(forceOnlyOrder = false) {
    const targetDateStr = document.getElementById('orderTargetDate').value;
    const mode = document.getElementById('orderTimeMode').value;

    return allChatItems.filter(item => {
        if ((showOnlyOrder || forceOnlyOrder) && item.type !== '발주') return false;
        if (showOnlyKnownClient && !item.isKnownClient) return false;
        if (mode === 'all' || !targetDateStr) return true;

        // [추천] 5단계 스마트 납품일 자동판별 모드
        if (mode === 'smart') {
            if (item.type === '발주') {
                return item.targetDeliveryDate === targetDateStr;
            } else {
                // 비발주(계근/기타) 함께 보기 상태일 때는 해당 날짜에 작성된 계근을 표시
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
    const tbody = document.getElementById('orderTableBody');
    tbody.innerHTML = '';

    const list = getFilteredOrderList(false);
    const targetDateStr = document.getElementById('orderTargetDate').value;
    const mode = document.getElementById('orderTimeMode').value;
    const modeLabel = mode === 'smart' ? `스마트 납품일(${toShortDate(targetDateStr)}) 기준` : '선택 시간범위 기준';
    document.getElementById('orderStats').innerText = `📋 조회된 내역: 총 ${list.length}건 (${modeLabel})`;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="2" style="text-align:center; padding:20px; color:#dc2626;">선택하신 납품 기준일(${escapeHtml(targetDateStr)})에 해당하는 발주 내역이 없습니다.</td></tr>`;
        return;
    }

    list.forEach(item => {
        let badge = `<span class="badge b-other">기타</span>`;
        if (item.type === '발주') badge = `<span class="badge b-order">발주</span>`;
        else if (item.type === '계근') badge = `<span class="badge b-weight">계근</span>`;

        let clientBadge = item.isKnownClient ? `<span class="badge b-client">인증</span>` : '';

        let delivBadgeHtml = '';
        if (item.type === '발주') {
            const isNextDay = item.targetDeliveryDate !== item.dateFull;
            const extraCls = item.isManualDeliv ? 'manual' : (isNextDay ? 'next-day' : '');
            delivBadgeHtml = `<br><button class="deliv-badge-btn ${extraCls}" onclick="toggleItemDeliveryDate(${item.idx})" title="클릭하면 당일(${item.dateShort}) ↔ 익일 납품일을 수동 전환합니다">🚚 납품:${escapeHtml(item.delivShort)} (${escapeHtml(item.delivReason)}) 🔄</button>`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="white-space:nowrap; line-height:1.6; vertical-align:middle;">
                <span style="color:#4b5563;">작성: <b>${escapeHtml(item.dateShort)}</b>, ${escapeHtml(item.timeStr)}</span><br>
                <b style="color:var(--primary); font-size:13px;">${escapeHtml(item.clientName)}</b>${clientBadge}<br>
                <span style="color:#374151;">${escapeHtml(item.sender)}</span> ${badge}
                ${delivBadgeHtml}
            </td>
            <td style="white-space:pre-line; vertical-align:middle;">${escapeHtml(item.content)}</td>
        `;
        tbody.appendChild(tr);
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
   5. [페이지 3] 일일 재고 현황 텍스트 파서 및 표 생성
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

    document.getElementById('stockTitleInfo').innerText = `📦 ${stockTitle}`;
    const pill = document.getElementById('pillStock');
    pill.innerText = `재고: ${stockItems.length}품목`;
    pill.classList.add('ok');

    renderStockTable();
    if (!skipSave) {
        saveStateToBrowser('일일 재고현황 적용');
    }
    if (goTab) {
        switchTab('page3', document.querySelectorAll('.tab-btn')[2]);
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
    const tbody = document.getElementById('stockTableBody');
    tbody.innerHTML = '';

    stockItems.forEach(item => {
        const d = item.brands['대산'];
        const p = item.brands['포크'];
        const o = item.brands['기타'];
        const total = d.boxes + p.boxes + o.boxes;

        const formatCell = (bObj) => {
            if (bObj.details.length === 0) return `<span class="num-zero">-</span>`;
            return `<b>${bObj.boxes}박</b><br><small style="color:#555;">${bObj.details.map(escapeHtml).join(', ')}</small>`;
        };

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><b style="color:var(--primary); font-size:13px;">${escapeHtml(item.name)}</b></td>
            <td>${formatCell(d)}</td>
            <td>${formatCell(p)}</td>
            <td>${formatCell(o)}</td>
            <td style="font-size:13px;"><b>총 ${total}박</b></td>
        `;
        tbody.appendChild(tr);
    });
}

/* =========================================================================
   6. 품목별 발주 집계 엔진 (4페이지 일일 발주 현황표 & 5페이지 차감 계산 공용)
   ========================================================================= */
const ITEM_MATCH_RULES = [
    { key: "특미삼", regex: /특미삼/ },
    { key: "암미삼", regex: /암미삼/ },
    { key: "미삼", regex: /(?<!특|암)미삼|미박삼겹/ },
    { key: "특삼겹", regex: /특삼겹|특원삼/ },
    { key: "암삼겹", regex: /암삼겹|암원삼|암삼(?!겹)|암퇘지\s*삼겹|A삼겹|A삼(?!겹)/ },
    { key: "빵삼겹", regex: /빵삼겹|빵삼/ },
    { key: "토레인 삼겹", regex: /토레인\s*삼겹|삼겹\s*\d*\s*토레인/ },
    { key: "냉장 수입 올리멜 삼겹", regex: /수입\s*냉장\s*삼겹|냉장\s*수입\s*삼겹|올리멜\s*삼겹/ },
    { key: "삼겹", regex: /(?<!특|암|빵|토레인\s*|수입\s*|냉동\s*|모돈\s*|대패\s*|두메코\s*|테니쉬\s*)삼겹/ },
    { key: "특목살", regex: /특목살|특목심|특목/ },
    { key: "B목살", regex: /B목살|비목살|B목/i },
    { key: "냉장 수입 올리멜 목살", regex: /수입\s*냉장\s*목살|냉장\s*수입\s*목살|올리멜\s*목살/ },
    { key: "목살", regex: /(?<!특|B|비|수입|냉장수입|올리멜|고원돈)목살|목심/ },
    { key: "미전지", regex: /(?<!냉동\s*)미전지/ },
    { key: "지전지", regex: /지전지|지방전지|스켄전지|스키너전지/ },
    { key: "전지", regex: /(?<!미|지|지방|스켄|스키너|목|냉동|에이)전지|일반전지|A전지/ },
    { key: "등갈비", regex: /(?<!바텔|냉동)등갈비/ },
    { key: "갈비", regex: /(?<!등|LA|엘에이|소|수입|냉동)갈비(?!살)|돈갈비|돼지갈비|생갈비/ },
    { key: "등심", regex: /(?<!냉동|꽃)등심/ },
    { key: "안심", regex: /(?<!냉동)안심/ },
    { key: "앞미사태", regex: /앞미사태|미앞사태|앞사태|앞다리사태/ },
    { key: "사태", regex: /(?<!앞|미|소|우|아롱)사태|속사태|생사태/ },
    { key: "항정", regex: /(?<!냉동)항정/ },
    { key: "가브리", regex: /가브리/ },
    { key: "갈매기", regex: /갈매기/ },
    { key: "미후지", regex: /(?<!냉동\s*|3mm\s*)미후지/ },
    { key: "후지", regex: /냉장\s*3(?:mm|미리)\s*후지|3(?:mm|미리)\s*냉장\s*후지|생후지/ },
    { key: "등뼈", regex: /(?<!냉동|목)등뼈|돈등뼈|돼지등뼈|한돈등뼈/ },
    { key: "냉장잡육", regex: /잡육/ },
    { key: "냉장 알목심f PR", regex: /냉장\s*프라임\s*알목|프라임\s*냉장\s*알목|수입\s*냉장\s*알목/ },
    { key: "냉장 살치f PR", regex: /살치/ },
    { key: "냉장 늑간f CH NBP", regex: /늑간/ }
];

function computeOrderAggregation() {
    const orders = getFilteredOrderList(true);
    const summaryMap = {};

    stockItems.forEach(s => {
        summaryMap[s.name] = {
            '대산': { stock: s.brands['대산'].boxes, orderBox: 0, orderPack: 0, clients: [] },
            '포크': { stock: s.brands['포크'].boxes, orderBox: 0, orderPack: 0, clients: [] },
            '기타': { stock: s.brands['기타'].boxes, orderBox: 0, orderPack: 0, clients: [] }
        };
    });

    orders.forEach(ord => {
        const lines = ord.content.split('\n').map(l => l.trim()).filter(Boolean);
        let msgDefaultBrand = '미지정';
        if (/대산꺼로|대산으로/.test(ord.content)) msgDefaultBrand = '대산';
        else if (/포크로|농협/.test(ord.content)) msgDefaultBrand = '포크';

        lines.forEach(line => {
            if (/안녕|부탁|감사|발주|주문|이상입니다|대표님/.test(line) && !/\d/.test(line)) return;

            for (let rule of ITEM_MATCH_RULES) {
                if (rule.regex.test(line)) {
                    const targetItem = summaryMap[rule.key];
                    if (!targetItem) break;

                    let br = '기타';
                    if (/대산/.test(line)) br = '대산';
                    else if (/포크|농협/.test(line)) br = '포크';
                    else if (/정담|황금|토레인|올리멜|엑셀|IBP|NBP/i.test(line)) br = '기타';
                    else if (msgDefaultBrand !== '미지정') br = msgDefaultBrand;
                    else {
                        if (targetItem['포크'].stock >= targetItem['대산'].stock && targetItem['포크'].stock > 0) br = '포크';
                        else if (targetItem['대산'].stock > 0) br = '대산';
                        else br = '기타';
                    }

                    const packMatch = line.match(/(\d+(?:\.\d+)?)\s*(팩|펙|판|봉|봉지|덩이|덩어리|키로|kg|k|두|마리)/i);
                    const boxMatch = line.match(/(\d+)\s*(?:박스|빡스|박|box|b)(?![a-z])/i);
                    const bareNumMatch = line.match(/(?:^|[^\d.])(\d{1,2})(?:$|[\s.포대정])/);

                    if (boxMatch) {
                        const q = parseInt(boxMatch[1], 10);
                        targetItem[br].orderBox += q;
                        targetItem[br].clients.push(`${ord.clientName}(${q}박)`);
                    } else if (packMatch) {
                        const pQty = parseFloat(packMatch[1]) || 1;
                        const pUnit = packMatch[2];
                        targetItem[br].orderPack += (pUnit.includes('키로') || pUnit.toLowerCase().includes('k')) ? 1 : pQty;
                        targetItem[br].clients.push(`${ord.clientName}(${packMatch[0]})`);
                    } else if (bareNumMatch) {
                        const q = parseInt(bareNumMatch[1], 10);
                        targetItem[br].orderBox += q;
                        targetItem[br].clients.push(`${ord.clientName}(${q}박)`);
                    }
                    break;
                }
            }
        });
    });

    return summaryMap;
}

/* =========================================================================
   7. [페이지 4] 일일 발주 현황표 렌더링 (3페이지 재고현황표와 동일한 양식!)
   ========================================================================= */
function renderOrderSummaryTable() {
    const tbody = document.getElementById('orderSummaryTableBody');
    tbody.innerHTML = '';

    const tDate = document.getElementById('orderTargetDate').value || '전체';
    document.getElementById('orderSummaryDateInfo').innerText = `[납품 기준일: ${tDate}]`;

    const summaryMap = computeOrderAggregation();

    Object.keys(summaryMap).forEach(itemName => {
        const g = summaryMap[itemName];
        const d = g['대산'], p = g['포크'], o = g['기타'];
        const totBox = d.orderBox + p.orderBox + o.orderBox;
        const totPack = d.orderPack + p.orderPack + o.orderPack;

        const formatOrderCell = (bObj) => {
            if (bObj.orderBox === 0 && bObj.orderPack === 0) return `<span class="num-zero">0박</span>`;
            let head = `<b style="color:var(--accent);">${bObj.orderBox}박</b>`;
            if (bObj.orderPack > 0) head += ` <b style="color:var(--warn);">+ ${bObj.orderPack}팩(건)</b>`;
            return `${head}<br><small style="color:#4b5563;">${bObj.clients.map(escapeHtml).join(', ')}</small>`;
        };

        let totStr = `<b>총 ${totBox}박</b>`;
        if (totPack > 0) totStr += `<br><small style="color:var(--warn); font-weight:bold;">+ ${totPack}팩(건)</small>`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><b style="color:var(--primary); font-size:13px;">${escapeHtml(itemName)}</b></td>
            <td>${formatOrderCell(d)}</td>
            <td>${formatOrderCell(p)}</td>
            <td>${formatOrderCell(o)}</td>
            <td style="font-size:13px;">${totStr}</td>
        `;
        tbody.appendChild(tr);
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
   8. [페이지 5] 발주차감 잔여재고 렌더링
   ========================================================================= */
function renderDiffTable() {
    const tbody = document.getElementById('diffTableBody');
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
   9. [페이지 6] 당일 배송처 목록 (박스수/낱개수 전용) 및 6대 차량 기사 배차 관리
   ========================================================================= */
function renderVehicleConfigInputs() {
    const grid = document.getElementById('vehicleConfigGrid');
    grid.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        const div = document.createElement('div');
        div.className = 'vehicle-config-item';
        div.innerHTML = `
            <span>🚚 ${i + 1}호차 기사/차량명</span>
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

function countOrderBoxesAndLoose(orderText) {
    const lines = orderText.split('\n').map(l => l.trim()).filter(Boolean);
    let totalBoxes = 0;
    let totalLoose = 0;

    lines.forEach((line, idx) => {
        if (/010-\d{3,4}-\d{4}|안녕하|발주드리려고|부탁드립|부탁해요|보내주세요|보내주세여|이상입니다|감사합니다|주문합니다|주문드립니다|방문예정|들리겠습니다|차차장님|우편함에|넣어주세요|기름 적은거로/.test(line)) {
            if (!/(삼겹|목살|미전지|전지|미삼|등갈비|등뼈|갈비|등심|안심|사태|항정|가브리|갈매기|미후지|후지|오겹|우삼겹|차돌|스지|살치|부채|장족|미니족|돈피|잡육|왕구이|목뼈|사골|오돌뼈|홍두깨|볼라|설도|늑간|알목|두메코|테니쉬|셀렉타|올리멜|주물럭|제육)/.test(line)) {
                return;
            }
        }
        if (idx === 0 && !/\d+\s*(박스|빡스|박|box|팩|펙|판|봉|덩이|벌)/i.test(line)) {
            return;
        }

        let s = line;
        s = s.replace(/\((\d+)\s*박스(?:로[^\)]*)?\)/g, ' $1박스 ');
        s = s.replace(/\([^\)]*\)/g, ' ').replace(/\[[^\]]*\]/g, ' ');
        s = s.replace(/[+-]?\d{1,3}(?:,\d{3})+(?:원|행사|할인|납)?/g, ' ');
        s = s.replace(/\d+\.\d{3}(?:원)?/g, ' ').replace(/-\d+할인/g, ' ');
        s = s.replace(/\d+(?:\.\d+)?\s*(?:mm|미리|센치|cm)/gi, ' ');
        s = s.replace(/\d{1,2}월\s*\d{1,2}일(?:자로)?|\d{1,2}\/\d{1,2}|\d{1,2}일(?:자|자로|재고|진|포크|암삼|대산)?/g, ' ');
        s = s.replace(/\d+\s*~\s*\d+\s*(?:키로|kg)?(?:대)?/gi, ' ');
        s = s.replace(/\d+\s*(?:키로|kg)\s*(?:대|이상)/gi, ' ');
        s = s.replace(/(?:미삼|삼겹|암삼|암미삼)\s*1[6789]키로/g, '미삼 ');
        s = s.replace(/\d+호점|1\+\+/g, ' ');
        s = s.replace(/한박스/g, '1박스').replace(/한판/g, '1판').replace(/한덩이/g, '1덩이').replace(/한덩어리/g, '1덩어리');
        s = s.replace(/두마리분/g, '2마리분').replace(/한마리분/g, '1마리분').replace(/한마리반/g, '1마리분');

        if (!/(삼겹|목살|목심|미전지|전지|미삼|등갈비|등뼈|목뼈|갈비|등심|안심|사태|항정|가브리|갈매기|미후지|후지|오겹|우삼겹|우겹살|차돌|스지|살치|부채|장족|미니족|돈피|껍데기|잡육|등잡|왕구이|사골|오돌뼈|홍두깨|볼라|설도|늑간|알목|두메코|테니쉬|셀렉타|올리멜|주물럭|제육|불고기|미추리|잡뼈|우족|덧살|덜미|민찌|수삼|모돈|엘에이|LA|백립|빽립|프렌치렉|숄더렉|삼각살)/i.test(s)) {
            return;
        }

        const boxMatches = [...s.matchAll(/(\d+)\s*(?:박스|빡스|박|box|b)(?![a-zA-Z])/gi)];
        const halfBox = s.includes('반박스') ? 1 : 0;

        let sRem = s.replace(/\d+\s*(?:박스|빡스|박|box|b)(?![a-zA-Z])/gi, ' ').replace(/반박스/g, ' ');
        const looseMatches = [...sRem.matchAll(/(\d+)\s*(?:팩|펙|판|봉|봉지|덩이|덩어리|진공|벌|두|마리분|마리|피스|p|개)(?![a-zA-Z])/gi)];

        if (boxMatches.length > 0 || halfBox > 0 || looseMatches.length > 0) {
            boxMatches.forEach(m => { totalBoxes += parseInt(m[1], 10); });
            totalBoxes += halfBox;
            looseMatches.forEach(m => { totalLoose += parseInt(m[1], 10); });
        } else {
            const kgMatches = [...sRem.matchAll(/(\d+(?:\.\d+)?)\s*(?:kg|키로|킬|k)(?![a-zA-Z])/gi)];
            if (kgMatches.length > 0) {
                totalLoose += kgMatches.length;
            } else {
                const bareNums = [...sRem.matchAll(/(?:^|[^\d])(\d{1,2})(?!\d)/g)];
                if (bareNums.length > 0) {
                    totalBoxes += parseInt(bareNums[0][1], 10);
                }
            }
        }
    });

    return { boxes: totalBoxes, loose: totalLoose };
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
                isUrgent: false
            });
        }
        const entry = destMap.get(key);
        const cnt = countOrderBoxesAndLoose(ord.content);
        entry.totalBoxes += cnt.boxes;
        entry.totalLoose += cnt.loose;
        if (/급|일찍|오전/.test(ord.content)) entry.isUrgent = true;
    });

    return Array.from(destMap.values());
}

function formatBoxLooseSummary(boxes, loose) {
    if (boxes > 0 && loose > 0) {
        return `<b style="color:var(--primary); font-size:13px;">📦 ${boxes}박스</b> <span style="color:#9ca3af;">/</span> <b style="color:var(--warn); font-size:13px;">낱개 ${loose}</b>`;
    } else if (boxes > 0) {
        return `<b style="color:var(--primary); font-size:13px;">📦 ${boxes}박스</b>`;
    } else if (loose > 0) {
        return `<b style="color:var(--warn); font-size:13px;">낱개 ${loose}</b>`;
    }
    return `<span class="num-zero">-</span>`;
}

function renderDispatchPage() {
    const destinations = getAggregatedDeliveryDestinations();
    const tbody = document.getElementById('dispatchTableBody');
    const statBar = document.getElementById('vehicleStatBar');
    tbody.innerHTML = '';
    statBar.innerHTML = '';

    const counts = { 'ALL': destinations.length, 'UNASSIGNED': 0, 'PICKUP': 0 };
    for (let i = 0; i < 6; i++) counts[`V${i}`] = 0;

    destinations.forEach(d => {
        const assigned = dispatchMap[d.clientName] || 'UNASSIGNED';
        if (counts[assigned] !== undefined) counts[assigned]++;
        else counts['UNASSIGNED']++;
    });

    const chips = [
        { code: 'ALL', label: `전체 납품처 (${counts['ALL']})` },
        { code: 'UNASSIGNED', label: `미배차 (${counts['UNASSIGNED']})` },
        ...vehicleNames.map((vName, idx) => ({ code: `V${idx}`, label: `${vName} (${counts['V'+idx]})` })),
        { code: 'PICKUP', label: `직접방문/택배 (${counts['PICKUP']})` }
    ];

    chips.forEach(ch => {
        const span = document.createElement('span');
        span.className = 'v-stat-chip' + (selectedVehicleFilter === ch.code ? ' active' : '');
        span.innerText = ch.label;
        span.onclick = () => { selectedVehicleFilter = ch.code; renderDispatchPage(); };
        statBar.appendChild(span);
    });

    const filteredDests = destinations.filter(d => {
        const assigned = dispatchMap[d.clientName] || 'UNASSIGNED';
        if (selectedVehicleFilter === 'ALL') return true;
        return assigned === selectedVehicleFilter;
    });

    if (filteredDests.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:24px; color:#888;">조건에 해당하는 당일 납품처가 없습니다. (1페이지에서 카톡 파일을 먼저 업로드하거나 차량 필터를 확인해주세요)</td></tr>`;
        return;
    }

    filteredDests.forEach((d, idx) => {
        const curVal = dispatchMap[d.clientName] || 'UNASSIGNED';
        const isAssignedClass = (curVal !== 'UNASSIGNED') ? 'assigned' : '';

        let optionsHtml = `<option value="UNASSIGNED" ${curVal==='UNASSIGNED'?'selected':''}>-- 차량 미배차 --</option>`;
        for (let i = 0; i < 6; i++) {
            const vCode = `V${i}`;
            optionsHtml += `<option value="${vCode}" ${curVal===vCode?'selected':''}>🚚 ${escapeHtml(vehicleNames[i])}</option>`;
        }
        optionsHtml += `<option value="PICKUP" ${curVal==='PICKUP'?'selected':''}>📦 직접방문 / 택배</option>`;

        let addrHtml = d.addr ? `<div>📍 ${escapeHtml(d.addr)}</div>` : `<div style="color:#9ca3af;">📍 주소 미등록</div>`;
        if (d.phone) addrHtml += `<div style="color:#4b5563; margin-top:2px;">📞 ${escapeHtml(d.phone)}</div>`;
        if (d.note) addrHtml += `<div style="color:#b45309; font-weight:bold; margin-top:2px;">🔑 ${escapeHtml(d.note)}</div>`;

        let urgentBadge = d.isUrgent ? `<span class="badge b-urgent">급/오전</span>` : '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="text-align:center; vertical-align:middle;"><b>${idx + 1}</b></td>
            <td style="vertical-align:middle;">
                <b style="color:var(--primary); font-size:13px;">${escapeHtml(d.clientName)}</b>${urgentBadge}
                ${d.officialName !== d.clientName ? `<br><small style="color:#6b7280;">(${escapeHtml(d.officialName)})</small>` : ''}
            </td>
            <td style="font-size:11.5px; line-height:1.4; vertical-align:middle;">${addrHtml}</td>
            <td style="vertical-align:middle; white-space:nowrap;">${formatBoxLooseSummary(d.totalBoxes, d.totalLoose)}</td>
            <td style="vertical-align:middle;">
                <select class="dispatch-select ${isAssignedClass}" onchange="assignVehicle('${escapeHtml(d.clientName)}', this.value)">
                    ${optionsHtml}
                </select>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function assignVehicle(clientName, vCode) {
    dispatchMap[clientName] = vCode;
    localStorage.setItem('mf_dispatch', JSON.stringify(dispatchMap));
    recordLastUpdatedTime(`${clientName} 배차 지정`);
    renderDispatchPage();
}

function downloadDispatchCsv() {
    const destinations = getAggregatedDeliveryDestinations();
    let csv = "\uFEFF순번,납품거래처명,정식상호,배차차량,주소,연락처,출입비번/비고,박스수,낱개수\n";
    destinations.forEach((d, idx) => {
        const code = dispatchMap[d.clientName] || 'UNASSIGNED';
        let vLabel = '미배차';
        if (code.startsWith('V')) vLabel = vehicleNames[parseInt(code.substring(1), 10)];
        else if (code === 'PICKUP') vLabel = '직접방문/택배';

        csv += `${idx + 1},"${d.clientName}","${d.officialName}","${vLabel}","${d.addr}","${d.phone}","${d.note}",${d.totalBoxes},${d.totalLoose}\n`;
    });
    downloadBlob(csv, "미트포앤_당일배송처_배차목록.csv");
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
        csv += `"${o.dateShort}","${o.timeStr}","${o.delivShort||''}","${o.delivReason||''}","${o.clientName}","${o.sender}","${o.type}","${clean}"\n`;
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
