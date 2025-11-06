import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

export interface ErrorDialogData {
  connectorName: string;
  errors: any[];
}

@Component({
  selector: 'app-error-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>
        <mat-icon color="warn">error</mat-icon>
        Connection Issues: {{ data.connectorName }}
      </h2>
      <button mat-icon-button mat-dialog-close>
        <mat-icon>close</mat-icon>
      </button>
    </div>

    <mat-dialog-content class="dialog-content">
      <div class="error-list">
        @for (error of data.errors; track error.id) {
          <div class="error-item" [class]="'severity-' + error.severity">
            <div class="error-header">
              <div class="severity-badge">
                <mat-icon>{{ getSeverityIcon(error.severity) }}</mat-icon>
                <span>{{ error.severity | titlecase }}</span>
              </div>
              <span class="error-time">{{ getTimeAgo(error.timestamp) }}</span>
            </div>

            <h4 class="error-message">{{ error.message }}</h4>

            @if (error.details) {
              <p class="error-details">{{ error.details }}</p>
            }

            <mat-chip class="error-type-chip" size="small">{{ formatErrorType(error.type) }}</mat-chip>
          </div>
        }
      </div>

      <div class="recommendations-section">
        <h3>
          <mat-icon color="primary">lightbulb</mat-icon>
          Recommended Actions
        </h3>
        <ul class="recommendations-list">
          @for (action of getRecommendedActions(); track action) {
            <li>{{ action }}</li>
          }
        </ul>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions class="dialog-actions">
      <button mat-button mat-dialog-close>Close</button>
      <button mat-raised-button color="primary" (click)="retryConnection()">
        <mat-icon>refresh</mat-icon>
        Retry Connection
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px 16px 24px;
      border-bottom: 1px solid #e0e0e0;
    }

    .dialog-header h2 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      font-size: 1.2rem;
    }

    .dialog-content {
      padding: 24px;
      max-height: 60vh;
      overflow-y: auto;
    }

    .error-list {
      margin-bottom: 24px;
    }

    .error-item {
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      border-left: 4px solid;
    }

    .error-item.severity-critical {
      background: #ffebee;
      border-color: #f44336;
    }

    .error-item.severity-high {
      background: #fff3e0;
      border-color: #ff9800;
    }

    .error-item.severity-medium {
      background: #e3f2fd;
      border-color: #2196f3;
    }

    .error-item.severity-low {
      background: #f1f8e9;
      border-color: #4caf50;
    }

    .error-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .severity-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .severity-badge mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .error-time {
      font-size: 0.8rem;
      opacity: 0.7;
    }

    .error-message {
      margin: 0 0 8px 0;
      font-size: 1rem;
      font-weight: 500;
      color: #333;
    }

    .error-details {
      margin: 0 0 12px 0;
      opacity: 0.8;
      line-height: 1.4;
    }

    .error-type-chip {
      background: rgba(0,0,0,0.1) !important;
    }

    .recommendations-section {
      padding: 16px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .recommendations-section h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 12px 0;
      font-size: 1rem;
    }

    .recommendations-list {
      margin: 0;
      padding-left: 20px;
    }

    .recommendations-list li {
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .dialog-actions {
      padding: 16px 24px;
      border-top: 1px solid #e0e0e0;
      justify-content: flex-end;
      gap: 12px;
    }
  `]
})
export class ErrorDetailsDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ErrorDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ErrorDialogData
  ) {}

  getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'critical': return 'dangerous';
      case 'high': return 'warning';
      case 'medium': return 'info';
      default: return 'check_circle';
    }
  }

  formatErrorType(type: string): string {
    return type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getTimeAgo(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  getRecommendedActions(): string[] {
    const actions = new Set<string>();

    this.data.errors.forEach(error => {
      switch (error.type) {
        case 'authentication':
          actions.add('Re-authorize connection in Settings');
          actions.add('Check if API credentials are still valid');
          break;
        case 'permission':
          actions.add('Check IAM roles and permissions');
          actions.add('Contact system administrator');
          actions.add('Verify access to required resources');
          break;
        case 'rate-limit':
          actions.add('Wait for rate limit reset');
          actions.add('Consider upgrading API plan');
          actions.add('Implement exponential backoff');
          break;
        case 'quota':
          actions.add('Check storage/API quotas');
          actions.add('Clean up old data or upgrade plan');
          break;
        case 'network':
          actions.add('Check network connectivity');
          actions.add('Verify firewall settings');
          actions.add('Test connection from different network');
          break;
        case 'configuration':
          actions.add('Review connector configuration');
          actions.add('Validate endpoint URLs');
          actions.add('Check configuration parameters');
          break;
        default:
          actions.add('Contact support for assistance');
          actions.add('Check service status page');
      }
    });

    return Array.from(actions);
  }

  retryConnection() {
    // In a real app, this would trigger a reconnection attempt
    this.dialogRef.close('retry');
  }
}
