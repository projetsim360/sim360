const { useState } = React;

// ========================================================================
// Button — primary / secondary / ghost / destructive, sizes sm/md/lg
// ========================================================================
window.Button = function Button({ variant = 'primary', size = 'md', icon, iconRight, children, onClick, disabled, style, ...rest }) {
  const base = { fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 600, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 8, border: 0, cursor: disabled ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', transition: 'all 200ms cubic-bezier(.16,1,.3,1)', opacity: disabled ? .5 : 1 };
  const sizes = { sm: { height: 32, padding: '0 12px', fontSize: 13 }, md: { height: 40, padding: '0 16px', fontSize: 14 }, lg: { height: 48, padding: '0 24px', fontSize: 14 } };
  const variants = {
    primary: { background: '#EE7A3A', color: '#fff' },
    secondary: { background: 'transparent', color: '#1A2B48', border: '1.5px solid #1A2B48' },
    ghost: { background: 'transparent', color: '#1A2B48' },
    destructive: { background: '#EF4444', color: '#fff' },
    accent: { background: '#FFF4ED', color: '#9C4718' },
  };
  const [hover, setHover] = useState(false);
  const hoverStyle = hover && !disabled ? ({
    primary: { background: '#D9652D' },
    secondary: { background: '#F0F4FA' },
    ghost: { background: '#F5F5F4' },
    destructive: { background: '#B91C1C' },
    accent: { background: '#FFE4D1' },
  }[variant] || {}) : {};
  return (
    <button style={{ ...base, ...sizes[size], ...variants[variant], ...hoverStyle, ...style }} disabled={disabled} onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} {...rest}>
      {icon}{children}{iconRight}
    </button>
  );
};

// ========================================================================
// Card
// ========================================================================
window.Card = function Card({ variant = 'default', children, style, onClick, ...rest }) {
  const styles = {
    default: { background: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(15,26,46,.06), 0 4px 12px rgba(15,26,46,.08)' },
    outlined: { background: '#fff', borderRadius: 8, border: '1px solid #D6D3D1' },
    filled: { background: '#F5F5F4', borderRadius: 8 },
    interactive: { background: '#fff', borderRadius: 8, boxShadow: '0 2px 4px rgba(15,26,46,.06), 0 4px 12px rgba(15,26,46,.08)', cursor: 'pointer', transition: 'box-shadow 200ms cubic-bezier(.16,1,.3,1)' },
  };
  return <div style={{ ...styles[variant], ...style }} onClick={onClick} {...rest}>{children}</div>;
};

// ========================================================================
// Input
// ========================================================================
window.Input = function Input({ label, required, helper, error, ...props }) {
  return (
    <div>
      {label && <label style={{ display: 'block', fontFamily: 'Inter', fontSize: 13, fontWeight: 500, color: '#292524', marginBottom: 6 }}>{label}{required && <span style={{ color: '#EE7A3A' }}> *</span>}</label>}
      <input {...props} style={{ width: '100%', fontFamily: 'Inter', fontSize: 14, color: '#292524', border: `1px solid ${error ? '#EF4444' : '#D6D3D1'}`, background: '#fff', borderRadius: 6, height: 40, padding: '0 12px', boxSizing: 'border-box', outline: 'none' }} />
      {helper && !error && <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#78716C', marginTop: 4 }}>{helper}</div>}
      {error && <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#B91C1C', marginTop: 4 }}>{error}</div>}
    </div>
  );
};

// ========================================================================
// Badge
// ========================================================================
window.Badge = function Badge({ tone = 'neutral', children, dot, style }) {
  const tones = {
    success: { bg: '#ECFDF5', color: '#047857', dotC: '#10B981' },
    warning: { bg: '#FFFBEB', color: '#B45309', dotC: '#F59E0B' },
    error: { bg: '#FEF2F2', color: '#B91C1C', dotC: '#EF4444' },
    info: { bg: '#EFF6FF', color: '#1D4ED8', dotC: '#3B82F6' },
    brand: { bg: '#F0F4FA', color: '#1A2B48', dotC: '#3D5478' },
    accent: { bg: '#FFE4D1', color: '#9C4718', dotC: '#EE7A3A' },
    neutral: { bg: '#F5F5F4', color: '#44403C', dotC: '#78716C' },
  };
  const t = tones[tone];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'Inter', fontSize: 12, fontWeight: 600, padding: '3px 9px', borderRadius: 4, background: t.bg, color: t.color, whiteSpace: 'nowrap', ...style }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 99, background: t.dotC }} />}
      {children}
    </span>
  );
};

// ========================================================================
// Avatar
// ========================================================================
window.Avatar = function Avatar({ initials, color = '#1A2B48', size = 36 }) {
  return <span style={{ width: size, height: size, borderRadius: 99, background: color, color: '#fff', fontFamily: 'Inter', fontWeight: 700, fontSize: size * 0.36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{initials}</span>;
};

// ========================================================================
// KpiTile
// ========================================================================
window.KpiTile = function KpiTile({ label, value, suffix, trend, trendDir = 'up', spark }) {
  const trendColor = { up: '#047857', down: '#B91C1C', neutral: '#78716C' }[trendDir];
  return (
    <window.Card style={{ padding: 16, minHeight: 130 }}>
      <div style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#78716C', marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 36, lineHeight: 1, color: '#1A2B48', letterSpacing: '-.02em' }}>{value}{suffix && <span style={{ color: '#A8A29E', fontSize: 20 }}>{suffix}</span>}</div>
      {trend && <div style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 600, color: trendColor, marginTop: 8 }}>{trend}</div>}
      {spark}
    </window.Card>
  );
};

// ========================================================================
// ProgressBar
// ========================================================================
window.ProgressBar = function ProgressBar({ value = 0, color = '#EE7A3A' }) {
  return (
    <div style={{ height: 6, background: '#E7E5E4', borderRadius: 99, overflow: 'hidden' }}>
      <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 99, transition: 'width 300ms cubic-bezier(.16,1,.3,1)' }} />
    </div>
  );
};

// ========================================================================
// Overline
// ========================================================================
window.Overline = function Overline({ children, style }) {
  return <div style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: '#78716C', ...style }}>{children}</div>;
};

// ========================================================================
// Icon (Lucide via CDN) — stand-in for KeenIcon
// ========================================================================
window.Icon = function Icon({ name, size = 16, color = 'currentColor', style }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current && window.lucide) { ref.current.innerHTML = ''; const el = document.createElement('i'); el.setAttribute('data-lucide', name); ref.current.appendChild(el); window.lucide.createIcons({ attrs: { width: size, height: size, 'stroke-width': 1.75, color } }); }
  }, [name, size, color]);
  return <span ref={ref} style={{ display: 'inline-flex', alignItems: 'center', color, ...style }} />;
};
