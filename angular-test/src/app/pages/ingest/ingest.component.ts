import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { Store, DocumentItem } from '../../state/store.service';

@Component({
  selector: 'app-ingest',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule
  ],
  templateUrl: './ingest.component.html',
  styleUrl: './ingest.component.css'
})
export class IngestComponent {
  private store = inject(Store);
  readonly currentDoc = signal<DocumentItem | null>(null);
  readonly isProcessing = signal(false);
  readonly selectedModel = signal('forml-document-v2.1');
  readonly confidenceThreshold = signal(0.85);

  // Add writable signals for form controls
  readonly selectedModelValue = signal('forml-document-v2.1');
  readonly confidenceThresholdValue = signal(0.85);

  // Add computed property for documents
  documents = computed(() => this.store.documents());

  readonly processingSteps = signal([
    { id: 1, name: 'File Upload', description: 'Document received and validated', status: 'pending' },
    { id: 2, name: 'OCR Processing', description: 'Extracting text from document', status: 'pending' },
    { id: 3, name: 'AI Analysis', description: 'Applying machine learning models', status: 'pending' },
    { id: 4, name: 'Field Extraction', description: 'Identifying and extracting key fields', status: 'pending' },
    { id: 5, name: 'Confidence Scoring', description: 'Calculating accuracy scores', status: 'pending' },
  ]);

  extractedFields = signal<{ key: string; value: any; confidence: number; source?: string }[]>([]);

  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      this.processFile(files[i]);
    }
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).classList.add('dragover');
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).classList.remove('dragover');
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as HTMLElement).classList.remove('dragover');

    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      this.processFile(files[i]);
    }
  }

  private async processFile(file: File) {
    this.isProcessing.set(true);
    this.currentDoc.set(null);

    // Reset processing steps
    this.processingSteps.set(this.processingSteps().map(step => ({ ...step, status: 'pending' })));

    // Simulate AI processing with realistic timing
    const steps = this.processingSteps();

    for (let i = 0; i < steps.length; i++) {
      // Update current step to processing
      this.processingSteps.update(arr =>
        arr.map((step, idx) =>
          idx === i ? { ...step, status: 'processing' } : step
        )
      );

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

      // Mark as completed
      this.processingSteps.update(arr =>
        arr.map((step, idx) =>
          idx === i ? { ...step, status: 'completed' } : step
        )
      );
    }

    // Generate realistic extracted data based on file type
    const docType = this.getDocumentType(file.name);
    const extractedData = this.generateExtractionResults(file.name, docType);

    const doc: DocumentItem = {
      id: crypto.randomUUID(),
      type: docType,
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
      status: 'extracted',
      aiModel: this.selectedModelValue(),
      processingTime: 2.1 + Math.random() * 3,
      source: 'Manual upload',
      fields: extractedData
    };    this.currentDoc.set(doc);
    this.extractedFields.set(Object.entries(extractedData).map(([key, field]) => ({
      key,
      value: field.value,
      confidence: field.confidence,
      source: field.source
    })));

    this.store.addDocument(doc);
    this.isProcessing.set(false);

    // Add AI decision record
    this.store.addAIDecision({
      id: crypto.randomUUID(),
      document: file.name,
      model: this.selectedModelValue(),
      confidence: this.getOverallConfidence(),
      extracted: Object.entries(extractedData).map(([k, v]) => `${k}: ${v.value}`).join(', '),
      timestamp: new Date(),
      inputTokens: Math.floor(Math.random() * 3000) + 1000,
      outputTokens: Math.floor(Math.random() * 500) + 100
    });
  }

  private getDocumentType(fileName: string): any {
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'pdf': return Math.random() > 0.5 ? 'invoice' : 'contract';
      case 'xls':
      case 'xlsx': return 'csv';
      case 'eml': return 'email';
      default: return 'invoice';
    }
  }

  private generateExtractionResults(fileName: string, docType: string): Record<string, any> {
    const baseConfidence = this.confidenceThresholdValue();
    const variance = 0.15;

    const randomConfidence = () => Math.max(0.6, Math.min(0.99,
      baseConfidence + (Math.random() - 0.5) * variance
    ));

    const createField = (value: any, source: string) => ({
      value,
      confidence: randomConfidence(),
      source
    });

    switch (docType) {
      case 'invoice':
        return {
          vendor: createField('TechCorp Solutions Inc.', 'Entity Recognition'),
          total: createField((Math.random() * 10000 + 500).toFixed(2), 'OCR + Validation'),
          invoiceNo: createField('INV-' + Math.floor(Math.random() * 10000), 'Pattern Recognition'),
          dueDate: createField(new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), 'Date Parser'),
          currency: createField('USD', 'Currency Detector'),
          taxAmount: createField((Math.random() * 1000 + 50).toFixed(2), 'Tax Calculator')
        };
      case 'contract':
        return {
          contractType: createField('Service Agreement', 'Document Classifier'),
          parties: createField('Company A & Company B', 'Entity Extraction'),
          startDate: createField(new Date().toISOString().slice(0, 10), 'Date Parser'),
          endDate: createField(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), 'Date Parser'),
          value: createField(Math.floor(Math.random() * 100000) + 10000, 'Financial Extraction'),
          terms: createField('30 days net payment', 'Terms Extractor')
        };
      case 'email':
        return {
          sender: createField('john.doe@supplier.com', 'Email Parser'),
          subject: createField('Invoice Submission - Urgent', 'Text Analysis'),
          priority: createField('High', 'Priority Classifier'),
          attachments: createField('2 files', 'Attachment Analyzer'),
          actionRequired: createField('Payment Processing', 'Intent Recognition')
        };
      default:
        return {
          documentType: createField(docType, 'Document Classifier'),
          content: createField('Mixed content detected', 'Content Analyzer')
        };
    }
  }  getOverallConfidence(): number {
    const doc = this.currentDoc();
    if (!doc?.fields) return 0;
    const confidences = Object.values(doc.fields).map(field => field.confidence);
    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length * 100;
  }

  getConfidenceClass(confidence: number): string {
    if (confidence >= 0.9) return 'confidence-high';
    if (confidence >= 0.7) return 'confidence-medium';
    return 'confidence-low';
  }

  getConfidenceColor(confidence: number): 'primary' | 'accent' | 'warn' {
    if (confidence >= 0.9) return 'primary';
    if (confidence >= 0.7) return 'accent';
    return 'warn';
  }

  getStepIcon(status: string): string {
    switch (status) {
      case 'completed': return 'check_circle';
      case 'processing': return 'hourglass_empty';
      case 'pending': return 'radio_button_unchecked';
      default: return 'help';
    }
  }

  getStepIconColor(status: string): 'primary' | 'accent' | 'warn' | undefined {
    switch (status) {
      case 'completed': return 'primary';
      case 'processing': return 'accent';
      case 'pending': return undefined;
      default: return undefined;
    }
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

  approve() {
    const doc = this.currentDoc();
    if (!doc) return;

    this.store.approveDoc(doc.id);
    alert('Document approved! Added to audit trail with full processing history.');
    this.currentDoc.set(null);
    this.extractedFields.set([]);
  }

  rejectDoc() {
    const doc = this.currentDoc();
    if (!doc) return;

    // Update document status to rejected
    this.store.documents.update(docs =>
      docs.map(d => d.id === doc.id ? { ...d, status: 'rejected' } : d)
    );

    alert('Document rejected. Feedback will improve AI model accuracy.');
    this.currentDoc.set(null);
    this.extractedFields.set([]);
  }

  editFields() {
    alert('Feature coming soon: Field editing interface for manual corrections');
  }

  viewDoc(doc: DocumentItem) {
    this.currentDoc.set(doc);
    if (doc.fields) {
      this.extractedFields.set(Object.entries(doc.fields).map(([key, field]) => ({
        key,
        value: field.value,
        confidence: field.confidence,
        source: field.source
      })));
    }
  }
}
