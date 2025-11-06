import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from '../../state/store.service';

@Component({
  selector: 'app-playbooks',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatTabsModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './playbooks.component.html',
  styleUrl: './playbooks.component.css',
})
export class PlaybooksComponent {
  readonly store = inject(Store);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // Edit mode state
  editingPlaybook: any = null;
  isEditMode = false;

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    rule: ['', Validators.required],
    category: ['document-processing', Validators.required],
    triggers: [[] as string[], Validators.required],
    actions: [[] as string[], Validators.required],
    active: [true],
  });

  automationTemplates = [
    {
      id: 'template-1',
      name: 'Invoice Auto-Approval',
      description: 'Automatically approve invoices from trusted vendors under threshold amount',
      icon: 'receipt',
      color: 'primary',
      triggers: ['ai_extraction_complete', 'vendor_verified', 'amount_threshold'],
      actions: ['auto_approve', 'send_notification'],
      rule: 'IF vendor is trusted AND amount < $1000 AND confidence > 95% THEN auto-approve AND notify AP team',
      category: 'document-processing'
    },
    {
      id: 'template-2',
      name: 'Contract Compliance Check',
      description: 'Extract key terms from contracts and validate against compliance rules',
      icon: 'gavel',
      color: 'accent',
      triggers: ['document_uploaded'],
      actions: ['extract_terms', 'compliance_check', 'legal_review'],
      rule: 'IF document type is contract THEN extract key terms AND validate against compliance rules',
      category: 'compliance'
    },
    {
      id: 'template-3',
      name: 'High Priority Email Alert',
      description: 'Detect urgent emails and escalate to appropriate team members',
      icon: 'priority_high',
      color: 'warn',
      triggers: ['document_uploaded', 'urgency_detected'],
      actions: ['extract_actions', 'send_notification', 'create_task'],
      rule: 'IF email contains urgent keywords AND confidence > 90% THEN extract action items AND notify manager',
      category: 'workflow-automation'
    },
    {
      id: 'template-4',
      name: 'Data Quality Validation',
      description: 'Validate extracted data against business rules and flag anomalies',
      icon: 'verified',
      color: 'primary',
      triggers: ['ai_extraction_complete'],
      actions: ['validate_data', 'flag_anomalies', 'generate_report'],
      rule: 'IF data extracted THEN validate against business rules AND flag any anomalies',
      category: 'data-validation'
    },
  ];

  create() {
    const formValue = this.form.getRawValue();

    if (this.isEditMode && this.editingPlaybook) {
      // Update existing playbook
      const updatedPlaybook = {
        ...this.editingPlaybook,
        name: formValue.name,
        rule: formValue.rule,
        active: formValue.active,
        category: formValue.category as any,
        triggers: formValue.triggers,
        actions: formValue.actions,
      };

      this.store.playbooks.update(playbooks =>
        playbooks.map(p => p.id === this.editingPlaybook.id ? updatedPlaybook : p)
      );

      this.snackBar.open(`✅ Automation "${formValue.name}" updated successfully!`, 'Close', {
        duration: 3000,
        panelClass: 'success-snackbar'
      });

      this.cancelEdit();
    } else {
      // Create new playbook
      const newPlaybook = {
        id: crypto.randomUUID(),
        name: formValue.name,
        rule: formValue.rule,
        active: formValue.active,
        category: formValue.category as any,
        triggers: formValue.triggers,
        actions: formValue.actions,
        runs: 0,
        successRate: 0,
        lastRun: undefined
      };

      this.store.addPlaybook(newPlaybook);

      this.snackBar.open(`🎉 Automation "${formValue.name}" created successfully!`, 'Close', {
        duration: 3000,
        panelClass: 'success-snackbar'
      });

      this.form.reset({
        name: '',
        rule: '',
        category: 'document-processing',
        triggers: [],
        actions: [],
        active: true
      });
    }
  }

  useTemplate(template: any) {
    this.form.patchValue({
      name: template.name,
      rule: template.rule,
      category: template.category,
      triggers: template.triggers,
      actions: template.actions,
      active: true
    });

    // Show success message with scroll hint
    this.snackBar.open(
      `🎯 Template "${template.name}" applied! Form has been pre-filled with automation details.`,
      'Got it',
      {
        duration: 4000,
        panelClass: 'success-snackbar'
      }
    );

    // Scroll to the top of the form to show the populated fields
    setTimeout(() => {
      const formElement = document.querySelector('.automation-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  togglePlaybook(id: string) {
    // Toggle playbook active status
    this.store.playbooks.update(playbooks =>
      playbooks.map(p => p.id === id ? { ...p, active: !p.active } : p)
    );
  }

  formatTrigger(trigger: string): string {
    return trigger.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  formatAction(action: string): string {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  getTimeSinceLastRun(lastRun?: string): string {
    if (!lastRun) return 'Never';
    const now = new Date();
    const last = new Date(lastRun);
    const diffMs = now.getTime() - last.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  getPerformanceColor(successRate: number): 'primary' | 'accent' | 'warn' {
    if (successRate >= 90) return 'primary';
    if (successRate >= 70) return 'accent';
    return 'warn';
  }

  getTotalRuns(): number {
    return this.store.playbooks().reduce((sum, p) => sum + p.runs, 0);
  }

  getAvgSuccessRate(): number {
    const playbooks = this.store.playbooks().filter(p => p.successRate !== undefined);
    if (playbooks.length === 0) return 0;
    return playbooks.reduce((sum, p) => sum + (p.successRate || 0), 0) / playbooks.length;
  }

  getCategories() {
    const categories = this.store.playbooks().reduce((acc, p) => {
      const category = p.category || 'general';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categories).map(([name, count]) => ({ name, count }));
  }

  showDeleteWarning(playbook: any) {
    const warnings = this.getDeleteWarnings(playbook);

    if (warnings.length > 0) {
      this.snackBar.open(
        `⚠️ Warning: ${warnings.join(', ')}`,
        'Proceed Anyway',
        {
          duration: 8000,
          panelClass: 'warn-snackbar'
        }
      ).onAction().subscribe(() => {
        this.confirmDelete(playbook);
      });
    } else {
      this.confirmDelete(playbook);
    }
  }

  private getDeleteWarnings(playbook: any): string[] {
    const warnings: string[] = [];

    if (playbook.active) {
      warnings.push('Playbook is currently active and processing documents');
    }

    if (playbook.runs > 0) {
      warnings.push(`This will delete ${playbook.runs} execution records`);
    }

    if (playbook.successRate && playbook.successRate > 80) {
      warnings.push('High-performing automation will be permanently lost');
    }

    if (playbook.category === 'compliance') {
      warnings.push('Compliance automation deletion may affect audit trails');
    }

    return warnings;
  }

  private confirmDelete(playbook: any) {
    this.snackBar.open(
      `Delete "${playbook.name}"? This cannot be undone.`,
      'DELETE',
      {
        duration: 5000,
        panelClass: 'error-snackbar'
      }
    ).onAction().subscribe(() => {
      this.deletePlaybook(playbook.id);
    });
  }

  private deletePlaybook(id: string) {
    this.store.playbooks.update(playbooks =>
      playbooks.filter(p => p.id !== id)
    );
    this.snackBar.open('Automation deleted', 'Undo', { duration: 3000 })
      .onAction().subscribe(() => {
        // In a real app, you'd implement undo functionality here
        this.snackBar.open('Undo not implemented in demo', '', { duration: 2000 });
      });
  }

  handleTemplateClick(template: any) {
    if (template.color === 'warn') {
      this.showTemplateWarnings(template);
    } else {
      this.useTemplate(template);
    }
  }

  private showTemplateWarnings(template: any) {
    const warnings = this.getTemplateWarnings(template);

    this.snackBar.open(
      `⚠️ ${warnings.join(' • ')}`,
      'Use Anyway',
      {
        duration: 6000,
        panelClass: 'warn-snackbar'
      }
    ).onAction().subscribe(() => {
      this.useTemplate(template);
    });
  }

  private getTemplateWarnings(template: any): string[] {
    const warnings: string[] = [];

    if (template.id === 'template-3') { // High Priority Email Alert
      warnings.push('High-priority automation may create notification overload');
      warnings.push('Requires careful threshold tuning to avoid false positives');
      warnings.push('May impact email processing performance');
    }

    // Add more template-specific warnings as needed
    if (template.category === 'compliance') {
      warnings.push('Compliance automation requires legal review');
    }

    return warnings;
  }

  // New functionality methods
  editPlaybook(playbook: any) {
    this.isEditMode = true;
    this.editingPlaybook = playbook;

    // Populate form with existing playbook data
    this.form.patchValue({
      name: playbook.name,
      rule: playbook.rule,
      category: playbook.category,
      triggers: playbook.triggers || [],
      actions: playbook.actions || [],
      active: playbook.active
    });

    // Scroll to form
    setTimeout(() => {
      const formElement = document.querySelector('.automation-form');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);

    this.snackBar.open(`📝 Editing "${playbook.name}" - Make your changes and click Update`, 'Got it', {
      duration: 4000,
      panelClass: 'info-snackbar'
    });
  }

  cancelEdit() {
    this.isEditMode = false;
    this.editingPlaybook = null;
    this.form.reset({
      name: '',
      rule: '',
      category: 'document-processing',
      triggers: [],
      actions: [],
      active: true
    });
  }

  testRunPlaybook(playbook: any) {
    // Simulate test run with loading state
    this.snackBar.open(`🧪 Starting test run for "${playbook.name}"...`, '', {
      duration: 2000,
      panelClass: 'info-snackbar'
    });

    // Simulate processing time
    setTimeout(() => {
      const success = Math.random() > 0.2; // 80% success rate for demo
      const confidence = Math.floor(Math.random() * 30) + 70; // 70-100% confidence

      if (success) {
        // Update playbook stats
        this.store.playbooks.update(playbooks =>
          playbooks.map(p => {
            if (p.id === playbook.id) {
              const newRuns = p.runs + 1;
              const currentSuccesses = Math.floor((p.successRate || 0) * p.runs / 100);
              const newSuccessRate = Math.floor(((currentSuccesses + 1) / newRuns) * 100);

              return {
                ...p,
                runs: newRuns,
                successRate: newSuccessRate,
                lastRun: new Date().toISOString()
              };
            }
            return p;
          })
        );

        this.snackBar.open(
          `✅ Test run successful! Confidence: ${confidence}% | Document processed correctly`,
          'View Details',
          {
            duration: 5000,
            panelClass: 'success-snackbar'
          }
        ).onAction().subscribe(() => {
          this.showTestRunDetails(playbook, true, confidence);
        });
      } else {
        this.snackBar.open(
          `⚠️ Test run completed with issues. Review automation rules.`,
          'View Details',
          {
            duration: 5000,
            panelClass: 'warn-snackbar'
          }
        ).onAction().subscribe(() => {
          this.showTestRunDetails(playbook, false, confidence);
        });
      }
    }, 2500);
  }

  private showTestRunDetails(playbook: any, success: boolean, confidence: number) {
    const status = success ? 'SUCCESS' : 'ISSUES DETECTED';
    const details = success
      ? `✅ All triggers fired correctly\n✅ Actions executed as expected\n✅ High confidence level (${confidence}%)\n✅ No errors detected`
      : `⚠️ Some triggers may need adjustment\n⚠️ Lower confidence than expected (${confidence}%)\n⚠️ Review rule conditions\n💡 Consider refining automation logic`;

    this.snackBar.open(
      `Test Run Results for "${playbook.name}"\n\nStatus: ${status}\n\n${details}`,
      'Close',
      {
        duration: 8000,
        panelClass: success ? 'success-snackbar' : 'warn-snackbar'
      }
    );
  }

  // Computed property for form button text
  get formButtonText(): string {
    return this.isEditMode ? 'Update Automation' : 'Create Automation';
  }

  get formButtonIcon(): string {
    return this.isEditMode ? 'update' : 'save';
  }
}
