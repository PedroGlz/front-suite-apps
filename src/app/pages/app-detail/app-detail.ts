import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PortalApi } from '../../core/portal.api';
import { PortalApplication, Version } from '../../core/models';
import { PortalHeader } from '../../shared/portal-header/portal-header';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-detail',
  imports: [DatePipe, DecimalPipe, RouterLink, PortalHeader, ButtonModule, TagModule],
  templateUrl: './app-detail.html',
  styleUrl: './app-detail.scss'
})
export class AppDetailPage {
  private readonly api = inject(PortalApi);
  private readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';
  readonly app = signal<PortalApplication | null>(null);
  readonly versions = signal<Version[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly downloading = signal<string | null>(null);

  constructor() {
    forkJoin({ app: this.api.app(this.id), versions: this.api.versions(this.id) }).subscribe({
      next: value => {
        this.app.set(value.app);
        this.versions.set(value.versions);
        this.loading.set(false);
      },
      error: response => {
        this.loading.set(false);
        this.error.set(response.status === 404 ? 'No tienes acceso a esta aplicación.' : 'No se pudo cargar la aplicación.');
      }
    });
  }

  download(version: Version): void {
    this.downloading.set(version.id);
    this.error.set('');
    this.api.download(version.id).subscribe({
      next: blob => {
        this.downloading.set(null);
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${this.app()?.code ?? 'etic'}-${version.versionCode}.apk`;
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
