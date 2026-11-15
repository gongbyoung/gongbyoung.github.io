export type DeliveryStatus = 'pending' | 'in_transit' | 'delivered' | 'issue';

export type DeliveryTab = 'deliveries' | 'loader' | 'kakao' | 'upgrades';

export type DropOffMethod = '직접 전달' | '문 앞 배송' | '경비실 위탁' | '하역장 인계';

export type TimeFilterMode =
  | 'smart'
  | 'prev10_to_16'
  | 'prev22_to_16'
  | 'fullday'
  | 'all';

export interface ClientRecord {
  name: string;
  ceo: string;
  phone: string;
  addr: string;
  alias: string[];
  note: string;
}

export interface ParsedChatItem {
  idx: number;
  dateFull: string;
  dateShort: string;
  timeStr: string;
  timeMins: number;
  sender: string;
  content: string;
  clientName: string;
  officialName: string;
  isKnownClient: boolean;
  clientObj: ClientRecord | null;
  itemKey: string;
  type: '발주' | '계근' | '기타';
  targetDeliveryDate: string;
  delivShort: string;
  delivReason: string;
  isManualDeliv: boolean;
}

export interface BrandStockBucket {
  boxes: number;
  details: string[];
}

export interface StockItem {
  name: string;
  curBrand: string;
  brands: {
    대산: BrandStockBucket;
    포크: BrandStockBucket;
    기타: BrandStockBucket;
  };
}

export interface OrderAggBucket {
  stock: number;
  orderBox: number;
  orderPack: number;
  clients: string[];
}

export type OrderSummaryMap = Record<
  string,
  {
    대산: OrderAggBucket;
    포크: OrderAggBucket;
    기타: OrderAggBucket;
  }
>;

export interface DeliveryStopState {
  status: DeliveryStatus;
  completedTime?: string;
  dropOffMethod?: DropOffMethod;
  issueReason?: string;
}

export interface DeliveryStop {
  id: string;
  stopOrder: number;
  waybillNo: string;
  clientName: string;
  officialName: string;
  ceo: string;
  phone: string;
  address: string;
  doorNote: string;
  boxCount: number;
  looseCount: number;
  isUrgent: boolean;
  isKnownClient: boolean;
  orderLines: string[];
  vehicleCode: string;
  status: DeliveryStatus;
  completedTime?: string;
  dropOffMethod?: DropOffMethod;
  issueReason?: string;
  scheduledTime: string;
}

export interface KakaoDeliveryAlert {
  id: string;
  recipientLabel: string;
  waybillNo?: string;
  templateType: string;
  messageText: string;
  sentAt: string;
  status: 'delivered' | 'read';
}
