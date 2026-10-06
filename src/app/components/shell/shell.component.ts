import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { BusquedaService } from '../../services/busqueda.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <header class="header">
        <div class="container header-inner">
          <a routerLink="/" class="logo">
            <span class="logo-icon">N</span>
            <span class="logo-text">Nova<span class="logo-accent">SAR</span></span>
          </a>
          <nav class="nav">
            <a
              routerLink="/"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="nav-link"
            >
              Buscar
            </a>
            <a routerLink="/privacidad" routerLinkActive="active" class="nav-link">
              Privacidad
            </a>
            <a routerLink="/terminos" routerLinkActive="active" class="nav-link">
              Términos
            </a>
          </nav>
          <div class="header-badge">
            <span class="badge badge-success">Datos Abiertos</span>
          </div>
        </div>
      </header>

      <main class="main-content">
        <router-outlet />
      </main>

      <footer class="footer">
        <div class="container footer-inner">
          <div class="footer-brand">
            <span class="logo-icon small">N</span>
            <span class="footer-name">NovaSAR</span>
          </div>
          <p class="footer-desc">
            Plataforma de búsqueda de datos abiertos de personas naturales y jurídicas.
            Toda la información proviene de fuentes públicas de datos abiertos.
          </p>
          <nav class="footer-nav">
            <a routerLink="/" class="footer-link">Buscar</a>
            <a routerLink="/privacidad" class="footer-link">Política de Privacidad</a>
            <a routerLink="/terminos" class="footer-link">Términos y Condiciones</a>
          </nav>
          <p class="footer-copy">© 2026 NovaSAR. Datos provenientes de portales de datos abiertos públicos.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [
    `
      .app-shell {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      .header {
        background: var(--color-surface);
        border-bottom: 1px solid var(--color-border);
        position: sticky;
        top: 0;
        z-index: 100;
        backdrop-filter: blur(8px);
      }

      .header-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 64px;
        gap: 16px;
      }

      .logo {
        display: flex;
        align-items: center;
        gap: 10px;
        text-decoration: none;
        color: var(--color-text);
      }

      .logo-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
        color: #fff;
        border-radius: var(--radius-md);
        font-weight: 700;
        font-size: 18px;
        flex-shrink: 0;
      }

      .logo-icon.small {
        width: 28px;
        height: 28px;
        font-size: 14px;
      }

      .logo-text {
        font-size: 20px;
        font-weight: 700;
        letter-spacing: -0.02em;
      }

      .logo-accent {
        color: var(--color-primary);
      }

      .nav {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .nav-link {
        padding: 8px 16px;
        border-radius: var(--radius-md);
        font-size: 15px;
        font-weight: 500;
        color: var(--color-neutral-600);
        transition: all var(--transition-fast);
      }

      .nav-link:hover {
        background-color: var(--color-neutral-100);
        color: var(--color-neutral-800);
      }

      .nav-link.active {
        background-color: var(--color-primary-light);
        color: var(--color-primary-dark);
      }

      .header-badge {
        display: flex;
        align-items: center;
      }

      .main-content {
        flex: 1;
      }

      .footer {
        background: var(--color-neutral-900);
        color: var(--color-neutral-300);
        padding: 48px 0 32px;
        margin-top: auto;
      }

      .footer-inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 16px;
        text-align: center;
      }

      .footer-brand {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .footer-name {
        font-size: 18px;
        font-weight: 700;
        color: #fff;
      }

      .footer-desc {
        max-width: 560px;
        font-size: 14px;
        line-height: 1.6;
        color: var(--color-neutral-400);
      }

      .footer-nav {
        display: flex;
        gap: 24px;
        flex-wrap: wrap;
        justify-content: center;
      }

      .footer-link {
        font-size: 14px;
        color: var(--color-neutral-400);
        transition: color var(--transition-fast);
      }

      .footer-link:hover {
        color: #fff;
      }

      .footer-copy {
        font-size: 13px;
        color: var(--color-neutral-500);
        padding-top: 16px;
        border-top: 1px solid var(--color-neutral-800);
        width: 100%;
        max-width: 600px;
      }

      @media (max-width: 768px) {
        .header-inner {
          flex-wrap: wrap;
          height: auto;
          padding: 12px 16px;
        }
        .header-badge {
          order: 3;
          width: 100%;
          justify-content: center;
        }
        .nav {
          gap: 2px;
        }
        .nav-link {
          padding: 6px 10px;
          font-size: 14px;
        }
      }
    `,
  ],
})
export class ShellComponent {
  constructor(public busquedaService: BusquedaService) {}
}
