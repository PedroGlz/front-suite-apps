import { DestroyRef, inject, Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { ThemeService } from '../core/theme.service';

const WAIT_SECONDS = 10;
const SECOND_MS = 1000;
const WAIT_MS = WAIT_SECONDS * SECOND_MS;
const INITIAL_LABEL = `Continuar en ${WAIT_SECONDS} s`;

@Injectable()
export class PdmDownloadConfirmation {
  private readonly destroyRef = inject(DestroyRef);
  private readonly theme = inject(ThemeService);
  private pending = false;

  async confirm(): Promise<boolean> {
    if (this.pending) return false;
    this.pending = true;

    let deadline = Infinity;
    let interval: ReturnType<typeof setInterval> | undefined;
    let animation: Animation | undefined;
    let popup: HTMLElement | null = null;
    const cleanup = () => {
      clearInterval(interval);
      animation?.cancel();
    };
    const unregister = this.destroyRef.onDestroy(() => {
      cleanup();
      if (popup && Swal.getPopup() === popup) Swal.close();
    });

    try {
      const result = await Swal.fire({
        theme: this.theme.mode(),
        icon: 'warning',
        title: '<span style="display:block;text-align:start">Respalda tu información antes de actualizar</span>',
        html: `
          <div style="text-align:start;line-height:1.55">
            <p style="margin:0 0 1rem;padding:.75rem 1rem;border-inline-start:4px solid #d97706;border-radius:.375rem;background:rgba(217,119,6,.12)">
              La instalación de esta actualización <strong>borrará la información guardada en ETIC PdM</strong> en tu tablet.
            </p>
            <p style="margin:0 0 .5rem">Antes de continuar, <strong>genera un respaldo</strong> desde la aplicación:</p>
            <ol style="margin:0;padding-inline-start:1.5rem;list-style:decimal">
              <li>Abre ETIC PdM.</li>
              <li style="margin-block:.35rem">Entra al menú.</li>
              <li>Selecciona <strong>“Generar respaldo”</strong>.</li>
               <li>Comprueba que el archivo se haya generado en <strong>ETIC/Respaldos/</strong>.</li>
            </ol>
          </div>
        `,
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: INITIAL_LABEL,
        focusCancel: true,
        preConfirm: () => performance.now() >= deadline,
        willOpen: element => {
          popup = element;
          const button = Swal.getConfirmButton();
          if (button) {
            button.disabled = true;
            button.style.flexShrink = '0';
            button.style.whiteSpace = 'nowrap';
            button.style.fontVariantNumeric = 'tabular-nums';
          }
        },
        didOpen: element => {
          const button = Swal.getConfirmButton();
          if (this.destroyRef.destroyed || popup !== element || !button) return;

          const status = document.createElement('span');
          status.setAttribute('role', 'status');
          status.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)';
          element.append(status);

          const progress = document.createElement('span');
          progress.setAttribute('aria-hidden', 'true');
          progress.style.cssText = 'position:absolute;inset:0;background:currentColor;opacity:.22;pointer-events:none;transform-origin:left';
          button.style.position = 'relative';
          button.style.overflow = 'hidden';

          const labelSlot = document.createElement('span');
          labelSlot.style.cssText = 'display:inline-grid;position:relative';
          const widthReference = document.createElement('span');
          widthReference.setAttribute('aria-hidden', 'true');
          widthReference.style.cssText = 'grid-area:1 / 1;visibility:hidden';
          widthReference.textContent = INITIAL_LABEL;
          const label = document.createElement('span');
          label.style.gridArea = '1 / 1';
          label.textContent = INITIAL_LABEL;
          labelSlot.append(widthReference, label);
          button.replaceChildren(labelSlot);

          deadline = performance.now() + WAIT_MS;
          if (typeof progress.animate === 'function' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            button.prepend(progress);
            animation = progress.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: WAIT_MS, fill: 'forwards' });
          }

          const update = () => {
            const seconds = Math.max(0, Math.ceil((deadline - performance.now()) / SECOND_MS));
            const message = seconds ? `Continuar en ${seconds} s` : 'Continuar';
            if (label.textContent !== message || !status.textContent) {
              label.textContent = message;
              status.textContent = seconds ? message : 'Continuar habilitado';
            }
            if (seconds === 0) {
              cleanup();
              progress.remove();
              button.disabled = false;
            }
          };
          interval = setInterval(update, 100);
          update();
        },
        willClose: () => {
          popup = null;
          cleanup();
        },
        didDestroy: () => {
          cleanup();
          popup = null;
        }
      });
      return result.isConfirmed && !this.destroyRef.destroyed;
    } finally {
      cleanup();
      if (!this.destroyRef.destroyed) unregister();
      this.pending = false;
    }
  }
}
