import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Award, CircleAlert, Mail, Send, Users } from 'lucide-react';

const Participants = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [certificateTypes, setCertificateTypes] = useState({});
  const [processingParticipantId, setProcessingParticipantId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/hackathons/organizer/participants', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
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

  const handleCertificateTypeChange = (participantId, value) => {
    setCertificateTypes((prev) => ({ ...prev, [participantId]: value }));
  };

  const handleGenerateCertificate = async (participant) => {
    const certificateType = certificateTypes[participant._id] || 'participation';
    setProcessingParticipantId(participant._id);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/hackathons/organizer/certificates/generate', {
        participantId: participant._id,
        hackathonId: participant.hackathonId,
        certificateType: certificateType
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccessMessage('Certificate request sent');
    } catch (err) {
      setErrorMessage('Failed to send certificate request');
    } finally {
      setProcessingParticipantId(null);
    }
  };

  return <main className="cc-data-page">
    <header className="cc-data-heading"><div><span className="cc-kicker">EVENT ROSTER</span><h1>Participants</h1><p>Review people registered across your hackathons and issue their credential requests.</p></div><div className="cc-data-count"><Users size={17} />{loading ? 'Loading' : `${participants.length} participants`}</div></header>
    {successMessage && <div className="cc-inline-notice cc-inline-notice--success" role="status">{successMessage}</div>}{errorMessage && <div className="cc-inline-notice cc-inline-notice--error" role="alert">{errorMessage}</div>}
    {error ? <section className="cc-state-card cc-state-card--error" role="alert"><CircleAlert /><h2>Couldn’t load participants</h2><p>{error}. Refresh the page to try again.</p></section>
      : loading ? <div className="cc-data-skeleton" aria-label="Loading participants"><i /><i /><i /></div>
        : participants.length === 0 ? <section className="cc-state-card"><Users /><h2>No participants found</h2><p>People registered for your hackathons will appear here.</p></section>
          : <section className="cc-record-list" aria-label="Hackathon participants">{participants.map((participant) => <article className="cc-participant-row" key={participant._id}><span className="cc-record-icon"><Users size={20} /></span><div className="cc-participant-row__main"><h2>{participant.name || 'Participant'}</h2><p><Mail size={14} />{participant.email || 'Email unavailable'}</p></div><div className="cc-participant-row__internship"><small>HACKATHON</small><strong>{participant.hackathonTitle || 'Hackathon title unavailable'}</strong></div><label className="cc-participant-certificate"><span>Credential type</span><select value={certificateTypes[participant._id] || 'participation'} onChange={(event) => handleCertificateTypeChange(participant._id, event.target.value)}><option value="participation">Participation</option><option value="winner1">Winner 1st</option><option value="winner2">Winner 2nd</option><option value="winner3">Winner 3rd</option></select></label><button type="button" className="cc-issue-button" onClick={() => handleGenerateCertificate(participant)} disabled={processingParticipantId === participant._id}><Send size={15} />{processingParticipantId === participant._id ? 'Sending…' : 'Generate request'}</button></article>)}</section>}
  </main>;
};

export default Participants;
