import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import Swal from 'sweetalert2';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../Service/auth-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatFormFieldModule
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
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      identificador: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(4)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    const payload = {
      identificador: this.loginForm.value.identificador,
      password: this.loginForm.value.password
    };

    this.authService.login(payload).subscribe({
      next: () => {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Sesión iniciada',
          showConfirmButton: false,
          timer: 700,
          timerProgressBar: true,
          background: '#ffffff',
          color: '#1f2937',
          iconColor: '#16a34a'
        }).then(() => {
          this.router.navigate(['/app/ventas']);
        });
      },
      error: (err) => {
        this.submitting = false;

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'Credenciales incorrectas',
          showConfirmButton: false,
          timer: 2000,
          background: '#ffffff',
          color: '#1f2937',
          iconColor: '#dc2626'
        });

        console.error('Login error:', err);
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
