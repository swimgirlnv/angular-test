import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ConnectorsComponent } from './pages/connectors/connectors.component';
import { IngestComponent } from './pages/ingest/ingest.component';
import { PlaybooksComponent } from './pages/playbooks/playbooks.component';
import { AuditComponent } from './pages/audit/audit.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent, title: 'forml AI Ops Console' },
  { path: 'connectors', component: ConnectorsComponent, title: 'Data Sources' },
  { path: 'ingest', component: IngestComponent, title: 'AI Processing' },
  { path: 'playbooks', component: PlaybooksComponent, title: 'Automation' },
  { path: 'audit', component: AuditComponent, title: 'Audit Trail' },
  { path: '**', redirectTo: '' },
];
