import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatListModule } from '@angular/material/list';
import { Store } from '../../state/store.service';
import { ErrorDetailsDialogComponent } from './error-details-dialog.component';

@Component({
  selector: 'app-connectors',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressBarModule,
    MatBadgeModule,
    MatDialogModule,
    MatSnackBarModule,
    MatListModule
  ],
  styles: [`
    .grid{display:grid;gap:20px;grid-template-columns:repeat(auto-fit,minmax(380px,1fr))}
    .connector-card{
      transition:all 0.3s ease;
      border:2px solid transparent;
      padding:24px !important;
    }
    .connector-card:hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,0.15)}
    .connector-card.enabled{border-color:#4caf50}
    .connector-card.disabled{opacity:0.7;border-color:#e0e0e0}
    .header{
      display:flex;
      align-items:center;
      justify-content:space-between;
      margin-bottom:20px;
      padding-bottom:16px;
      border-bottom:1px solid #f0f0f0;
    }
    .connector-info{display:flex;align-items:center;gap:16px}
    .connector-icon{
      width:56px;
      height:56px;
      display:flex;
      align-items:center;
      justify-content:center;
      border-radius:12px;
      background:#f5f5f5;
      font-size:28px;
    }
    .connector-icon.enabled{background:#e8f5e8;color:#4caf50}
    .stats{
      display:grid;
      gap:12px;
      grid-template-columns:1fr 1fr;
      margin:20px 0;
    }
    .stat-item{
      text-align:center;
      padding:16px 12px;
      background:#f9f9f9;
      border-radius:8px;
      border:1px solid #f0f0f0;
    }
    .stat-value{font-weight:bold;color:#1976d2;font-size:1.2rem}
    .stat-label{font-size:0.85rem;opacity:0.7;margin-top:4px}
    .meta{
      opacity:0.7;
      font-size:0.9rem;
      margin-top:16px;
      padding:12px;
      background:#fafafa;
      border-radius:8px;
    }
    .action-bar{
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-top:20px;
      padding-top:16px;
      border-top:1px solid #f0f0f0;
      gap:12px;
    }
    .status-chip{margin-left:12px}
    .add-source{
      border:2px dashed #ccc;
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      padding:40px 24px;
      text-align:center;
      cursor:pointer;
      transition:all 0.3s ease;
      min-height:280px;
    }
    .add-source:hover{border-color:#1976d2;background:#f3f8ff}

    /* Card content spacing */
    .connector-card h3 {
      margin:0 0 4px 0;
      font-size:1.2rem;
      font-weight:500;
    }
    .connector-card p {
      margin:16px 0;
      opacity:0.8;
      font-size:0.95rem;
      line-height:1.4;
    }

    /* Error snackbar styles */
    :host ::ng-deep .error-snackbar {
      background: #f44336 !important;
      color: white !important;
    }
    :host ::ng-deep .error-snackbar .mat-mdc-snack-bar-action {
      color: white !important;
    }
    :host ::ng-deep .warn-snackbar {
      background: #ff9800 !important;
      color: white !important;
    }
    :host ::ng-deep .warn-snackbar .mat-mdc-snack-bar-action {
      color: white !important;
    }
    :host ::ng-deep .info-snackbar {
      background: #2196f3 !important;
      color: white !important;
    }
    :host ::ng-deep .info-snackbar .mat-mdc-snack-bar-action {
      color: white !important;
    }
  `],
  template: `
  <div style="margin-bottom:32px">
    <h2 style="margin:0 0 12px 0">Data Source Connections</h2>
    <p style="opacity:0.7;margin:0">Connect your documents and data from various sources for AI processing</p>
  </div>

  <div class="grid">
    @for (connector of store.connectors(); track connector.id) {
      <mat-card class="connector-card" [class.enabled]="connector.enabled" [class.disabled]="!connector.enabled">
        <div class="header">
          <div class="connector-info">
            <div class="connector-icon" [class.enabled]="connector.enabled">
              <mat-icon>{{ connector.icon || 'hub' }}</mat-icon>
            </div>
            <div>
              <h3>{{ connector.name }}</h3>
              <div style="opacity:0.8;font-size:0.95rem">{{ connector.type | titlecase }}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center">
            @if (connector.errorCount && connector.errorCount > 0) {
              <mat-icon
                color="warn"
                [matBadge]="connector.errorCount"
                matBadgeSize="small"
                style="cursor:pointer;margin-right:12px"
                (click)="showConnectorErrors(connector)"
                title="Click to view error details">
                warning
              </mat-icon>
            }
            <mat-slide-toggle
              [checked]="connector.enabled"
              (change)="toggle(connector.id)"
              class="status-chip">
            </mat-slide-toggle>
          </div>
        </div>

        <p>{{ connector.description }}</p>

        @if (connector.enabled) {
          <div class="stats">
            <div class="stat-item">
              <div class="stat-value">{{ connector.documentsProcessed || 0 | number }}</div>
              <div class="stat-label">Documents</div>
            </div>
            <div class="stat-item">
              <div class="stat-value" [style.color]="connector.errorCount ? '#f44336' : '#4caf50'">
                {{ connector.errorCount || 0 }}
              </div>
              <div class="stat-label">Errors</div>
            </div>
          </div>

          <div class="meta">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <mat-icon style="font-size:18px;width:18px;height:18px" [color]="connector.errorCount ? 'warn' : 'primary'">
                {{ connector.errorCount ? 'error' : 'check_circle' }}
              </mat-icon>
              <span style="font-weight:500">{{ getConnectionStatus(connector) }}</span>
            </div>
            @if (connector.lastSync) {
              <div style="font-size:0.85rem;opacity:0.8">Last sync: {{ connector.lastSync | date:'medium' }}</div>
            }
          </div>

          <div class="action-bar">
            <button mat-stroked-button size="small">Configure</button>
            <button mat-stroked-button size="small" color="primary">Sync Now</button>
          </div>
        } @else {
          <div class="action-bar">
            <button mat-raised-button color="primary" (click)="toggle(connector.id)">
              Connect
            </button>
            <button mat-stroked-button size="small">Learn More</button>
          </div>
        }
      </mat-card>
    }

    <!-- Add New Source Card -->
    <mat-card class="add-source" (click)="addNewSource()">
      <mat-icon style="font-size:56px;width:56px;height:56px;color:#1976d2;margin-bottom:16px">add_circle</mat-icon>
      <h3 style="margin:0 0 12px 0;color:#1976d2;font-size:1.2rem">Add Data Source</h3>
      <p style="margin:0;opacity:0.7;font-size:0.95rem">Connect a new document source</p>
    </mat-card>
  </div>

  <!-- Connection Guide -->
  <mat-card style="margin-top:32px;padding:24px !important">
    <h3 style="margin:0 0 20px 0;display:flex;align-items:center;gap:8px">
      <mat-icon>help_outline</mat-icon>
      <span>Connection Guide</span>
    </h3>
    <div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">
      <div style="padding:20px;border:1px solid #e0e0e0;border-radius:12px;background:#fafafa">
        <h4 style="margin:0 0 12px 0;color:#1976d2;font-size:1.1rem">Cloud Storage</h4>
        <p style="margin:0;font-size:0.95rem;opacity:0.8;line-height:1.5">
          Connect Google Drive, OneDrive, Dropbox, or S3 buckets for automatic document monitoring
        </p>
      </div>
      <div style="padding:20px;border:1px solid #e0e0e0;border-radius:12px;background:#fafafa">
        <h4 style="margin:0 0 12px 0;color:#1976d2;font-size:1.1rem">Email Systems</h4>
        <p style="margin:0;font-size:0.95rem;opacity:0.8;line-height:1.5">
          Monitor Gmail, Outlook, or Exchange for invoice attachments and document emails
        </p>
      </div>
      <div style="padding:20px;border:1px solid #e0e0e0;border-radius:12px;background:#fafafa">
        <h4 style="margin:0 0 12px 0;color:#1976d2;font-size:1.1rem">Business Apps</h4>
        <p style="margin:0;font-size:0.95rem;opacity:0.8;line-height:1.5">
          Integrate with Salesforce, HubSpot, SharePoint for CRM and business documents
        </p>
      </div>
    </div>
  </mat-card>
  `,
})
export class ConnectorsComponent {
  readonly store = inject(Store);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  toggle(id: string) {
    this.store.toggleConnector(id);
  }

  getConnectionStatus(connector: any): string {
    if (!connector.enabled) return 'Disconnected';
    if (connector.errorCount && connector.errorCount > 0) return 'Connection Issues';
    if (connector.lastSync) return 'Connected & Syncing';
    return 'Connected';
  }

  addNewSource() {
    // In a real app, this would open a dialog or navigate to a setup wizard
    alert('Feature coming soon: Add new data source wizard');
  }

  showConnectorErrors(connector: any) {
    if (!connector.errors || connector.errors.length === 0) {
      this.snackBar.open('No specific error details available', 'Close', { duration: 3000 });
      return;
    }

    const errorDetails = this.formatErrorsForDisplay(connector.errors);
    this.snackBar.open(
      `${connector.name}: ${errorDetails.summary}`,
      'View Details',
      {
        duration: 8000,
        panelClass: this.getErrorSnackbarClass(errorDetails.maxSeverity)
      }
    ).onAction().subscribe(() => {
      this.openErrorDetailsDialog(connector);
    });
  }

  private openErrorDetailsDialog(connector: any) {
    const dialogRef = this.dialog.open(ErrorDetailsDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '80vh',
      data: {
        connectorName: connector.name,
        errors: connector.errors
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'retry') {
        this.retryConnection(connector);
      }
    });
  }

  private retryConnection(connector: any) {
    this.snackBar.open(`Retrying connection to ${connector.name}...`, '', { duration: 2000 });
    // In a real app, this would trigger a reconnection attempt
    // For demo purposes, we'll just show a success message after a delay
    setTimeout(() => {
      this.snackBar.open(`Connection retry initiated for ${connector.name}`, 'Close', { duration: 3000 });
    }, 2000);
  }

  private formatErrorsForDisplay(errors: any[]) {
    const criticalErrors = errors.filter(e => e.severity === 'critical');
    const highErrors = errors.filter(e => e.severity === 'high');
    const otherErrors = errors.filter(e => !['critical', 'high'].includes(e.severity));

    let summary = '';
    let maxSeverity = 'low';

    if (criticalErrors.length > 0) {
      summary = `${criticalErrors.length} critical issue${criticalErrors.length > 1 ? 's' : ''}`;
      maxSeverity = 'critical';
    } else if (highErrors.length > 0) {
      summary = `${highErrors.length} high priority issue${highErrors.length > 1 ? 's' : ''}`;
      maxSeverity = 'high';
    } else {
      summary = `${otherErrors.length} issue${otherErrors.length > 1 ? 's' : ''}`;
      maxSeverity = otherErrors[0]?.severity || 'low';
    }

    return { summary, maxSeverity };
  }

  private getErrorSnackbarClass(severity: string): string {
    switch (severity) {
      case 'critical': return 'error-snackbar';
      case 'high': return 'warn-snackbar';
      default: return 'info-snackbar';
    }
  }

  private getTimeAgo(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
}
