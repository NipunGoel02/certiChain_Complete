import WorkspaceShell from './WorkspaceShell';
import { Activity, Award, BriefcaseBusiness, Users } from 'lucide-react';

export default function HackathonOrganizerLayout() {
  return <WorkspaceShell title="Hackathon studio" footerLabel="Organizer workspace" navItems={[
    { label: 'My hackathons', to: '/organizer/my-hackathons', icon: BriefcaseBusiness },
    { label: 'Participants', to: '/organizer/participants', icon: Users },
    { label: 'Submissions', to: '/organizer/submissions', icon: Award },
    { label: 'Analytics', to: '/organizer/analytics', icon: Activity },
  ]} />;
}
