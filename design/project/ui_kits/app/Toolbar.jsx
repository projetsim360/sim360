window.Toolbar = function Toolbar({ title, breadcrumb, actions, subtitle }) {
  return (
    <div style={{ padding: '24px 40px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
      <div>
        {breadcrumb && <div style={{ fontFamily: 'Inter', fontSize: 12, color: '#78716C', marginBottom: 6, display: 'flex', gap: 6, alignItems: 'center' }}>
          {breadcrumb.map((b, i) => <React.Fragment key={i}>{i > 0 && <span style={{ color: '#D6D3D1' }}>/</span>}<span style={{ color: i === breadcrumb.length - 1 ? '#1A2B48' : '#78716C', fontWeight: i === breadcrumb.length - 1 ? 600 : 400 }}>{b}</span></React.Fragment>)}
        </div>}
        <h1 style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 32, lineHeight: 1.15, color: '#1A2B48', margin: 0, letterSpacing: '-.015em' }}>{title}</h1>
        {subtitle && <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#57534E', marginTop: 6 }}>{subtitle}</div>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>{actions}</div>}
    </div>
  );
};

window.Page = function Page({ children }) {
  return <div style={{ padding: '32px 40px 80px', display: 'flex', flexDirection: 'column', gap: 24 }}>{children}</div>;
};
