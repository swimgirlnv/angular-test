import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { Store } from '../../state/store.service';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule
  ],
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.css',
})
export class AuditComponent {
  private store = inject(Store);

  auditEvents = computed(() => this.store.auditEvents());
  aiDecisions = computed(() => this.store.aiDecisions());
  complianceRecords = computed(() => this.store.complianceRecords());

  // Table columns for compliance records
  displayedColumns: string[] = ['document', 'action', 'user', 'timestamp', 'compliance'];

  getConfidenceClass(confidence: number): string {
    if (confidence >= 90) return 'confidence-high';
    if (confidence >= 70) return 'confidence-medium';
    return 'confidence-low';
  }

  getActionClass(action: string): string {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('extract')) return 'extraction';
    if (actionLower.includes('validat')) return 'validation';
    if (actionLower.includes('approv')) return 'approval';
    return '';
  }

  getDocumentType(document: string): string {
    const docLower = document.toLowerCase();
    if (docLower.includes('invoice')) return 'Invoice';
    if (docLower.includes('contract')) return 'Contract';
    if (docLower.includes('report')) return 'Report';
    if (docLower.includes('email')) return 'Email';
    return 'Document';
  }

  getDocumentTypeClass(document: string): string {
    const docLower = document.toLowerCase();
    if (docLower.includes('invoice')) return 'invoice';
    if (docLower.includes('contract')) return 'contract';
    if (docLower.includes('report')) return 'report';
    return '';
  }

  getUserInitials(user: string): string {
    return user.split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}
