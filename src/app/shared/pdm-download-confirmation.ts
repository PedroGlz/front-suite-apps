import { DestroyRef, inject, Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { ThemeService } from '../core/theme.service';

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
        title: 'Respalda tus datos de ETIC PdM',
        text: 'Antes de instalar esta actualización, respalda tu información de ETIC PdM. La información guardada en el dispositivo se borrará durante la instalación. Para crear un respaldo, abre ETIC PdM y ve al menú de la aplicación → Generar respaldo.',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Continuar en 4…',
        focusCancel: true,
        preConfirm: () => performance.now() >= deadline,
        willOpen: element => {
          popup = element;
          const button = Swal.getConfirmButton();
          if (button) button.disabled = true;
        },
        didOpen: element => {
          const button = Swal.getConfirmButton();
          if (this.destroyRef.destroyed || Swal.getPopup() !== element || !button) return;

          const status = document.createElement('span');
          status.setAttribute('role', 'status');
          status.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)';
          element.append(status);

          const progress = document.createElement('span');
          progress.setAttribute('aria-hidden', 'true');
          progress.style.cssText = 'position:absolute;inset:auto 0 0;height:3px;background:currentColor;pointer-events:none;transform-origin:left';
          button.style.position = 'relative';
          const label = document.createTextNode('Continuar en 4…');
          button.replaceChildren(label);
          deadline = performance.now() + 4000;
          if (typeof progress.animate === 'function' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            button.append(progress);
            animation = progress.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 4000, fill: 'forwards' });
          }

          const update = () => {
            const seconds = Math.max(0, Math.ceil((deadline - performance.now()) / 1000));
            const message = seconds ? `Continuar en ${seconds}…` : 'Continuar';
            if (label.data !== message || !status.textContent) {
              label.data = message;
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
        willClose: cleanup,
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
