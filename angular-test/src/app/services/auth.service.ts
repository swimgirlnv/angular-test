import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { User, LoginRequest, SignUpRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Mock user data for demonstration
  private users: User[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '555-0123',
      rewardsPoints: 1250,
      memberSince: new Date('2024-01-15'),
      tier: 'Gold'
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      phone: '555-0456',
      rewardsPoints: 750,
      memberSince: new Date('2024-06-20'),
      tier: 'Silver'
    }
  ];

  constructor() {
    // Check if user is logged in from localStorage (only in browser)
    if (this.isBrowser()) {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        this.currentUserSubject.next(JSON.parse(savedUser));
      }
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }  login(loginData: LoginRequest): Observable<{ success: boolean; user?: User; error?: string }> {
    // Simulate API call with delay
    return new Observable(observer => {
      setTimeout(() => {
        const user = this.users.find(u => u.email === loginData.email);

        if (user && loginData.password === 'password123') { // Simple password check for demo
          this.currentUserSubject.next(user);
          if (this.isBrowser()) {
            localStorage.setItem('currentUser', JSON.stringify(user));
          }
          observer.next({ success: true, user });
        } else {
          observer.next({ success: false, error: 'Invalid email or password' });
        }
        observer.complete();
      }, 1000);
    });
  }

  signUp(signUpData: SignUpRequest): Observable<{ success: boolean; user?: User; error?: string }> {
    return new Observable(observer => {
      setTimeout(() => {
        // Check if email already exists
        const existingUser = this.users.find(u => u.email === signUpData.email);

        if (existingUser) {
          observer.next({ success: false, error: 'Email already registered' });
        } else {
          const newUser: User = {
            id: this.users.length + 1,
            firstName: signUpData.firstName,
            lastName: signUpData.lastName,
            email: signUpData.email,
            phone: signUpData.phone,
            rewardsPoints: 0,
            memberSince: new Date(),
            tier: 'Bronze'
          };

          this.users.push(newUser);
          this.currentUserSubject.next(newUser);
          if (this.isBrowser()) {
            localStorage.setItem('currentUser', JSON.stringify(newUser));
          }
          observer.next({ success: true, user: newUser });
        }
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    this.currentUserSubject.next(null);
    if (this.isBrowser()) {
      localStorage.removeItem('currentUser');
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  addRewardsPoints(points: number): void {
    const user = this.currentUser;
    if (user) {
      user.rewardsPoints += points;
      this.updateUserTier(user);
      this.currentUserSubject.next(user);
      if (this.isBrowser()) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
    }
  }

  redeemRewardsPoints(points: number): boolean {
    const user = this.currentUser;
    if (user && user.rewardsPoints >= points) {
      user.rewardsPoints -= points;
      this.currentUserSubject.next(user);
      if (this.isBrowser()) {
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      return true;
    }
    return false;
  }

  private updateUserTier(user: User): void {
    if (user.rewardsPoints >= 2000) {
      user.tier = 'Platinum';
    } else if (user.rewardsPoints >= 1000) {
      user.tier = 'Gold';
    } else if (user.rewardsPoints >= 500) {
      user.tier = 'Silver';
    } else {
      user.tier = 'Bronze';
    }
  }

  getTierBenefits(tier: string): { discount: number; pointsMultiplier: number } {
    switch (tier) {
      case 'Platinum':
        return { discount: 0.15, pointsMultiplier: 3 };
      case 'Gold':
        return { discount: 0.10, pointsMultiplier: 2.5 };
      case 'Silver':
        return { discount: 0.05, pointsMultiplier: 2 };
      default:
        return { discount: 0, pointsMultiplier: 1 };
    }
  }
}
