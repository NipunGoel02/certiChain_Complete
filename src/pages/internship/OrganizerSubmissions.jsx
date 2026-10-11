import React, { useEffect, useState } from 'react';
import { BriefcaseBusiness, CircleAlert, Mail, Users } from 'lucide-react';
import axios from 'axios';

const OrganizerSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/internships/organizer/submissions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubmissions(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch submissions');
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  return <main className="cc-data-page">
    <header className="cc-data-heading"><div><span className="cc-kicker">PARTICIPANT RECORDS</span><h1>Internship submissions</h1><p>Participant and internship details received by your organization.</p></div><div className="cc-data-count"><Users size={17} />{loading ? 'Loading' : `${submissions.length} records`}</div></header>
    {error ? <section className="cc-state-card cc-state-card--error" role="alert"><CircleAlert /><h2>Couldn’t load submissions</h2><p>{error}. Refresh the page to try again.</p></section>
      : loading ? <div className="cc-data-skeleton" aria-label="Loading submissions"><i /><i /><i /></div>
        : submissions.length === 0 ? <section className="cc-state-card"><BriefcaseBusiness /><h2>No submissions yet</h2><p>Participant records will appear here when they are available.</p></section>
          : <section className="cc-record-list" aria-label="Internship submissions">{submissions.map((submission) => <article key={submission._id} className="cc-participant-row"><span className="cc-record-icon"><Users size={20} /></span><div className="cc-participant-row__main"><h2>{submission.user?.name || 'Participant name unavailable'}</h2><p><Mail size={14} />{submission.user?.email || 'Email unavailable'}</p></div><div className="cc-participant-row__internship"><small>INTERNSHIP</small><strong>{submission.internshipTitle || 'Internship title unavailable'}</strong></div><p className="cc-participant-row__details">{submission.details || 'No additional details provided.'}</p></article>)}</section>}
  </main>;
};

export default OrganizerSubmissions;
