import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return <footer className="cc-site-footer">
    <div className="cc-site-footer__inner">
      <div className="cc-site-footer__brand"><Link to="/" className="cc-brand"><img src="/CertiChain.png" alt="CertiChain" /></Link><p>Skills earned. Achievements verified. Credentials that travel with you.</p></div>
      <div className="cc-site-footer__links"><strong>Explore</strong><Link to="/courses">Courses</Link><Link to="/hackathons">Hackathons</Link><Link to="/signup">Create an account</Link></div>
      <div className="cc-site-footer__trust"><ShieldCheck size={18} /><span>Credentials anchored to blockchain</span></div>
    </div>
    <div className="cc-site-footer__bottom"><span>© {new Date().getFullYear()} CertiChain</span><span>Learn · Build · Verify</span></div>
  </footer>;
}
