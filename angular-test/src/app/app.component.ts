import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from './state/store.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDividerModule,
  ],
  styles: [
    `mat-toolbar{position:sticky;top:0;z-index:10;backdrop-filter:blur(10px);padding-top:20px;padding-bottom:5px;}
     .spacer{flex:1}
     a.active{font-weight:600;background:rgba(255,255,255,0.1);border-radius:8px;margin:0 4px}
     .brand-logo{display:flex;align-items:center;gap:8px;font-size:1.2rem;font-weight:600}
     .nav-item{display:flex;align-items:center;gap:6px;padding:8px 12px;border-radius:8px;transition:all 0.3s ease}
     .nav-item:hover{background:rgba(255,255,255,0.08)}
     .pending-badge{position:relative;animation:pulse 2s infinite;}
     .pending-panel{min-width:400px;max-width:500px;max-height:600px;overflow-y:auto}
     .pending-item{padding:12px;border-bottom:1px solid #e0e0e0;transition:all 0.3s ease}
     .pending-item:hover{background:#f5f5f5}
     .pending-item:last-child{border-bottom:none}
     .confidence-bar{margin:8px 0;height:4px}
     .no-pending{text-align:center;padding:32px;opacity:0.6}
     .pending-header{padding:16px;background:#f8f9fa;border-bottom:1px solid #e0e0e0}
     .pending-stats{display:flex;gap:16px;margin-top:8px}
     .stat-item{text-align:center}
     .stat-value{font-weight:bold;color:#1976d2}
     .stat-label{font-size:0.8rem;opacity:0.7}`,
  ],
  template: `
  <mat-toolbar color="primary">
    <button mat-button routerLink="/" [routerLinkActiveOptions]="{exact:true}" routerLinkActive="active" class="brand-logo">
      <mat-icon>psychology</mat-icon>
      <span>forml AI Ops</span>
    </button>
    <span class="spacer"></span>
    <a mat-button routerLink="/connectors" routerLinkActive="active" class="nav-item">
      <mat-icon>hub</mat-icon>
      <span>Data Sources</span>
    </a>
    <a mat-button routerLink="/ingest" routerLinkActive="active" class="nav-item">
      <mat-icon>smart_toy</mat-icon>
      <span>AI Processing</span>
    </a>
    <a mat-button routerLink="/playbooks" routerLinkActive="active" class="nav-item">
      <mat-icon>auto_mode</mat-icon>
      <span>Automation</span>
    </a>
    <a mat-button routerLink="/audit" routerLinkActive="active" class="nav-item">
      <mat-icon>fact_check</mat-icon>
      <span>Audit Trail</span>
    </a>
    <button mat-icon-button aria-label="Pending intelligence" [matBadge]="pending()" matBadgeColor="accent"
            class="pending-badge" [matMenuTriggerFor]="pendingMenu">
      <mat-icon>pending_actions</mat-icon>
    </button>

    <!-- Pending Intelligence Menu -->
    <mat-menu #pendingMenu="matMenu" class="pending-panel">
      <div class="pending-header" (click)="$event.stopPropagation()">
        <div style="display:flex;align-items:center;gap:8px">
          <mat-icon color="accent">pending_actions</mat-icon>
          <div>
            <strong>Pending Intelligence</strong>
            <div style="font-size:0.9rem;opacity:0.7">{{ pending() }} items awaiting review</div>
          </div>
        </div>
        <div class="pending-stats" *ngIf="pending() > 0">
          <div class="stat-item">
            <div class="stat-value">{{ getHighConfidenceCount() }}</div>
            <div class="stat-label">High Confidence</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ getMediumConfidenceCount() }}</div>
            <div class="stat-label">Medium Confidence</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ getLowConfidenceCount() }}</div>
            <div class="stat-label">Needs Review</div>
          </div>
        </div>
      </div>

      <div *ngIf="pending() === 0; else pendingList" class="no-pending">
        <mat-icon style="font-size:48px;opacity:0.3">check_circle</mat-icon>
        <div style="margin-top:8px">All caught up!</div>
        <div style="font-size:0.9rem">No documents pending review</div>
      </div>

      <ng-template #pendingList>
        <div *ngFor="let doc of pendingDocs(); let i = index" class="pending-item" (click)="viewDocument(doc)">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
            <div style="flex:1">
              <strong style="font-size:0.9rem">{{ doc.fileName }}</strong>
              <div style="opacity:0.7;font-size:0.8rem">{{ doc.uploadedAt | date:'short' }}</div>
            </div>
            <mat-chip size="small" [color]="getStatusColor(doc.status)">
              {{ doc.status }}
            </mat-chip>
          </div>

          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <mat-icon style="font-size:16px;width:16px;height:16px">{{ getDocIcon(doc.type) }}</mat-icon>
            <span style="font-size:0.8rem;opacity:0.8">{{ doc.type | titlecase }}</span>
            <span style="font-size:0.8rem;opacity:0.6">•</span>
            <span style="font-size:0.8rem;opacity:0.8">{{ doc.source || 'Manual upload' }}</span>
          </div>

          <div *ngIf="doc.fields" style="margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <span style="font-size:0.8rem;opacity:0.7">AI Confidence</span>
              <span style="font-size:0.8rem;font-weight:500" [style.color]="getConfidenceColor(getAvgConfidence(doc))">
                {{ getAvgConfidence(doc) | number:'1.0-0' }}%
              </span>
            </div>
            <mat-progress-bar
              mode="determinate"
              [value]="getAvgConfidence(doc)"
              [color]="getConfidenceColorMat(getAvgConfidence(doc))"
              class="confidence-bar">
            </mat-progress-bar>
          </div>

          <div style="display:flex;gap:4px">
            <button mat-stroked-button size="small" (click)="approveDocument(doc, $event)"
                    [disabled]="!doc.fields || getAvgConfidence(doc) < 70">
              <mat-icon style="font-size:14px">check</mat-icon>
              Approve
            </button>
            <button mat-stroked-button size="small" (click)="reviewDocument(doc, $event)">
              <mat-icon style="font-size:14px">visibility</mat-icon>
              Review
            </button>
          </div>
        </div>
      </ng-template>

      <mat-divider></mat-divider>
      <div style="padding:12px;text-align:center">
        <button mat-stroked-button routerLink="/ingest" (click)="closePendingMenu()">
          <mat-icon>smart_toy</mat-icon>
          View All in AI Processing
        </button>
      </div>
    </mat-menu>
  </mat-toolbar>
  <main style="padding:16px;background:var(--ai-background);min-height:calc(100vh - 64px)">
    <router-outlet />
  </main>
  `,
})
export class AppComponent {
  private store = inject(Store);
  pending = computed(() => this.store.pendingDocs().length);
  pendingDocs = computed(() => this.store.pendingDocs());

  getHighConfidenceCount(): number {
    return this.store.pendingDocs().filter(doc => {
      if (!doc.fields) return false;
      return this.getAvgConfidence(doc) >= 90;
    }).length;
  }

  getMediumConfidenceCount(): number {
    return this.store.pendingDocs().filter(doc => {
      if (!doc.fields) return false;
      const conf = this.getAvgConfidence(doc);
      return conf >= 70 && conf < 90;
    }).length;
  }

  getLowConfidenceCount(): number {
    return this.store.pendingDocs().filter(doc => {
      if (!doc.fields) return true;
      return this.getAvgConfidence(doc) < 70;
    }).length;
  }

  getAvgConfidence(doc: any): number {
    if (!doc.fields) return 0;
    const confidences = Object.values(doc.fields).map((field: any) => field.confidence);
    return confidences.reduce((sum: number, conf: number) => sum + conf, 0) / confidences.length * 100;
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' | 'basic' {
    switch (status) {
      case 'approved': return 'primary';
      case 'extracted': return 'accent';
      case 'processing': return 'accent';
      case 'pending': return 'warn';
      case 'rejected': return 'warn';
      default: return 'basic';
    }
  }

  getConfidenceColor(confidence: number): string {
    if (confidence >= 90) return '#4caf50';
    if (confidence >= 70) return '#ff9800';
    return '#f44336';
  }

  getConfidenceColorMat(confidence: number): 'primary' | 'accent' | 'warn' {
    if (confidence >= 90) return 'primary';
    if (confidence >= 70) return 'accent';
    return 'warn';
  }

  getDocIcon(type: string): string {
    switch (type) {
      case 'invoice': return 'receipt';
      case 'contract': return 'gavel';
      case 'email': return 'email';
      case 'csv': return 'table_chart';
      case 'pdf': return 'picture_as_pdf';
      case 'excel': return 'grid_on';
      default: return 'description';
    }
  }

  viewDocument(doc: any): void {
    // Navigate to the ingest page with this document
    window.location.href = '/ingest';
  }

  approveDocument(doc: any, event: Event): void {
    event.stopPropagation();
    this.store.approveDoc(doc.id);

    // Show a quick success message
    // You could implement a snackbar here
    console.log(`Document ${doc.fileName} approved!`);
  }

  reviewDocument(doc: any, event: Event): void {
    event.stopPropagation();
    // Navigate to detailed review
    window.location.href = '/ingest';
  }

  closePendingMenu(): void {
    // Menu will close automatically when navigating
  }
}
