import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowUpRight, CalendarDays, Search, Users, Zap } from 'lucide-react';

const HackathonList = () => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/hackathons');
        setHackathons(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching hackathons:', error);
        setError('We could not load hackathons right now. Please try again.');
        setLoading(false);
      }
    };
    fetchHackathons();
  }, []);

  const filteredHackathons = hackathons.filter((hackathon) => {
    const matchesFilter = filter === 'all' || hackathon.status === filter;
    const matchesSearch = hackathon.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return <main className="cc-hackathons">
    <header className="cc-hackathons__hero"><div><span className="cc-kicker"><Zap size={13} /> BUILD TOGETHER</span><h1>Hackathons</h1><p>Discover events, join a team, and share the projects you build.</p></div><Link to="/hackathons/create" className="cc-hackathons__create">Organize an event <ArrowUpRight size={16} /></Link></header>
    <section className="cc-hackathons__filters" aria-label="Find hackathons"><label><Search size={17} /><span className="sr-only">Search hackathons</span><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search events by name" /></label><div role="group" aria-label="Filter by event status">{['all', 'upcoming', 'active', 'completed'].map((status) => <button key={status} type="button" aria-pressed={filter === status} className={filter === status ? 'is-selected' : ''} onClick={() => setFilter(status)}>{status === 'all' ? 'All events' : status}</button>)}</div></section>
    {loading ? <div className="cc-event-grid" aria-label="Loading hackathons">{[1, 2, 3].map((item) => <div className="cc-event-skeleton" key={item} />)}</div>
      : error ? <section className="cc-state-card cc-state-card--error" role="alert"><h2>Hackathons are unavailable</h2><p>{error}</p><button type="button" onClick={() => window.location.reload()}>Try again</button></section>
      : filteredHackathons.length === 0 ? <section className="cc-state-card"><Zap /><h2>No hackathons found</h2><p>{searchTerm ? `No results for “${searchTerm}”. Try another event name.` : `There are no ${filter === 'all' ? '' : `${filter} `}hackathons available right now.`}</p></section>
        : <section className="cc-event-grid" aria-label="Available hackathons">{filteredHackathons.map((hackathon) => <article className="cc-event-card" key={hackathon._id}><Link to={`/hackathons/${hackathon._id}`} className="cc-event-card__banner" aria-label={`View ${hackathon.title}`}>
          {hackathon.banner ? <img src={hackathon.banner} alt="" loading="lazy" /> : <div className="cc-event-card__fallback"><Zap size={30} /><span>{hackathon.title}</span></div>}
          <span className={`cc-event-status cc-event-status--${hackathon.status}`}>{hackathon.status}</span></Link><div className="cc-event-card__body"><p className="cc-kicker">HACKATHON</p><h2><Link to={`/hackathons/${hackathon._id}`}>{hackathon.title}</Link></h2><p className="cc-event-card__description">{hackathon.description}</p><div className="cc-event-card__meta"><span><CalendarDays size={15} />{new Date(hackathon.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} – {new Date(hackathon.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>{Array.isArray(hackathon.participants) && <span><Users size={15} />{hackathon.participants.length} participants</span>}</div><Link className="cc-event-card__link" to={`/hackathons/${hackathon._id}`}>View event <ArrowUpRight size={16} /></Link></div></article>)}</section>}
  </main>;
};

export default HackathonList;
