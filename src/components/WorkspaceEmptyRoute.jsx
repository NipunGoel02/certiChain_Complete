import { Activity, ClipboardCheck } from 'lucide-react';

export default function WorkspaceEmptyRoute({ kind }) {
  const judging = kind === 'judging';
  const Icon = judging ? ClipboardCheck : Activity;
  const title = judging ? 'Judging workspace' : 'Hackathon analytics';
  return <main className="cc-state-card cc-route-unavailable">
    <span className="cc-record-icon"><Icon size={21} /></span>
    <span className="cc-kicker">ORGANIZER WORKSPACE</span>
    <h1>{title}</h1>
    <p>{judging ? 'Judging tools are not connected to a scoring workflow in this version.' : 'This route does not yet have a reporting endpoint, so no activity metrics are shown here.'}</p>
  </main>;
}
