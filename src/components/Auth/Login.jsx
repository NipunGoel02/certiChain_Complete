import { useState } from 'react';
import { useAuth } from '../../Context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Blocks, ShieldCheck, Sparkles } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const user = await login(email, password);
      if (user?.role === 'admin') navigate('/admin');
      else if (user?.role === 'hackathon organizer') navigate('/organizer');
      else if (user?.role === 'internship') navigate('/internships');
      else if (user?.role === 'recruiter') navigate('/recruiter');
      else navigate('/profile');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();
    try {
      const user = await signup(email, password, username, role, phoneNumber);
      if (user?.role === 'admin') navigate('/admin');
      else if (user?.role === 'hackathon organizer') navigate('/organizer');
      else if (user?.role === 'internship') navigate('/internships');
      else if (user?.role === 'recruiter') navigate('/recruiter');
      else navigate('/profile');
    } catch (err) {
      setError(err.message);
    }
  }

  const toggleMode = () => {
    setIsSignUpMode(!isSignUpMode);
    setError('');
  };

  return <section className="cc-auth-page">
    <div className="cc-auth-card">
      <div className="cc-auth-aside"><Link to="/" className="cc-brand"><img src="/CertiChain.png" alt="CertiChain" /></Link><span className="cc-eyebrow"><Sparkles size={14} /> Your achievements, verified</span><h1>Proof of progress,<br /><em>all in one place.</em></h1><p>Learn, build, and share credentials backed by verifiable records.</p><div className="cc-auth-aside__trust"><span><ShieldCheck size={17} /></span>Blockchain-backed credentials <ArrowUpRight size={15} /></div><div className="cc-auth-aside__orb" aria-hidden="true"><Blocks size={70} /></div></div>
      <div className="cc-auth-content"><div className="cc-auth-tabs" role="tablist" aria-label="Account access"><button type="button" role="tab" aria-selected={!isSignUpMode} className={!isSignUpMode ? 'is-active' : ''} onClick={() => { setIsSignUpMode(false); setError(''); }}>Sign in</button><button type="button" role="tab" aria-selected={isSignUpMode} className={isSignUpMode ? 'is-active' : ''} onClick={() => { setIsSignUpMode(true); setError(''); }}>Create account</button></div>
        {!isSignUpMode ? <form onSubmit={handleLogin} className="cc-auth-form"><span className="cc-eyebrow">Welcome back</span><h2>Sign in to CertiChain</h2><p className="cc-auth-form__intro">Pick up where your learning journey left off.</p>{error && <div role="alert" className="cc-auth-error">{error}</div>}<label htmlFor="login-email">Email address</label><input id="login-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /><label htmlFor="login-password">Password</label><input id="login-password" type="password" autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required /><button type="submit" className="cc-button cc-button--primary cc-auth-submit">Sign in <ArrowRight size={17} /></button><p className="cc-auth-switch">New to CertiChain? <button type="button" onClick={toggleMode}>Create an account</button></p></form> : <form onSubmit={handleSignup} className="cc-auth-form cc-auth-form--signup"><span className="cc-eyebrow">Start building</span><h2>Create your account</h2><p className="cc-auth-form__intro">Choose how you’ll use CertiChain. You can update your profile later.</p>{error && <div role="alert" className="cc-auth-error">{error}</div>}<div className="cc-auth-form__grid"><div><label htmlFor="signup-name">Name</label><input id="signup-name" type="text" autoComplete="name" placeholder="Your name" value={username} onChange={(e) => setUsername(e.target.value)} required /></div><div><label htmlFor="signup-email">Email address</label><input id="signup-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div><div><label htmlFor="signup-phone">Mobile number</label><input id="signup-phone" type="tel" autoComplete="tel" inputMode="tel" pattern="[+0-9() -]{10,20}" title="Enter a valid mobile number, including country code if outside India" placeholder="+91 98765 43210" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required /></div><div><label htmlFor="signup-password">Password</label><input id="signup-password" type="password" autoComplete="new-password" placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div><div className="cc-auth-form__full"><label htmlFor="signup-role">Account type</label><select id="signup-role" value={role} onChange={(e) => setRole(e.target.value)} required><option value="user">Learner</option><option value="hackathon organizer">Hackathon Organizer</option><option value="internship">Internship Organizer</option><option value="recruiter">Recruiter</option></select></div></div><button type="submit" className="cc-button cc-button--primary cc-auth-submit">Create account <ArrowRight size={17} /></button><p className="cc-auth-switch">Already have an account? <button type="button" onClick={toggleMode}>Sign in</button></p></form>}
      </div>
    </div>
  </section>;
}
