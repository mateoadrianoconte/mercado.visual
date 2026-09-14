export type CatalogItemType = 'LIFE' | 'EQUIPMENT' | 'BUFF';
export type CatalogItemStatus = 'AVAILABLE' | 'SOLD_OUT' | 'LOCKED';
export type CatalogItemFamily = 'SHIELD' | 'EXPERIENCE' | 'COINS' | 'LIVES';
export type CatalogItemAccent = 'PURPLE' | 'PINK' | 'YELLOW' | 'CYAN';

export interface CatalogItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly fullDescription: string;
  readonly type: CatalogItemType;
  readonly family: CatalogItemFamily;
  readonly tier?: string;
  readonly price: number;
  readonly icon: string;
  readonly accent: CatalogItemAccent;
  readonly imageUrl: string;
  readonly imageAlt: string;
  readonly status: CatalogItemStatus;
  readonly effect?: string;
}
