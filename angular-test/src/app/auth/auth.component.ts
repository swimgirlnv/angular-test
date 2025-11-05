import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { LoginRequest, SignUpRequest, User } from '../models/user.model';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {
  isLoginMode = true;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  loginForm: LoginRequest = {
    email: '',
    password: ''
  };

  signUpForm: SignUpRequest = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  };

  currentUser: User | null = null;
  showAuthModal = false;

  constructor(private authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  toggleAuthModal() {
    this.showAuthModal = !this.showAuthModal;
    this.resetForms();
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.resetMessages();
  }

  onLogin() {
    if (!this.loginForm.email || !this.loginForm.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm).subscribe({
      next: (result) => {
        this.isLoading = false;
        if (result.success) {
          this.successMessage = 'Welcome back!';
          setTimeout(() => {
            this.showAuthModal = false;
            this.resetForms();
          }, 1500);
        } else {
          this.errorMessage = result.error || 'Login failed';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred. Please try again.';
      }
    });
  }

  onSignUp() {
    if (!this.signUpForm.firstName || !this.signUpForm.lastName ||
        !this.signUpForm.email || !this.signUpForm.password) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    if (this.signUpForm.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.signUp(this.signUpForm).subscribe({
      next: (result) => {
        this.isLoading = false;
        if (result.success) {
          this.successMessage = 'Account created successfully! Welcome to our rewards program!';
          setTimeout(() => {
            this.showAuthModal = false;
            this.resetForms();
          }, 2000);
        } else {
          this.errorMessage = result.error || 'Sign up failed';
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'An error occurred. Please try again.';
      }
    });
  }

  logout() {
    this.authService.logout();
  }

  private resetForms() {
    this.loginForm = { email: '', password: '' };
    this.signUpForm = { firstName: '', lastName: '', email: '', password: '', phone: '' };
    this.resetMessages();
  }

  private resetMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }

  getTierColor(tier: string): string {
    switch (tier) {
      case 'Platinum': return '#e5e4e2';
      case 'Gold': return '#ffd700';
      case 'Silver': return '#c0c0c0';
      default: return '#cd7f32';
    }
  }

  getDemoCredentials() {
    this.loginForm.email = 'john@example.com';
    this.loginForm.password = 'password123';
  }
}
