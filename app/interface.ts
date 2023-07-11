export enum HistoryType { None = 0, Set = 1, Add = 2 };

export interface PartnerLookupEntry {
    id: number;
    name: string;
};

export interface ReportPartnerList {
    partner_id: number;
    partner_name: string;
    partner_email: string;
    partner_phone: string;
    created: Date;
    updated: Date;
    pallets: number;
    quantity: number;
    empties: number;
};

export interface ReportPartnerStock {
    id: number;
    item_id: number;
    item_name: string;
    pallets: number;
    quantity: number;
    empties: number;
    location_id: number;
    location_name: number;
    updated: Date;
};

export interface ReportPartnerHistory {
    id: number;
    item_id: number;
    item_name: string;
    pallets: number;
    quantity: number;
    empties: number;
    location_id: number;
    location_name: number;
    partner_id: number;
    partner_name: string;
    created: Date;
    operation: string;
    comment: string;
};

export interface PartnerCreateEntry {
    name: string;
    email: string;
    phone: string;
};

export interface PartnerUpdateEntry {
    id: number;
    name: string;
    email: string;
    phone: string;
};

export interface PartnerEntry {
    id: number;
    name: string;
    email: string;
    phone: string;
    created: number;
    updated: number;
};

export interface LocationCreateEntry {
    name: string;
    parent_id: number;
};

export interface LocationRenameEntry {    
    id: number;
    name: string;
};

export interface LocationLookupEntry {
    id: number;
    name: string;
};

export interface LocationEntry {
    id: number;
    parent_id: number;
    name: string;
    created: number;
    updated: number;
};

export interface ItemCreateEntry {
    name: string;
};

export interface ItemLookupEntry {
    id: number;
    name: string;
};

export interface ReportHistoryEntry {
    id: number;
    item_id: number;
    item_name: string;
    pallets: number;
    quantity: number;
    empties: number;
    location_id: number;
    location_name: string;
    partner_id: number;
    partner_name: string;
    created: Date;
    operation: string;
    comment: string;
    group: string;
    type: HistoryType;
};

export interface ReportHistoryParameters {
    partner?: string;
    item?: string;
    location?: string;
    updatedFrom?: number;
    updatedTo?: number;
    comment?: string;
    operation?: string;
    type?: HistoryType;
};

export interface ReportStockEntry {
    id: number;
    pallets: number;
    quantity: number;
    empties: number;
    created: Date;
    updated: Date;
    item_id: number;
    item_name: string;
    location_id: number;
    location_name: number;
    partner_id: number;
    partner_name: string;
};

export interface ReportStockParameters {
    partner?: string;
    item?: string;
    location?: string;
    updatedFrom?: number;
    updatedTo?: number;
};

export interface LoadInputParameters {
    partner_id: number;
    item_id: number;
    location_id: number;
    pallets: number;
    quantity: number;
    empties: number;
};

export interface CorrectionInputParameters {
    stock_id: number;
    pallets: number;
    quantity: number;
    empties: number;
    operation: string;
    comment: string;
    type: HistoryType;
};

export interface StorageBackend {
    stockGet(id: number): Promise<ReportStockEntry>;
    stockCorrection(data: CorrectionInputParameters): Promise<number>;
    load(data: ReportHistoryEntry[]): Promise<string>;
    itemLookup(): Promise<ItemLookupEntry[]>;
    itemSafeInsert(data: ItemCreateEntry): Promise<number>;
    itemCreate(data: ItemCreateEntry): Promise<number>;
    locationGet(id: number): Promise<LocationEntry>;
    locationLookup(): Promise<LocationLookupEntry[]>;
    locationCreate(data: LocationCreateEntry): Promise<number>;
    locationRename(data: LocationRenameEntry): Promise<number>;
    locationDelete(id: number): Promise<number>;
    locationList(): Promise<LocationEntry[]>;
    partnerLookup(): Promise<PartnerLookupEntry[]>;
    partnerGet(id: number): Promise<PartnerEntry>;
    partnerCreate(data: PartnerCreateEntry): Promise<number>;
    partnerUpdate(data: PartnerUpdateEntry): Promise<number>;
    reportPartnerList(): Promise<ReportPartnerList[]>;
    reportPartnerStock(id: number): Promise<ReportPartnerStock[]>;
    reportPartnerHistory(id: number): Promise<ReportPartnerHistory[]>;
    reportHistory(filter: ReportHistoryParameters): Promise<ReportHistoryEntry[]>;
    reportStock(filter: ReportStockParameters): Promise<ReportStockEntry[]>;
};

export interface DocumentServices {
    generateLoad(id: string): Promise<void>;    
};