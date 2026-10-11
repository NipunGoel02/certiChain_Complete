import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowUpRight, CalendarDays, CircleAlert, Plus, Users, Zap } from 'lucide-react';

const MyHackathons = () => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyHackathons = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/hackathons/my', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setHackathons(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch your hackathons');
        setLoading(false);
      }
    };
    fetchMyHackathons();
  }, []);

  return <main className="cc-data-page">
    <header className="cc-data-heading"><div><span className="cc-kicker">YOUR EVENTS</span><h1>My hackathons</h1><p>Events you created or joined, gathered in one place.</p></div><Link to="/hackathons/create" className="cc-hackathons__create"><Plus size={16} /> Create event</Link></header>
    {error ? <section className="cc-state-card cc-state-card--error" role="alert"><CircleAlert /><h2>Couldn’t load your events</h2><p>{error}. Refresh the page to try again.</p></section>
      : loading ? <div className="cc-event-grid" aria-label="Loading hackathons">{[1, 2, 3].map((item) => <div className="cc-event-skeleton" key={item} />)}</div>
        : hackathons.length === 0 ? <section className="cc-state-card"><Zap /><h2>No hackathons yet</h2><p>Events you create or join will be listed here.</p><Link to="/hackathons">Explore hackathons</Link></section>
          : <section className="cc-event-grid" aria-label="My hackathons">{hackathons.map((hackathon) => <article className="cc-event-card" key={hackathon._id}><Link to={`/hackathons/${hackathon._id}`} className="cc-event-card__banner" aria-label={`View ${hackathon.title}`}>
            {hackathon.banner ? <img src={hackathon.banner} alt="" loading="lazy" /> : <div className="cc-event-card__fallback"><Zap size={30} /><span>{hackathon.title}</span></div>}<span className={`cc-event-status cc-event-status--${hackathon.status}`}>{hackathon.status}</span></Link><div className="cc-event-card__body"><p className="cc-kicker">YOUR EVENT</p><h2><Link to={`/hackathons/${hackathon._id}`}>{hackathon.title}</Link></h2><p className="cc-event-card__description">{hackathon.description}</p><div className="cc-event-card__meta"><span><CalendarDays size={15} />{new Date(hackathon.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – {new Date(hackathon.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>{Array.isArray(hackathon.participants) && <span><Users size={15} />{hackathon.participants.length} participants</span>}</div><Link className="cc-event-card__link" to={`/hackathons/${hackathon._id}`}>View details <ArrowUpRight size={16} /></Link></div></article>)}</section>}
  </main>;
};

export default MyHackathons;
