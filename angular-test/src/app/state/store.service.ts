import { Injectable, computed, signal } from '@angular/core';

export type ConnectorType = 'google-drive' | 's3' | 'email' | 'sharepoint' | 'dropbox' | 'box' | 'onedrive' | 'salesforce' | 'hubspot' | 'database';

export interface ConnectorError {
  id: string;
  timestamp: string;
  type: 'authentication' | 'permission' | 'quota' | 'network' | 'rate-limit' | 'configuration' | 'file-format';
  message: string;
  details?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface Connector {
  id: string;
  type: ConnectorType;
  name: string;
  enabled: boolean;
  lastSync?: string;
  documentsProcessed?: number;
  errorCount?: number;
  errors?: ConnectorError[];
  icon?: string;
  description?: string;
}

export type DocType = 'invoice' | 'purchase-order' | 'email' | 'csv' | 'pdf' | 'excel' | 'contract' | 'receipt';
export interface Field { value: string | number; confidence: number; source?: string; }
export interface DocumentItem {
  id: string;
  type: DocType;
  fileName: string;
  uploadedAt: string; // ISO
  status: 'pending' | 'processing' | 'extracted' | 'approved' | 'rejected';
  fields?: Record<string, Field>;
  aiModel?: string;
  processingTime?: number;
  source?: string;
}

export interface Playbook {
  id: string;
  name: string;
  rule: string; // human-readable rule
  active: boolean;
  runs: number;
  lastRun?: string;
  successRate?: number;
  category?: 'document-processing' | 'data-validation' | 'workflow-automation' | 'compliance';
  triggers?: string[];
  actions?: string[];
}

export interface AuditEvent {
  id: string;
  document: string;
  action: string;
  timestamp: Date;
  confidence: number;
  details: string;
  user?: string;
}

export interface AIDecision {
  id: string;
  document: string;
  model: string;
  confidence: number;
  extracted: string;
  timestamp: Date;
  inputTokens?: number;
  outputTokens?: number;
}

export interface ComplianceRecord {
  id: string;
  document: string;
  action: string;
  user: string;
  timestamp: Date;
  compliant: boolean;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class Store {
  private generateId(): string {
    // Use crypto.randomUUID() if available (browser), otherwise fallback for SSR
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for SSR - simple random ID generator
    return 'id-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
  }

  // Connectors - Enhanced with more data sources
  readonly connectors = signal<Connector[]>([
    {
      id: 'gdrive',
      type: 'google-drive',
      name: 'Google Drive',
      enabled: true,
      lastSync: new Date().toISOString(),
      documentsProcessed: 342,
      errorCount: 0,
      icon: 'cloud',
      description: 'Connected to team drive with invoices and contracts'
    },
    {
      id: 's3',
      type: 's3',
      name: 'AWS S3 Document Store',
      enabled: true,
      lastSync: new Date(Date.now() - 3600000).toISOString(),
      documentsProcessed: 1205,
      errorCount: 2,
      errors: [
        {
          id: 'err-1',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: 'permission',
          message: 'Access denied to bucket: finance-docs-archived',
          details: 'IAM role missing s3:GetObject permission for archived documents folder',
          severity: 'high'
        },
        {
          id: 'err-2',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          type: 'rate-limit',
          message: 'API rate limit exceeded during bulk sync',
          details: 'Exceeded 1000 requests per hour limit. Next sync scheduled in 45 minutes.',
          severity: 'medium'
        }
      ],
      icon: 'storage',
      description: 'Production document archive bucket'
    },
    {
      id: 'mail',
      type: 'email',
      name: 'Gmail Business Account',
      enabled: true,
      lastSync: new Date().toISOString(),
      documentsProcessed: 89,
      errorCount: 0,
      icon: 'email',
      description: 'accounts@company.com inbox monitoring'
    },
    {
      id: 'sharepoint',
      type: 'sharepoint',
      name: 'SharePoint Finance',
      enabled: false,
      documentsProcessed: 0,
      errorCount: 0,
      icon: 'folder_shared',
      description: 'Finance team document library'
    },
    {
      id: 'salesforce',
      type: 'salesforce',
      name: 'Salesforce CRM',
      enabled: true,
      lastSync: new Date(Date.now() - 1800000).toISOString(),
      documentsProcessed: 156,
      errorCount: 1,
      errors: [
        {
          id: 'err-3',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          type: 'authentication',
          message: 'OAuth token expired',
          details: 'Authentication token needs refresh. Please re-authorize the Salesforce connection.',
          severity: 'critical'
        }
      ],
      icon: 'business',
      description: 'Customer contracts and proposals'
    },
  ]);

  // Documents queue (simulated AI processing)
  readonly documents = signal<DocumentItem[]>([
    {
      id: this.generateId(),
      type: 'invoice',
      fileName: 'vendor-invoice-2024-001.pdf',
      uploadedAt: new Date().toISOString(),
      status: 'extracted',
      aiModel: 'forml-document-v2.1',
      processingTime: 1.2,
      source: 'Google Drive',
      fields: {
        vendor: { value: 'Acme Tech Solutions', confidence: 0.98, source: 'OCR + NLP' },
        total: { value: 15243.55, confidence: 0.96, source: 'OCR' },
        invoiceNo: { value: 'INV-2024-001', confidence: 0.99, source: 'OCR' },
        dueDate: { value: '2024-12-15', confidence: 0.94, source: 'Date Parser' },
        currency: { value: 'USD', confidence: 0.97, source: 'Currency Detector' },
        taxAmount: { value: 1524.36, confidence: 0.92, source: 'Tax Calculator' },
      },
    },
    {
      id: this.generateId(),
      type: 'contract',
      fileName: 'service-agreement-Q4.pdf',
      uploadedAt: new Date(Date.now() - 1800000).toISOString(),
      status: 'processing',
      aiModel: 'forml-legal-v1.5',
      source: 'Salesforce',
      fields: {
        contractType: { value: 'Service Agreement', confidence: 0.95, source: 'Classification Model' },
        parties: { value: 'Company Inc. & Service Provider LLC', confidence: 0.88, source: 'Entity Extraction' },
        startDate: { value: '2024-01-01', confidence: 0.91, source: 'Date Parser' },
        value: { value: 50000, confidence: 0.85, source: 'Financial Extraction' },
      },
    },
    {
      id: this.generateId(),
      type: 'email',
      fileName: 'purchase-request-urgent.eml',
      uploadedAt: new Date(Date.now() - 3600000).toISOString(),
      status: 'pending',
      source: 'Gmail',
    },
  ]);

  // AI-Powered Playbooks
  readonly playbooks = signal<Playbook[]>([
    {
      id: 'pb1',
      name: 'Auto-approve low-risk invoices',
      rule: 'IF vendor is trusted AND amount < $1000 AND confidence > 95% THEN auto-approve',
      active: true,
      runs: 89,
      successRate: 97.8,
      lastRun: new Date().toISOString(),
      category: 'document-processing',
      triggers: ['invoice_extracted', 'confidence_high'],
      actions: ['auto_approve', 'notify_ap_team'],
    },
    {
      id: 'pb2',
      name: 'Contract compliance check',
      rule: 'IF document type is contract THEN extract key terms AND validate against compliance rules',
      active: true,
      runs: 23,
      successRate: 91.3,
      lastRun: new Date(Date.now() - 7200000).toISOString(),
      category: 'compliance',
      triggers: ['contract_uploaded'],
      actions: ['extract_terms', 'compliance_check', 'legal_review'],
    },
    {
      id: 'pb3',
      name: 'Urgent email escalation',
      rule: 'IF email contains "urgent" AND confidence > 90% THEN extract action items AND notify manager',
      active: false,
      runs: 5,
      successRate: 80.0,
      category: 'workflow-automation',
      triggers: ['email_processed', 'urgency_detected'],
      actions: ['extract_actions', 'manager_notification'],
    },
  ]);

  // Audit Events
  readonly auditEvents = signal<AuditEvent[]>([
    {
      id: this.generateId(),
      document: 'vendor-invoice-2024-001.pdf',
      action: 'AI Extraction Completed',
      timestamp: new Date(),
      confidence: 96,
      details: 'Successfully extracted 6 fields using forml-document-v2.1 model',
      user: 'AI System'
    },
    {
      id: this.generateId(),
      document: 'service-agreement-Q4.pdf',
      action: 'Processing Started',
      timestamp: new Date(Date.now() - 1800000),
      confidence: 88,
      details: 'Contract analysis in progress with forml-legal-v1.5',
      user: 'AI System'
    },
    {
      id: this.generateId(),
      document: 'vendor-invoice-2024-001.pdf',
      action: 'Human Approval',
      timestamp: new Date(Date.now() - 300000),
      confidence: 100,
      details: 'Invoice approved by finance team member',
      user: 'john.doe@company.com'
    },
  ]);

  // AI Decisions
  readonly aiDecisions = signal<AIDecision[]>([
    {
      id: this.generateId(),
      document: 'vendor-invoice-2024-001.pdf',
      model: 'forml-document-v2.1',
      confidence: 96,
      extracted: 'Vendor: Acme Tech Solutions, Amount: $15,243.55, Due: 2024-12-15',
      timestamp: new Date(),
      inputTokens: 2341,
      outputTokens: 156
    },
    {
      id: this.generateId(),
      document: 'service-agreement-Q4.pdf',
      model: 'forml-legal-v1.5',
      confidence: 88,
      extracted: 'Contract Type: Service Agreement, Parties: 2, Value: $50,000',
      timestamp: new Date(Date.now() - 1800000),
      inputTokens: 4567,
      outputTokens: 234
    },
  ]);

  // Compliance Records
  readonly complianceRecords = signal<ComplianceRecord[]>([
    {
      id: this.generateId(),
      document: 'vendor-invoice-2024-001.pdf',
      action: 'Document Processed',
      user: 'AI System',
      timestamp: new Date(),
      compliant: true,
      notes: 'All required fields extracted with high confidence'
    },
    {
      id: this.generateId(),
      document: 'service-agreement-Q4.pdf',
      action: 'Legal Review Required',
      user: 'legal.team@company.com',
      timestamp: new Date(Date.now() - 1800000),
      compliant: false,
      notes: 'Contract requires manual review due to non-standard terms'
    },
    {
      id: this.generateId(),
      document: 'purchase-request-urgent.eml',
      action: 'Awaiting Processing',
      user: 'AI System',
      timestamp: new Date(Date.now() - 3600000),
      compliant: true,
      notes: 'Email queued for urgent processing'
    },
  ]);

  // Derived signals
  readonly enabledConnectors = computed(() => this.connectors().filter((c) => c.enabled));
  readonly pendingDocs = computed(() => this.documents().filter((d) => d.status !== 'approved'));
  readonly processingStats = computed(() => {
    const docs = this.documents();
    const total = docs.length;
    const processed = docs.filter(d => d.status === 'extracted' || d.status === 'approved').length;
    const avgConfidence = docs
      .filter(d => d.fields)
      .map(d => Object.values(d.fields!).reduce((sum, field) => sum + field.confidence, 0) / Object.keys(d.fields!).length)
      .reduce((sum, conf) => sum + conf, 0) / docs.filter(d => d.fields).length;

    return {
      total,
      processed,
      avgConfidence: avgConfidence || 0,
      processingRate: total > 0 ? (processed / total) * 100 : 0
    };
  });

  // Mutations
  toggleConnector(id: string) {
    this.connectors.update((arr) =>
      arr.map((c) => (c.id === id ? { ...c, enabled: !c.enabled, lastSync: c.enabled ? undefined : new Date().toISOString() } : c))
    );
  }

  addDocument(doc: DocumentItem) {
    this.documents.update((arr) => [doc, ...arr]);
    // Add audit event
    this.addAuditEvent({
      id: this.generateId(),
      document: doc.fileName,
      action: 'Document Uploaded',
      timestamp: new Date(),
      confidence: 100,
      details: `Document uploaded from ${doc.source || 'manual upload'}`,
      user: 'system'
    });
  }

  approveDoc(id: string) {
    this.documents.update((arr) => arr.map((d) => (d.id === id ? { ...d, status: 'approved' } : d)));
    const doc = this.documents().find(d => d.id === id);
    if (doc) {
      this.addComplianceRecord({
        id: this.generateId(),
        document: doc.fileName,
        action: 'Document Approved',
        user: 'current.user@company.com',
        timestamp: new Date(),
        compliant: true,
        notes: 'Document approved after AI extraction and verification'
      });
    }
  }

  addPlaybook(pb: Playbook) {
    this.playbooks.update((arr) => [pb, ...arr]);
  }

  addAuditEvent(event: AuditEvent) {
    this.auditEvents.update((arr) => [event, ...arr]);
  }

  addAIDecision(decision: AIDecision) {
    this.aiDecisions.update((arr) => [decision, ...arr]);
  }

  addComplianceRecord(record: ComplianceRecord) {
    this.complianceRecords.update((arr) => [record, ...arr]);
  }
}
