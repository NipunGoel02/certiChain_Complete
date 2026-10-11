import { useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Blocks, ShieldCheck, Sparkles } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('user');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    try {
      const user = await signup(email, password, name, role, phoneNumber);
      navigate(user?.role === 'recruiter' ? '/recruiter' : user?.role === 'internship' ? '/internships' : user?.role === 'hackathon organizer' ? '/organizer' : '/profile');
    } catch (err) {
      setError(err.message);
    }
  }

  return <section className="cc-auth-page"><div className="cc-auth-card">
    <aside className="cc-auth-aside"><Link to="/" className="cc-brand"><img src="/CertiChain.png" alt="CertiChain" /></Link><span className="cc-eyebrow"><Sparkles size={14} /> Your achievements, verified</span><h1>Start with a skill.<br /><em>Leave with proof.</em></h1><p>Create a profile for your learning, experience, and shareable credentials.</p><div className="cc-auth-aside__trust"><span><ShieldCheck size={17} /></span>One profile for every milestone <Blocks size={16} /></div><div className="cc-auth-aside__orb" aria-hidden="true"><Blocks size={70} /></div></aside>
    <div className="cc-auth-content"><form onSubmit={handleSubmit} className="cc-auth-form cc-auth-form--signup"><span className="cc-eyebrow">Create your account</span><h2>Join CertiChain</h2><p className="cc-auth-form__intro">Set up your account and choose a workspace.</p>{error && <div role="alert" className="cc-auth-error">{error}</div>}
      <div className="cc-auth-form__grid"><div><label htmlFor="signup-name">Name</label><input id="signup-name" type="text" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></div><div><label htmlFor="signup-email">Email address</label><input id="signup-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></div><div><label htmlFor="signup-mobile">Mobile number</label><input id="signup-mobile" type="tel" required autoComplete="tel" inputMode="tel" pattern="[+0-9() -]{10,20}" title="Enter a valid mobile number, including country code if outside India" placeholder="+91 98765 43210" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} /><small>Used for internship request calls.</small></div><div><label htmlFor="signup-role">Account type</label><select id="signup-role" value={role} onChange={(e) => setRole(e.target.value)}><option value="user">Learner</option><option value="recruiter">Recruiter</option><option value="internship">Internship Organizer</option><option value="hackathon organizer">Hackathon Organizer</option></select></div><div><label htmlFor="signup-password">Password</label><input id="signup-password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" /></div><div><label htmlFor="signup-confirm">Confirm password</label><input id="signup-confirm" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Enter it again" /></div></div>
      <button type="submit" className="cc-button cc-button--primary cc-auth-submit">Create account <ArrowRight size={17} /></button><p className="cc-auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
    </form></div>
  </div></section>;
}
