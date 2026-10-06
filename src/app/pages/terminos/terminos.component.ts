import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terminos',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="legal-page">
      <div class="container">
        <div class="legal-header fade-in">
          <span class="badge badge-primary">Legal</span>
          <h1>Términos y Condiciones</h1>
          <p class="legal-fecha">Última actualización: septiembre 2026</p>
        </div>

        <div class="legal-content fade-in">
          <section class="legal-section">
            <h2>1. Aceptación de los términos</h2>
            <p>
              El acceso y uso de NovaSAR implica la aceptación plena de estos términos y condiciones.
              Si no está de acuerdo con alguno de los términos aquí establecidos, le recomendamos
              no utilizar la plataforma.
            </p>
          </section>

          <section class="legal-section">
            <h2>2. Descripción del servicio</h2>
            <p>
              NovaSAR es un motor de búsqueda que consolida y presenta información proveniente de
              múltiples portales públicos de datos abiertos. La plataforma permite buscar personas
              naturales o jurídicas por nombre, número de ID u observación, mostrando los resultados
              con su respectiva fuente y enlace al origen.
            </p>
            <p>
              NovaSAR no genera, modifica ni valida la información mostrada. Actúa únicamente como
              agregador de datos públicos ya publicados por entidades oficiales.
            </p>
          </section>

          <section class="legal-section">
            <h2>3. Uso permitido</h2>
            <p>
              El usuario se compromete a utilizar NovaSAR exclusivamente para fines legítimos de
              consulta y búsqueda de información pública. Queda prohibido:
            </p>
            <ul class="legal-list">
              <li>Utilizar la información para fines ilícitos, discriminatorios o de acoso.</li>
              <li>Realizar scraping automatizado masivo que afecte el funcionamiento de la plataforma.</li>
              <li>Suplantar la identidad de personas o entidades listadas en los resultados.</li>
              <li>Utilizar los datos para campañas de spam, fraude o extorsión.</li>
            </ul>
          </section>

          <section class="legal-section">
            <h2>4. Origen de los datos</h2>
            <p>
              Toda la información mostrada en NovaSAR proviene de portales de datos abiertos
              publicados por entidades estatales y organismos oficiales. Cada registro incluye
              el nombre de la fuente y un enlace directo al portal original, de modo que el
              usuario pueda verificar la información en su contexto completo.
            </p>
          </section>

          <section class="legal-section">
            <h2>5. Exactitud y responsabilidad</h2>
            <p>
              NovaSAR no garantiza la exactitud, integridad o actualidad de los datos mostrados,
              ya que estos son responsabilidad exclusiva de las entidades que los publican en los
              portales de datos abiertos. NovaSAR no se hace responsable de decisiones tomadas
              por los usuarios con base en la información consultada.
            </p>
            <p>
              Para reportar errores o solicitar correcciones, el usuario debe contactar directamente
              a la entidad responsable de la fuente original indicada en cada registro.
            </p>
          </section>

          <section class="legal-section">
            <h2>6. Disponibilidad del servicio</h2>
            <p>
              NovaSAR se esfuerza por mantener la plataforma disponible de forma continua, pero
              no garantiza acceso ininterrumpido. El servicio puede ser suspendido temporalmente
              por tareas de mantenimiento, actualización o por causas técnicas fuera de nuestro control.
            </p>
          </section>

          <section class="legal-section">
            <h2>7. Propiedad intelectual</h2>
            <p>
              NovaSAR no reclama derechos de propiedad sobre los datos mostrados, ya que estos
              pertenecen a las fuentes públicas originales. El diseño, la interfaz y la funcionalidad
              de la plataforma son propiedad de NovaSAR.
            </p>
          </section>

          <section class="legal-section">
            <h2>8. Modificaciones</h2>
            <p>
              NovaSAR se reserva el derecho de modificar estos términos y condiciones en cualquier
              momento. Las modificaciones entrarán en vigor desde su publicación en esta página.
              Recomendamos al usuario revisar periódicamente este documento.
            </p>
          </section>

          <section class="legal-section">
            <h2>9. Legislación aplicable</h2>
            <p>
              Estos términos se rigen por la legislación aplicable en la jurisdicción donde opera
              la plataforma. Cualquier disputa se resolverá ante los tribunales competentes
              correspondientes.
            </p>
          </section>

          <div class="legal-nav">
            <a routerLink="/privacidad" class="btn btn-secondary">Ver Política de Privacidad</a>
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
      .legal-list {
        margin: 12px 0 12px 20px;
        list-style: disc;
      }
      .legal-list li {
        font-size: 15px;
        color: var(--color-neutral-600);
        line-height: 1.7;
        margin-bottom: 6px;
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
export class TerminosComponent {}
