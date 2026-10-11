import WorkspaceShell from './WorkspaceShell';
import { BookOpen, Users, Plus } from 'lucide-react';

export default function AdminLayout() {
  return <WorkspaceShell title="Admin studio" footerLabel="Administration" navItems={[
    { label: 'Courses', to: '/admin/courses', icon: BookOpen },
    { label: 'Users', to: '/admin/users', icon: Users },
    { label: 'Add course', to: '/admin/courses/new', icon: Plus },
  ]} />;
}
