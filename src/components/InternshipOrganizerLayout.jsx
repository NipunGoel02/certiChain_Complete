import WorkspaceShell from './WorkspaceShell';
import { Activity, Award, BriefcaseBusiness, LayoutDashboard, Plus } from 'lucide-react';

export default function InternshipOrganizerLayout() {
  return <WorkspaceShell title="Internship studio" footerLabel="Organizer workspace" navItems={[
    { label: 'Overview', to: '/internships', icon: LayoutDashboard, end: true },
    { label: 'My internships', to: '/internships/my-internships', icon: BriefcaseBusiness },
    { label: 'Create internship', to: '/internships/create', icon: Plus },
    { label: 'Requests', to: '/internships/pending-invitations', icon: Award },
    { label: 'Analytics', to: '/internships/analytics', icon: Activity },
  ]} />;
}
