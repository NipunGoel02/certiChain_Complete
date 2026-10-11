import WorkspaceShell from './WorkspaceShell';
import { Activity, FileCheck2, Search } from 'lucide-react';

export default function RecruiterLayout() {
  return <WorkspaceShell title="Talent studio" footerLabel="Recruiter workspace" navItems={[
    { label: 'Candidates', to: '/recruiter', icon: Search, end: true },
    { label: 'Analytics', to: '/recruiter/analytics', icon: Activity },
    { label: 'ProofCall', to: '/recruiter/assessments', icon: FileCheck2 },
  ]} />;
}
