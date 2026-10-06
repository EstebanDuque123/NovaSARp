import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacidad',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="legal-page">
      <div class="container">
        <div class="legal-header fade-in">
          <span class="badge badge-primary">Legal</span>
          <h1>Política de Privacidad</h1>
          <p class="legal-fecha">Última actualización: septiembre 2026</p>
        </div>

        <div class="legal-content fade-in">
          <section class="legal-section">
            <h2>1. Información general</h2>
            <p>
              NovaSAR es una plataforma de búsqueda que consolida información proveniente
              exclusivamente de portales públicos de datos abiertos. Esta política de privacidad
              explica cómo funciona el tratamiento de la información en el uso de nuestra plataforma.
            </p>
          </section>

          <section class="legal-section">
            <h2>2. Naturaleza de los datos</h2>
            <p>
              Todos los datos mostrados en NovaSAR provienen de fuentes públicas de datos abiertos
              publicadas por entidades estatales y organismos oficiales. NovaSAR no recopila,
              almacena ni procesa datos personales propios de los usuarios que consulta la plataforma.
            </p>
            <p>
              La información mostrada incluye: nombre de la fuente, nombre de persona natural o jurídica,
              número de ID, fecha del hecho, observación y enlace a la fuente original.
            </p>
          </section>

          <section class="legal-section">
            <h2>3. Datos de navegación</h2>
            <p>
              NovaSAR no requiere registro ni inicio de sesión. No recopilamos datos personales
              identificativos de los usuarios que utilizan la plataforma. Las búsquedas realizadas
              no se almacenan ni se asocian a ningún usuario.
            </p>
          </section>

          <section class="legal-section">
            <h2>4. Uso de cookies</h2>
            <p>
              NovaSAR no utiliza cookies de seguimiento ni tecnologías de rastreo. La plataforma
              funciona sin necesidad de almacenar información en el navegador del usuario.
            </p>
          </section>

          <section class="legal-section">
            <h2>5. Enlaces a fuentes externas</h2>
            <p>
              Cada registro incluye un enlace directo a la fuente original de datos abiertos.
              Al hacer clic en estos enlaces, el usuario abandona NovaSAR y accede a un sitio
              externo. NovaSAR no se responsabiliza del contenido ni de las políticas de privacidad
              de los sitios externos.
            </p>
          </section>

          <section class="legal-section">
            <h2>6. Veracidad de los datos</h2>
            <p>
              NovaSAR muestra la información tal como fue publicada por las fuentes originales.
              No modificamos, filtramos ni alteramos los datos. Para cualquier corrección sobre
              la información mostrada, el usuario debe dirigirse directamente a la fuente original
              responsable de la publicación.
            </p>
          </section>

          <section class="legal-section">
            <h2>7. Derechos de los titulares de datos</h2>
            <p>
              Dado que NovaSAR consolida información de fuentes públicas de datos abiertos,
              cualquier solicitud relacionada con la modificación, corrección o eliminación de
              datos debe tramitarse directamente ante la entidad responsable de la fuente original.
              NovaSAR actúa únicamente como un agregador de búsqueda.
            </p>
          </section>

          <section class="legal-section">
            <h2>8. Contacto</h2>
            <p>
              Para consultas relacionadas con esta política de privacidad, puede contactarnos
              a través de los canales habilitados por la plataforma.
            </p>
          </section>

          <div class="legal-nav">
            <a routerLink="/terminos" class="btn btn-secondary">Ver Términos y Condiciones</a>
            <a routerLink="/" class="btn btn-primary">Volver a la búsqueda</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .legal-page {
        padding: 48px 0 64px;
      }
      .legal-header {
        text-align: center;
        margin-bottom: 40px;
      }
      .legal-header h1 {
        font-size: 32px;
        font-weight: 700;
        color: var(--color-neutral-900);
        margin: 12px 0 8px;
        letter-spacing: -0.02em;
      }
      .legal-fecha {
        font-size: 14px;
        color: var(--color-neutral-500);
      }
      .legal-content {
        max-width: 760px;
        margin: 0 auto;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-lg);
        padding: 48px;
        box-shadow: var(--shadow-sm);
      }
      .legal-section {
        margin-bottom: 32px;
      }
      .legal-section h2 {
        font-size: 20px;
        font-weight: 600;
        color: var(--color-neutral-900);
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--color-border);
      }
      .legal-section p {
        font-size: 15px;
        color: var(--color-neutral-600);
        line-height: 1.7;
        margin-bottom: 12px;
      }
      .legal-nav {
        display: flex;
        gap: 12px;
        justify-content: center;
        margin-top: 40px;
        padding-top: 32px;
        border-top: 1px solid var(--color-border);
        flex-wrap: wrap;
      }
      @media (max-width: 768px) {
        .legal-content {
          padding: 24px;
        }
        .legal-header h1 {
          font-size: 26px;
        }
      }
    `,
  ],
})
export class PrivacidadComponent {}
