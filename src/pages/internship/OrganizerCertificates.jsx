import React, { useEffect, useState } from 'react';
import { Award, CircleAlert, Mail, Send, Users } from 'lucide-react';
import axios from 'axios';

const OrganizerCertificates = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCertificateType, setSelectedCertificateType] = useState('participation');

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/internships/organizer/participants', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setParticipants(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch participants');
        setLoading(false);
      }
    };
    fetchParticipants();
  }, []);

  const handleGenerateCertificate = async (participantId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/internships/organizer/certificates/generate', {
        participantId,
        certificateType: selectedCertificateType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Certificate generation request sent');
    } catch (err) {
      alert('Failed to send certificate request');
    }
  };

  return <main className="cc-data-page">
    <header className="cc-data-heading"><div><span className="cc-kicker">CREDENTIAL DISTRIBUTION</span><h1>Issue certificates</h1><p>Choose a certificate type, then send a generation request to a participant.</p></div><div className="cc-data-count"><Users size={17} />{loading ? 'Loading' : `${participants.length} participants`}</div></header>
    <section className="cc-certificate-toolbar"><span><Award size={17} />Certificate type</span><label htmlFor="internship-certificate-type" className="sr-only">Certificate type</label><select id="internship-certificate-type" value={selectedCertificateType} onChange={(event) => setSelectedCertificateType(event.target.value)}><option value="participation">Participation</option><option value="completion">Completion</option></select></section>
    {error ? <section className="cc-state-card cc-state-card--error" role="alert"><CircleAlert /><h2>Couldn’t load participants</h2><p>{error}. Refresh the page to try again.</p></section>
      : loading ? <div className="cc-data-skeleton" aria-label="Loading participants"><i /><i /><i /></div>
        : participants.length === 0 ? <section className="cc-state-card"><Users /><h2>No participants found</h2><p>Participants associated with your internships will appear here.</p></section>
          : <section className="cc-record-list" aria-label="Participants">{participants.map((participant) => <article key={participant._id} className="cc-participant-row"><span className="cc-record-icon"><Users size={20} /></span><div className="cc-participant-row__main"><h2>{participant.name || 'Participant'}</h2><p><Mail size={14} />{participant.email || 'Email unavailable'}</p></div><div className="cc-participant-row__internship"><small>INTERNSHIP</small><strong>{participant.internshipTitle || 'Internship title unavailable'}</strong></div><button type="button" className="cc-issue-button" onClick={() => handleGenerateCertificate(participant._id)}><Send size={15} />Generate request</button></article>)}</section>}
  </main>;
};

export default OrganizerCertificates;
