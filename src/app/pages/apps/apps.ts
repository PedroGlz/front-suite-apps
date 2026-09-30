import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortalApi } from '../../core/portal.api';
import { PortalApplication } from '../../core/models';
import { PortalHeader } from '../../shared/portal-header/portal-header';
import { DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { Version } from '../../core/models';

@Component({
  selector: 'app-apps',
  imports: [RouterLink, PortalHeader, DatePipe, ButtonModule, TagModule],
  templateUrl: './apps.html',
  styleUrl: './apps.scss'
})
export class AppsPage {
  private readonly api = inject(PortalApi);
  readonly apps = signal<PortalApplication[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly downloading = signal<string | null>(null);

  constructor() {
    this.api.apps().subscribe({
      next: apps => { this.apps.set(apps); this.loading.set(false); },
      error: response => {
        this.loading.set(false);
        this.error.set(response.status === 403 ? 'Tu usuario no está activo.' : 'No se pudo cargar el catálogo.');
      }
    });
  }

  download(version: Version, code: string): void {
    this.downloading.set(version.id);
    this.api.download(version.id).subscribe({
      next: blob => {
        this.downloading.set(null);
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${code}-${version.versionCode}.apk`;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      error: () => {
        this.downloading.set(null);
        this.error.set('Descarga denegada o archivo no disponible. Actualiza la página e inténtalo de nuevo.');
      }
    });
  }
}
