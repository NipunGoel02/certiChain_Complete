import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BriefcaseBusiness, CalendarDays, CircleAlert, Clock3, UserRound } from 'lucide-react';
import axios from 'axios';

const InternshipDetail = () => {
  const { id } = useParams();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInternship = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/internships/' + id, {
          headers: { Authorization: 'Bearer ' + token }
        });
        setInternship(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch internship details');
        setLoading(false);
      }
    };
    fetchInternship();
  }, [id]);

  if (loading) return <main className="cc-record-page"><div className="cc-record-skeleton" aria-label="Loading internship details" /></main>;
  if (error) return <main className="cc-record-page"><section className="cc-state-card cc-state-card--error" role="alert"><CircleAlert /><h1>Internship details unavailable</h1><p>{error}</p><Link to="/internships/my-internships">Back to my internships</Link></section></main>;

  return <main className="cc-record-page">
    <Link className="cc-back-link" to="/internships/my-internships"><ArrowLeft size={16} /> My internships</Link>
    <section className="cc-record-hero"><span className="cc-record-icon"><BriefcaseBusiness size={22} /></span><span className="cc-kicker">INTERNSHIP RECORD</span><h1>{internship.title}</h1><p>{internship.description}</p></section>
    <section className="cc-record-facts" aria-label="Internship details">
      <article><CalendarDays /><span><small>Start date</small><strong>{new Date(internship.startDate).toLocaleString()}</strong></span></article>
      <article><Clock3 /><span><small>End date</small><strong>{new Date(internship.endDate).toLocaleString()}</strong></span></article>
      <article><UserRound /><span><small>Organizer</small><strong>{internship.organizer?.name || 'CertiChain organizer'}</strong><small>{internship.organizer?.email}</small></span></article>
    </section>
  </main>;
};

export default InternshipDetail;
