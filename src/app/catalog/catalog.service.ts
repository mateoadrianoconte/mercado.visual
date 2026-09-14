import { Injectable } from '@angular/core';
import { CATALOG_ITEMS } from './catalog-data';
import { CatalogItem } from './catalog-item.model';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  getItems(): readonly CatalogItem[] {
    return CATALOG_ITEMS;
  }
}
