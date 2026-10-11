import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowUpRight, CircleAlert, Code2, ExternalLink, Layers3, Link2, Users } from 'lucide-react';

const OrganizerSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
        const response = await axios.get('/api/hackathons/organizer/submissions', config);
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
    <header className="cc-data-heading"><div><span className="cc-kicker">PROJECT REVIEW</span><h1>Submissions</h1><p>Review project details and links shared by hackathon teams.</p></div><div className="cc-data-count"><Code2 size={17} />{loading ? 'Loading' : `${submissions.length} submissions`}</div></header>
    {error ? <section className="cc-state-card cc-state-card--error" role="alert"><CircleAlert /><h2>Couldn’t load submissions</h2><p>{error}. Refresh the page to try again.</p></section>
      : loading ? <div className="cc-data-skeleton" aria-label="Loading submissions"><i /><i /><i /></div>
        : submissions.length === 0 ? <section className="cc-state-card"><Code2 /><h2>No project submissions</h2><p>Submissions will appear here after teams send their projects.</p></section>
          : <section className="cc-project-list" aria-label="Hackathon submissions">{submissions.map((submission) => <article className="cc-project-card" key={submission._id}><header><span className="cc-record-icon"><Code2 size={20} /></span><div><span className="cc-kicker">{submission.hackathonTitle || 'HACKATHON'}</span><h2>{submission.title}</h2></div><span className="cc-project-date">{new Date(submission.submittedAt).toLocaleDateString()}</span></header><p>{submission.description}</p><div className="cc-project-stack"><Layers3 size={15} /><span>{submission.techStack || 'Technology stack not provided'}</span></div>{submission.challenges && <p className="cc-project-challenges"><strong>Challenges:</strong> {submission.challenges}</p>}<footer><a href={submission.projectUrl} target="_blank" rel="noopener noreferrer"><Link2 size={14} /> Source project <ExternalLink size={12} /></a>{submission.demoUrl && <a href={submission.demoUrl} target="_blank" rel="noopener noreferrer"><ArrowUpRight size={14} /> Live demo <ExternalLink size={12} /></a>}</footer></article>)}</section>}
  </main>;
};

export default OrganizerSubmissions;
