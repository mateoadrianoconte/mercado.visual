import { ChangeDetectionStrategy, Component, HostListener, inject, signal, computed } from '@angular/core';
import { CatalogService } from './catalog/catalog.service';
import { CatalogItem, CatalogItemFamily, CatalogItemType } from './catalog/catalog-item.model';

type CatalogFilter = 'ALL' | CatalogItemType | CatalogItemFamily;
type ThemeName = 'serigraphy-light' | 'arcade-dark';

interface CatalogSection {
  readonly family: CatalogItemFamily;
  readonly title: string;
  readonly kicker: string;
  readonly items: readonly CatalogItem[];
}

interface PurchasePreview {
  readonly item: CatalogItem;
  readonly previousBalance: number;
  readonly nextBalance: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  private readonly catalogService = inject(CatalogService);

  protected readonly items = this.catalogService.getItems();
  protected readonly balance = signal(860);
  protected readonly lives = signal(2);
  protected readonly selectedFilter = signal<CatalogFilter>('ALL');
  protected readonly searchTerm = signal('');
  protected readonly selectedItemId = signal<string | null>(null);
  protected readonly modalItem = signal<CatalogItem | null>(null);
  protected readonly purchasePreview = signal<PurchasePreview | null>(null);
  protected readonly feedback = signal('Catalogo listo. Elegi un item para revisar la compra.');
  protected readonly theme = signal<ThemeName>(this.preferredTheme());
  protected readonly families: readonly Omit<CatalogSection, 'items'>[] = [
    { family: 'SHIELD', title: 'Familia de Escudo', kicker: 'Defensa contra fallos' },
    { family: 'EXPERIENCE', title: 'Familia de Experiencia', kicker: 'Multiplicadores de XP' },
    { family: 'COINS', title: 'Familia de Monedas', kicker: 'Bonificadores de economia' },
    { family: 'LIVES', title: 'Familia de Vidas', kicker: 'Recuperacion directa' }
  ];

  protected readonly filteredItems = computed(() => {
    const filter = this.selectedFilter();
    const query = this.searchTerm().trim().toLowerCase();
    const byFilter =
      filter === 'ALL'
        ? this.items
        : this.items.filter((item) => item.type === filter || item.family === filter);

    if (!query) {
      return byFilter;
    }

    return byFilter.filter((item) => {
      const searchable = `${item.name} ${item.description} ${item.effect ?? ''}`.toLowerCase();
      return searchable.includes(query);
    });
  });

  protected readonly catalogSections = computed<readonly CatalogSection[]>(() => {
    const visibleItems = this.filteredItems();

    return this.families
      .map((section) => ({
        ...section,
        items: visibleItems.filter((item) => item.family === section.family)
      }))
      .filter((section) => section.items.length > 0);
  });

  protected readonly selectedItem = computed(() => {
    const id = this.selectedItemId();
    return this.items.find((item) => item.id === id) ?? null;
  });

  protected setFilter(filter: CatalogFilter): void {
    this.selectedFilter.set(filter);
    this.selectedItemId.set(null);
    this.purchasePreview.set(null);
    this.feedback.set(filter === 'ALL' ? 'Mostrando todo el mercado.' : `Filtro activo: ${this.filterLabel(filter)}.`);
  }

  protected updateSearch(value: string): void {
    this.searchTerm.set(value);
    this.selectedItemId.set(null);
    this.purchasePreview.set(null);
    this.feedback.set(value.trim() ? `Buscando: ${value.trim()}.` : 'Catalogo listo.');
  }

  protected selectItem(item: CatalogItem): void {
    this.selectedItemId.set(item.id);
    this.purchasePreview.set(null);
    this.openItemModal(item);
  }

  protected openItemModal(item: CatalogItem): void {
    this.selectedItemId.set(item.id);
    this.modalItem.set(item);
    this.setDocumentScrollLock(true);
    this.feedback.set(`Detalle abierto: ${item.name}.`);
  }

  protected closeItemModal(): void {
    this.modalItem.set(null);
    this.purchasePreview.set(null);
    this.setDocumentScrollLock(false);
    this.feedback.set('Detalle cerrado.');
  }

  protected buyModalItem(item: CatalogItem): void {
    if (item.status === 'SOLD_OUT') {
      this.feedback.set(`${item.name} esta agotado por ahora.`);
      return;
    }

    if (item.status === 'LOCKED') {
      this.feedback.set(`${item.name} todavia esta bloqueado.`);
      return;
    }

    if (item.price > this.balance()) {
      this.feedback.set(`Saldo insuficiente para ${item.name}.`);
      return;
    }

    this.balance.update((value) => value - item.price);
    if (item.type === 'LIFE') {
      this.lives.update((value) => value + 1);
    }
    this.closeItemModal();
    this.feedback.set(`Compra realizada: ${item.name}.`);
  }

  protected confirmPurchase(): void {
    const preview = this.purchasePreview();
    if (!preview) {
      return;
    }

    this.balance.set(preview.nextBalance);
    if (preview.item.type === 'LIFE') {
      this.lives.update((value) => value + (preview.item.id === 'life-pack-03' ? 3 : 1));
    }
    this.feedback.set(`Compra realizada: ${preview.item.name}.`);
    this.purchasePreview.set(null);
  }

  protected cancelPurchase(): void {
    this.purchasePreview.set(null);
    this.feedback.set('Compra cancelada. El saldo no cambio.');
  }

  protected toggleTheme(): void {
    this.theme.update((value) => (value === 'arcade-dark' ? 'serigraphy-light' : 'arcade-dark'));
  }

  protected typeLabel(type: CatalogItemType): string {
    if (type === 'LIFE') {
      return 'Vidas';
    }
    if (type === 'BUFF') {
      return 'Potenciadores';
    }
    return 'Equipamiento';
  }

  protected filterLabel(filter: Exclude<CatalogFilter, 'ALL'>): string {
    const family = this.families.find((section) => section.family === filter);
    return family?.title ?? this.typeLabel(filter as CatalogItemType);
  }

  protected statusLabel(item: CatalogItem): string {
    if (item.status === 'SOLD_OUT') {
      return 'Agotado';
    }
    if (item.status === 'LOCKED') {
      return 'Bloqueado';
    }
    if (item.price > this.balance()) {
      return 'Saldo insuficiente';
    }
    return 'Disponible';
  }

  protected canBuy(item: CatalogItem): boolean {
    return item.status === 'AVAILABLE' && item.price <= this.balance();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.modalItem()) {
      this.closeItemModal();
    }
  }

  private setDocumentScrollLock(isLocked: boolean): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.body.style.overflow = isLocked ? 'hidden' : '';
  }

  private preferredTheme(): ThemeName {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'arcade-dark';
    }
    return 'serigraphy-light';
  }
}
