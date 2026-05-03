const { useState: useStateS } = React;

window.Sidebar = function Sidebar({ current, onNav, role = 'learner' }) {
  const learnerItems = [
    { id: 'dashboard', icon: 'layout-dashboard', label: 'Tableau de bord' },
    { id: 'simulations', icon: 'play', label: 'Simulations' },
    { id: 'simulation', icon: 'video', label: 'Meeting en cours', badge: 'Live' },
    { id: 'deliverable', icon: 'file-text', label: 'Livrables' },
    { id: 'inbox', icon: 'inbox', label: 'Inbox', badge: 3 },
    { id: 'portfolio', icon: 'briefcase', label: 'Portfolio' },
  ];
  const recruiterItems = [
    { id: 'recruiter', icon: 'layout-dashboard', label: 'Évaluations' },
    { id: 'candidates', icon: 'users', label: 'Candidats', badge: 12 },
    { id: 'report', icon: 'bar-chart-3', label: 'Rapport 360' },
    { id: 'scenarios', icon: 'play', label: 'Scénarios' },
  ];
  const items = role === 'learner' ? learnerItems : recruiterItems;
  return (
    <aside style={{ width: 260, background: '#1A2B48', height: '100vh', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, flexShrink: 0 }}>
      <div style={{ padding: '20px 20px 24px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <img src="../../assets/logo-pragma360-wordmark-reverse.svg" style={{ height: 24, display: 'block' }} />
      </div>
      <nav style={{ padding: '16px 12px', flex: 1, overflow: 'auto' }}>
        <window.Overline style={{ color: '#A8B9D4', padding: '6px 12px', marginBottom: 4 }}>{role === 'learner' ? 'Apprenant' : 'Recruteur'}</window.Overline>
        {items.map(it => <NavItem key={it.id} item={it} active={current === it.id} onClick={() => onNav(it.id)} />)}
      </nav>
      <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <RoleSwitch role={role} onNav={onNav} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
          <window.Avatar initials={role === 'learner' ? 'AM' : 'CK'} color="#EE7A3A" size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{role === 'learner' ? 'Alex Martin' : 'Claire Kahn'}</div>
            <div style={{ fontFamily: 'Inter', fontSize: 11, color: '#A8B9D4' }}>{role === 'learner' ? 'Apprenant · Senior' : 'DRH · Cabinet Fellows'}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

function NavItem({ item, active, onClick }) {
  const [hover, setHover] = useStateS(false);
  const bg = active ? 'rgba(238,122,58,.15)' : hover ? 'rgba(255,255,255,.06)' : 'transparent';
  const color = active ? '#F59763' : '#D6E0EF';
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '9px 12px', borderRadius: 6, border: 0, background: bg, color, cursor: 'pointer', fontFamily: 'Inter', fontSize: 13, fontWeight: active ? 600 : 500, textAlign: 'left', transition: 'all 150ms' }}>
      <window.Icon name={item.icon} size={18} color={color} />
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.badge && <window.Badge tone={item.badge === 'Live' ? 'accent' : 'brand'} style={{ background: item.badge === 'Live' ? '#EE7A3A' : 'rgba(255,255,255,.12)', color: item.badge === 'Live' ? '#fff' : '#D6E0EF' }}>{item.badge}</window.Badge>}
    </button>
  );
}

function RoleSwitch({ role, onNav }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,.08)', padding: 3, borderRadius: 6, marginBottom: 8 }}>
      {[['learner', 'Apprenant', 'dashboard'], ['recruiter', 'Recruteur', 'recruiter']].map(([r, label, first]) => (
        <button key={r} onClick={() => onNav(first, r)} style={{ flex: 1, padding: '6px 8px', borderRadius: 4, border: 0, background: role === r ? '#EE7A3A' : 'transparent', color: role === r ? '#fff' : '#A8B9D4', fontFamily: 'Inter', fontSize: 11, fontWeight: 600, cursor: 'pointer', transition: 'all 150ms' }}>{label}</button>
      ))}
    </div>
  );
}
