import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { Store } from '../../state/store.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatProgressBarModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private store = inject(Store);

  enabledCount = computed(() => this.store.enabledConnectors().length);
  totalConnectors = computed(() => this.store.connectors().length);
  pendingCount = computed(() => this.store.pendingDocs().length);
  activePlaybooks = computed(() => this.store.playbooks().filter(p => p.active).length);
  stats = computed(() => this.store.processingStats());

  topConnectors = computed(() => this.store.connectors().slice(0, 4));
  topPlaybooks = computed(() => this.store.playbooks().filter(p => p.active).slice(0, 3));
  recentDocs = computed(() => this.store.documents().slice(0, 5));

  highConfidencePercent = computed(() => {
    const docs = this.store.pendingDocs().filter(d => d.fields);
    if (docs.length === 0) return 0;

    const highConfDocs = docs.filter(d => {
      const avgConf = this.getAvgConfidence(d);
      return avgConf >= 90;
    });

    return (highConfDocs.length / docs.length) * 100;
  });

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

  getConfidenceColor(confidence: number): 'primary' | 'accent' | 'warn' {
    if (confidence >= 90) return 'primary';
    if (confidence >= 70) return 'accent';
    return 'warn';
  }
}
