import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../models/user.model';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-rewards-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rewards-dashboard.component.html',
  styleUrl: './rewards-dashboard.component.css'
})
export class RewardsDashboardComponent implements OnInit {
  currentUser: User | null = null;
  showDashboard = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.showDashboard = false;
      }
    });
  }

  toggleDashboard() {
    this.showDashboard = !this.showDashboard;
  }

  getTierColor(tier: string): string {
    switch (tier) {
      case 'Platinum': return '#e5e4e2';
      case 'Gold': return '#ffd700';
      case 'Silver': return '#c0c0c0';
      default: return '#cd7f32';
    }
  }

  getProgressToNextTier(): { nextTier: string; pointsNeeded: number; progress: number } {
    if (!this.currentUser) return { nextTier: '', pointsNeeded: 0, progress: 0 };

    const points = this.currentUser.rewardsPoints;
    let nextTier = '';
    let pointsNeeded = 0;
    let progress = 0;

    switch (this.currentUser.tier) {
      case 'Bronze':
        nextTier = 'Silver';
        pointsNeeded = 500 - points;
        progress = (points / 500) * 100;
        break;
      case 'Silver':
        nextTier = 'Gold';
        pointsNeeded = 1000 - points;
        progress = ((points - 500) / 500) * 100;
        break;
      case 'Gold':
        nextTier = 'Platinum';
        pointsNeeded = 2000 - points;
        progress = ((points - 1000) / 1000) * 100;
        break;
      case 'Platinum':
        nextTier = 'Max Level';
        pointsNeeded = 0;
        progress = 100;
        break;
    }

    return { nextTier, pointsNeeded: Math.max(0, pointsNeeded), progress: Math.min(100, progress) };
  }

  getTierBenefits() {
    if (!this.currentUser) return { discount: 0, pointsMultiplier: 1 };
    return this.authService.getTierBenefits(this.currentUser.tier);
  }

  getPointsValue(): number {
    if (!this.currentUser) return 0;
    // Assuming 100 points = $1
    return this.currentUser.rewardsPoints / 100;
  }

  getDaysAsMember(): number {
    if (!this.currentUser) return 0;
    const now = new Date();
    const memberSince = new Date(this.currentUser.memberSince);
    const diffTime = Math.abs(now.getTime() - memberSince.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
