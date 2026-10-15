import { apiErrorMessage } from '../../core/api-error';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ThemeService } from '../../core/theme.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly theme = inject(ThemeService);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly recovery = signal(false);
  readonly passwordChange = signal(false);
  temporaryPassword = '';
  newPassword = '';
  confirmation = '';
  readonly form = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: Validators.required }),
    password: new FormControl('', { nonNullable: true, validators: Validators.required })
  });

  submit(): void {
    if (this.busy()) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.busy.set(true);
    this.error.set('');
    const { username, password } = this.form.getRawValue();
    this.auth.login(username, password).subscribe({
      next: result => { this.busy.set(false); if(result.passwordChangeRequired){this.temporaryPassword=password;this.passwordChange.set(true);}else void this.router.navigateByUrl('/apps'); },
      error: (error: HttpErrorResponse) => {
        this.busy.set(false);
        this.error.set(error.status === 0
          ? 'No se pudo conectar con el servidor. Comprueba que esté disponible y revisa CORS.'
          : apiErrorMessage(error, 'No fue posible iniciar sesión.'));
      }
    });
  }
  requestReset():void{const identifier=this.form.controls.username.value.trim();if(!identifier){this.error.set('Ingresa tu correo electrónico o nombre de usuario.');return;}this.busy.set(true);this.auth.requestPasswordReset(identifier).subscribe({next:r=>{this.busy.set(false);this.recovery.set(false);this.error.set(r.message);},error:()=>{this.busy.set(false);this.recovery.set(false);this.error.set('Si los datos corresponden a una cuenta registrada, tu solicitud será revisada por soporte.');}});}
  changePassword():void{if(this.busy()||this.newPassword.length<8||this.newPassword!==this.confirmation)return;this.busy.set(true);this.auth.changeRequiredPassword(this.temporaryPassword,this.newPassword).subscribe({next:()=>{this.busy.set(false);this.passwordChange.set(false);this.form.reset();this.temporaryPassword='';this.newPassword='';this.confirmation='';this.error.set('Contraseña actualizada. Inicia sesión nuevamente.');},error:e=>{this.busy.set(false);this.error.set(apiErrorMessage(e,'No fue posible actualizar la contraseña.'));}});}
}
