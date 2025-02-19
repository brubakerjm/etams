import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {NgIf} from "@angular/common";
import {ClrIconModule, ClrInputModule, ClrPasswordModule} from "@clr/angular";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [
    ReactiveFormsModule,
    NgIf,
    ClrInputModule,
    ClrPasswordModule,
    ClrIconModule,
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  /**
   * Handles form submission for user login.
   */
  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = null;

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: () => {
        this.router.navigate([this.authService.isAdmin() ? '/dashboard' : '/tasks']);
      },
      error: (error) => {
        this.isLoading = false;

        if (!error.status) {
          this.errorMessage = "Cannot connect to the server. Please check your internet connection.";
        } else if (error.status === 401) {
          this.errorMessage = "Incorrect username or password.";
        } else if (error.status === 404) {
          this.errorMessage = "User not found. Please check your username.";
        } else if (error.status === 500) {
          this.errorMessage = "Something went wrong on our end. Please try again later.";
        } else {
          this.errorMessage = "An unexpected error occurred. Please try again.";
        }
      },
    });
  }
}