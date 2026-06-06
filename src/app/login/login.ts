import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { NotificationService } from '../../Service/notification-service';
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
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private notif: NotificationService,
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
        this.notif.success('Sesión iniciada', 1200);
        this.router.navigate(['/app/ventas']);
      },
      error: (err) => {
        this.submitting = false;
        this.notif.error('Credenciales incorrectas');
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
