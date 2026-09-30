import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ThemeService } from '../../core/theme.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly theme = inject(ThemeService);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly form = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: Validators.required }),
    password: new FormControl('', { nonNullable: true, validators: Validators.required })
  });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.busy.set(true);
    this.error.set('');
    const { username, password } = this.form.getRawValue();
    this.auth.login(username, password).subscribe({
      next: () => { this.busy.set(false); void this.router.navigateByUrl('/apps'); },
      error: (error: HttpErrorResponse) => {
        this.busy.set(false);
        const detail = typeof error.error?.detail === 'string' ? error.error.detail : null;
        this.error.set(error.status === 0
          ? 'No se pudo conectar con el servidor. Comprueba que esté disponible y revisa CORS.'
          : detail ?? (error.status === 401 ? 'Usuario o contraseña incorrectos' : `Error HTTP ${error.status} al iniciar sesión.`));
      }
    });
  }
}
