import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../Service/auth-service';
import Swal from 'sweetalert2';
import { loginRequest } from '../../interfaces/LoginDTO/loginRequest';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login implements OnInit {

  loginForm!: FormGroup;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      identificador: ['', [Validators.required]],    // email o username
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const payload: loginRequest = {
      Identificador: this.loginForm.value.identificador,
      Password: this.loginForm.value.password
    };

    this.authService.login(payload).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Bienvenido!',
          text: 'Has iniciado sesión exitosamente.',
          showConfirmButton: false,
          timer: 1500
        }).then(() => {
          this.router.navigate(['/app/ventas']);
        });
      },
      error: (err) => {
        this.submitting = false;

        let errorMessage = 'Error desconocido.';
        if (err.status === 401) {
          errorMessage = 'Usuario o contraseña incorrectos.';
        }

        Swal.fire({
          icon: 'error',
          title: 'Error de Acceso',
          text: errorMessage
        });

        console.error('Error de Login:', err);
      },
      complete: () => {
        this.submitting = false;
      }
    });
  }

  get f() {
    return this.loginForm.controls;
  }
}
