import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ThemeService } from '../../core/theme.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-portal-header',
  imports: [RouterLink, ButtonModule],
  templateUrl: './portal-header.html',
  styleUrl: './portal-header.scss'
})
export class PortalHeader {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  readonly error = signal('');
  private readonly router = inject(Router);
  logout(): void {
    this.auth.logout().subscribe({
      next: () => void this.router.navigateByUrl('/login'),
      error: () => this.error.set('No se pudo cerrar la sesión. Inténtalo de nuevo.')
    });
  }
}
