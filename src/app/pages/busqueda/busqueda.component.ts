import { Component, signal, computed, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BusquedaService } from '../../services/busqueda.service';

@Component({
  selector: 'app-busqueda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="busqueda-page">
      <!-- Hero -->
      <section class="hero">
        <div class="container">
          <div class="hero-content fade-in">
            <span class="badge badge-primary">Portal de Datos Abiertos</span>
            <h1 class="hero-title">Busca personas naturales o jurídicas en fuentes públicas</h1>
            <p class="hero-subtitle">
              NovaSAR consolida información de múltiples portales de datos abiertos.
              Busca por nombre, número de ID u observación.
            </p>

            <!-- Barra de búsqueda -->
            <div class="search-bar">
              <div class="search-input-wrap">
                <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="search"
                  placeholder="Nombre, número de ID o palabra clave..."
                  [ngModel]="termino()"
                  (ngModelChange)="termino.set($event)"
                  class="search-input"
                />
                @if (termino()) {
                  <button class="clear-btn" (click)="termino.set('')" aria-label="Limpiar búsqueda">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                }
              </div>
            </div>

            <!-- Estadísticas -->
            <div class="hero-stats">
              <div class="stat">
                <span class="stat-value">{{ busquedaService.total() }}</span>
                <span class="stat-label">Registros</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ busquedaService.fuentes().length }}</span>
                <span class="stat-label">Fuentes</span>
              </div>
              <div class="stat">
                <span class="stat-value">{{ resultados().length }}</span>
                <span class="stat-label">Resultados</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Filtros y Resultados -->
      <section class="resultados-section">
        <div class="container">
          <!-- Filtros -->
          <div class="filtros-bar">
            <div class="filtro-group">
              <label class="filtro-label">Tipo</label>
              <select [ngModel]="tipoFiltro()" (ngModelChange)="tipoFiltro.set($event)">
                <option value="">Todos</option>
                <option value="Natural">Persona Natural</option>
                <option value="Jurídica">Persona Jurídica</option>
              </select>
            </div>
            <div class="filtro-group">
              <label class="filtro-label">Fuente</label>
              <select [ngModel]="fuenteFiltro()" (ngModelChange)="fuenteFiltro.set($event)">
                <option value="">Todas las fuentes</option>
                @for (f of busquedaService.fuentes(); track f) {
                  <option [value]="f">{{ f }}</option>
                }
              </select>
            </div>
            <div class="filtro-group">
              <label class="filtro-label">Ordenar por</label>
              <select [ngModel]="ordenFiltro()" (ngModelChange)="ordenFiltro.set($event)">
                <option value="fecha-desc">Fecha (más reciente)</option>
                <option value="fecha-asc">Fecha (más antigua)</option>
                <option value="nombre-asc">Nombre (A-Z)</option>
                <option value="nombre-desc">Nombre (Z-A)</option>
              </select>
            </div>
            @if (hayFiltros()) {
              <button class="btn btn-secondary limpiar-btn" (click)="limpiarFiltros()">
                Limpiar filtros
              </button>
            }
          </div>

          <!-- Estado de carga -->
          @if (busquedaService.cargando()) {
            <div class="loading-state">
              <div class="skeleton-card"></div>
              <div class="skeleton-card"></div>
              <div class="skeleton-card"></div>
            </div>
          }

          <!-- Error -->
          @if (busquedaService.error()) {
            <div class="error-state">
              <p>{{ busquedaService.error() }}</p>
            </div>
          }

          <!-- Estado inicial: aún no se ha realizado ninguna búsqueda -->
          @if (!busquedaService.cargando() && !busquedaService.error() && !hayBusqueda()) {
            <div class="empty-state fade-in">
              <div class="empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <h3>Empieza tu búsqueda</h3>
              <p>Escribe un nombre, número de ID o palabra clave, o usa los filtros para consultar las fuentes disponibles.</p>
            </div>
          }

          <!-- Sin resultados -->
          @if (!busquedaService.cargando() && !busquedaService.error() && hayBusqueda() && resultados().length === 0) {
            <div class="empty-state fade-in">
              <div class="empty-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <h3>No se encontraron resultados</h3>
              <p>Intenta con otros términos de búsqueda o ajusta los filtros.</p>
            </div>
          }

          <!-- Resultados -->
          @if (!busquedaService.cargando() && !busquedaService.error() && hayBusqueda() && resultados().length > 0) {
            <div class="resultados-grid fade-in">
              @for (r of resultados(); track r.numeroId + r.fechaHecho; let i = $index) {
                <article class="card resultado-card" [style.animation-delay]="i * 0.05 + 's'">
                  <div class="card-header">
                    <div class="card-tipo">
                      <span class="badge" [class.badge-primary]="r.tipo === 'Jurídica'" [class.badge-success]="r.tipo === 'Natural'">
                        {{ r.tipo === 'Jurídica' ? 'Jurídica' : 'Natural' }}
                      </span>
                    </div>
                    <span class="card-fecha">{{ r.fechaHecho | date: 'dd MMM yyyy' }}</span>
                  </div>
                  <h3 class="card-nombre">{{ r.nombre }}</h3>
                  <div class="card-id">
                    <span class="id-label">ID:</span>
                    <span class="id-value">{{ r.numeroId }}</span>
                  </div>
                  <p class="card-observacion">{{ r.observacion }}</p>
                  @if (r.citaFuente) {
                    <p class="card-cita-fuente">{{ r.citaFuente }}</p>
                  }
                  <div class="card-footer">
                    <div class="card-fuente">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      </svg>
                      <span>{{ r.fuente }}</span>
                    </div>
                    <a [href]="r.link" target="_blank" rel="noopener noreferrer" class="card-link">
                      Ver fuente
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M7 17l9.2-9.2M17 17V7H7"></path>
                      </svg>
                    </a>
                  </div>
                </article>
              }
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .busqueda-page {
        min-height: 60vh;
      }

      /* Hero */
      .hero {
        background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-secondary-light) 100%);
        padding: 64px 0 48px;
        border-bottom: 1px solid var(--color-border);
      }

      .hero-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 20px;
      }

      .hero-title {
        font-size: 36px;
        font-weight: 700;
        line-height: 1.2;
        color: var(--color-neutral-900);
        max-width: 720px;
        letter-spacing: -0.02em;
      }

      .hero-subtitle {
        font-size: 17px;
        color: var(--color-neutral-600);
        max-width: 580px;
        line-height: 1.6;
      }

      .search-bar {
        width: 100%;
        max-width: 640px;
        margin-top: 8px;
      }

      .search-input-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }

      .search-icon {
        position: absolute;
        left: 16px;
        color: var(--color-neutral-400);
        pointer-events: none;
        z-index: 1;
      }

      .search-input {
        width: 100%;
        padding: 16px 48px 16px 48px;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        background: var(--color-surface);
        font-size: 16px;
        box-shadow: var(--shadow-md);
        outline: none;
        transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
      }

      .search-input:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 4px rgba(15, 108, 189, 0.12), var(--shadow-md);
      }

      .clear-btn {
        position: absolute;
        right: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        color: var(--color-neutral-400);
        transition: all var(--transition-fast);
      }

      .clear-btn:hover {
        background-color: var(--color-neutral-100);
        color: var(--color-neutral-600);
      }

      .hero-stats {
        display: flex;
        gap: 40px;
        margin-top: 16px;
      }

      .stat {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: var(--color-primary);
      }

      .stat-label {
        font-size: 13px;
        color: var(--color-neutral-500);
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      /* Filtros */
      .resultados-section {
        padding: 32px 0 64px;
      }

      .filtros-bar {
        display: flex;
        align-items: flex-end;
        gap: 16px;
        margin-bottom: 32px;
        flex-wrap: wrap;
      }

      .filtro-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 180px;
      }

      .filtro-label {
        font-size: 13px;
        font-weight: 600;
        color: var(--color-neutral-600);
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }

      .filtro-group select {
        padding: 10px 14px;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-md);
        background: var(--color-surface);
        font-size: 14px;
        outline: none;
        transition: border-color var(--transition-fast);
      }

      .filtro-group select:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(15, 108, 189, 0.12);
      }

      .limpiar-btn {
        height: 42px;
      }

      /* Loading */
      .loading-state {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .skeleton-card {
        height: 180px;
        border-radius: var(--radius-lg);
        animation: shimmer 2s infinite linear;
        background: linear-gradient(90deg, var(--color-neutral-100) 25%, var(--color-neutral-200) 50%, var(--color-neutral-100) 75%);
        background-size: 1000px 100%;
      }

      /* Error */
      .error-state {
        text-align: center;
        padding: 48px;
        color: var(--color-error);
        background: var(--color-error-light);
        border-radius: var(--radius-lg);
      }

      /* Empty */
      .empty-state {
        text-align: center;
        padding: 64px 24px;
        color: var(--color-neutral-500);
      }

      .empty-icon {
        display: flex;
        justify-content: center;
        margin-bottom: 16px;
        color: var(--color-neutral-300);
      }

      .empty-state h3 {
        font-size: 20px;
        color: var(--color-neutral-700);
        margin-bottom: 8px;
      }

      .empty-state p {
        font-size: 15px;
      }

      /* Resultados grid */
      .resultados-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        gap: 20px;
      }

      .resultado-card {
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        opacity: 0;
        animation: fadeIn 0.4s ease both;
      }

      .resultado-card:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .card-fecha {
        font-size: 13px;
        color: var(--color-neutral-500);
        font-weight: 500;
      }

      .card-nombre {
        font-size: 18px;
        font-weight: 600;
        color: var(--color-neutral-900);
        line-height: 1.3;
      }

      .card-id {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .id-label {
        font-size: 13px;
        color: var(--color-neutral-500);
        font-weight: 500;
      }

      .id-value {
        font-size: 13px;
        color: var(--color-neutral-800);
        font-weight: 600;
        font-family: 'Courier New', monospace;
        background: var(--color-neutral-100);
        padding: 2px 8px;
        border-radius: var(--radius-sm);
      }

      .card-observacion {
        font-size: 14px;
        color: var(--color-neutral-600);
        line-height: 1.5;
        flex: 1;
      }

      .card-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 12px;
        border-top: 1px solid var(--color-border);
        gap: 8px;
      }

      .card-fuente {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--color-neutral-500);
      }

      .card-link {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        font-weight: 600;
        color: var(--color-primary);
        transition: gap var(--transition-fast);
      }
      .card-cita-fuente {
        font-size: 12px;
        color: var(--color-neutral-500);
        line-height: 1.4;
        font-style: italic;
        padding-top: 4px;
      }
      .card-link:hover {
        gap: 8px;
        color: var(--color-primary-dark);
      }

      @media (max-width: 768px) {
        .hero {
          padding: 40px 0 32px;
        }
        .hero-title {
          font-size: 26px;
        }
        .hero-subtitle {
          font-size: 15px;
        }
        .hero-stats {
          gap: 24px;
        }
        .stat-value {
          font-size: 22px;
        }
        .filtros-bar {
          flex-direction: column;
          align-items: stretch;
        }
        .filtro-group {
          min-width: 100%;
        }
        .limpiar-btn {
          width: 100%;
        }
        .resultados-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class BusquedaComponent implements OnInit {
  busquedaService = inject(BusquedaService);

  termino = signal('');
  tipoFiltro = signal('');
  fuenteFiltro = signal('');
  ordenFiltro = signal('fecha-desc');

  // true cuando el usuario ya escribió un término o aplicó algún filtro
  hayBusqueda = computed(
    () =>
      this.termino().trim() !== '' ||
      this.tipoFiltro() !== '' ||
      this.fuenteFiltro() !== ''
  );

  resultados = computed(() => {
    // Mientras no haya término ni filtros, no se listan registros
    if (!this.hayBusqueda()) {
      return [];
    }
    return this.busquedaService.buscar(
      this.termino(),
      this.tipoFiltro(),
      this.fuenteFiltro(),
      this.ordenFiltro()
    );
  });

  hayFiltros = computed(
    () =>
      this.termino().trim() !== '' ||
      this.tipoFiltro() !== '' ||
      this.fuenteFiltro() !== '' ||
      this.ordenFiltro() !== 'fecha-desc'
  );

  ngOnInit(): void {
    this.busquedaService.cargarDatos();
  }

  limpiarFiltros(): void {
    this.termino.set('');
    this.tipoFiltro.set('');
    this.fuenteFiltro.set('');
    this.ordenFiltro.set('fecha-desc');
  }
}