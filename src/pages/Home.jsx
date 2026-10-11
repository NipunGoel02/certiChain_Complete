import Hero from '../Hero';
import { Link } from 'react-router-dom';
import { ArrowRight, Award, BookOpenCheck, Blocks, BriefcaseBusiness, Check, ShieldCheck, Sparkles, Users } from 'lucide-react';

const pathways = [
  { icon: BookOpenCheck, eyebrow: 'Learn', title: 'Build practical skills', text: 'Explore focused courses, learn at your pace, and turn completed work into credentials you can share.', to: '/courses', action: 'Explore courses', tone: 'violet' },
  { icon: Users, eyebrow: 'Compete', title: 'Put skills to the test', text: 'Join a hackathon, collaborate with a team, and make your contribution part of your portfolio.', to: '/hackathons', action: 'Find hackathons', tone: 'blue' },
  { icon: BriefcaseBusiness, eyebrow: 'Grow', title: 'Make experience count', text: 'Keep internship participation and achievement records together with your verified credentials.', to: '/signup', action: 'Get started', tone: 'mint' },
];

export default function Home() {
  return <div className="cc-home">
    <section className="cc-home__hero"><Hero /></section>
    <section className="cc-home__intro cc-content-width">
      <div><span className="cc-eyebrow"><Sparkles size={14} /> A clearer record of what you can do</span><h2>Learning is a journey.<br /><span>Your proof should travel with you.</span></h2><p>CertiChain brings learning, hands-on experience, and blockchain-backed credentials into one place.</p></div>
      <div className="cc-trust-card"><span className="cc-trust-card__icon"><ShieldCheck size={23} /></span><div><strong>Verifiable by design</strong><p>Share a credential that anyone can check on-chain.</p></div><span className="cc-trust-card__check"><Check size={16} /></span></div>
    </section>
    <section className="cc-home__pathways cc-content-width" aria-labelledby="pathways-title">
      <div className="cc-section-heading"><div><span className="cc-eyebrow">One platform, more ways forward</span><h2 id="pathways-title">Choose your next step</h2></div><Link to="/courses" className="cc-inline-link">Browse learning <ArrowRight size={16} /></Link></div>
      <div className="cc-pathway-grid">{pathways.map(({ icon: Icon, eyebrow, title, text, to, action, tone }, index) => <article className={`cc-pathway-card cc-pathway-card--${tone}`} key={title}>
        <div className="cc-pathway-card__top"><span className="cc-pathway-card__icon"><Icon size={21} /></span><span className="cc-pathway-card__number">0{index + 1}</span></div><span className="cc-pathway-card__eyebrow">{eyebrow}</span><h3>{title}</h3><p>{text}</p><Link to={to} className="cc-inline-link">{action}<ArrowRight size={16} /></Link>
      </article>)}</div>
    </section>
    <section className="cc-proof-band"><div className="cc-content-width cc-proof-band__inner"><div><span className="cc-eyebrow">Credentials with context</span><h2>Every achievement tells a fuller story.</h2><p>Bring together course completion, hackathon participation, and internship records in a profile you control.</p><Link className="cc-button cc-button--primary" to="/signup">Create your profile <ArrowRight size={17} /></Link></div><div className="cc-proof-stack" aria-label="A credential record includes learning, experience, and verification"><div className="cc-proof-stack__item"><span><BookOpenCheck size={17} /></span><div><b>Learning</b><small>Courses and skill milestones</small></div><Check size={17} /></div><div className="cc-proof-stack__item"><span><Award size={17} /></span><div><b>Experience</b><small>Hackathons and internships</small></div><Check size={17} /></div><div className="cc-proof-stack__item"><span><Blocks size={17} /></span><div><b>Verification</b><small>On-chain credential proof</small></div><Check size={17} /></div></div></div></section>
  </div>;
}
