window.Recruiter360 = function Recruiter360() {
  const scores = [
    { axis: 'Communication', value: 82, peer: 68 },
    { axis: 'Décision sous pression', value: 76, peer: 62 },
    { axis: 'Leadership', value: 71, peer: 65 },
    { axis: 'Gestion budget', value: 58, peer: 70 },
    { axis: 'Priorisation', value: 84, peer: 66 },
    { axis: 'Communication non-violente', value: 64, peer: 58 },
  ];
  return (
    <>
      <window.Toolbar
        breadcrumb={['Candidats', 'Alex Martin', 'Rapport 360']}
        title="Alex Martin — Rapport 360"
        subtitle="Scénario : « Crise paiement Q3 » · Complété le 17 avr. 2026"
        actions={<>
          <window.Button variant="ghost" icon={<window.Icon name="share-2" size={16} />}>Partager</window.Button>
          <window.Button variant="secondary" icon={<window.Icon name="download" size={16} />}>Exporter PDF</window.Button>
          <window.Button variant="primary" icon={<window.Icon name="check" size={16} color="#fff" />}>Shortlister</window.Button>
        </>}
      />
      <window.Page>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <window.KpiTile label="Score global" value="76" suffix="/100" trend="Top 22% cohorte" />
          <window.KpiTile label="Temps total" value="2h 14" trend="→ médiane 2h 30" trendDir="neutral" />
          <window.KpiTile label="Décisions clés" value="7" suffix="/8" trend="1 évitée" trendDir="down" />
          <window.KpiTile label="Niveau estimé" value="Senior" trend="Confiance 87%" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <window.Card style={{ padding: 24 }}>
            <window.Overline>Radar 6 axes</window.Overline>
            <h3 style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 20, color: '#1A2B48', margin: '4px 0 16px' }}>Profil comportemental</h3>
            <RadarChart scores={scores} />
          </window.Card>

          <window.Card style={{ padding: 24 }}>
            <window.Overline>Analyse senior</window.Overline>
            <h3 style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 20, color: '#1A2B48', margin: '4px 0 12px' }}>Profil leadership stratégique</h3>
            <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#292524', lineHeight: 1.6, marginBottom: 16 }}>
              Alex structure vite, priorise clairement, et sait arbitrer sous contrainte. Point à surveiller : <b style={{ color: '#B45309' }}>la gestion budgétaire</b> reste à 58 — mêmes signaux sur 2 simulations.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {scores.map(s => (
                <div key={s.axis} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 40px', gap: 12, alignItems: 'center', fontFamily: 'Inter', fontSize: 13 }}>
                  <span style={{ color: '#44403C' }}>{s.axis}</span>
                  <div style={{ position: 'relative', height: 6, background: '#E7E5E4', borderRadius: 99 }}>
                    <div style={{ position: 'absolute', left: `${s.peer}%`, top: -3, width: 2, height: 12, background: '#78716C', opacity: .5 }} />
                    <div style={{ width: `${s.value}%`, height: '100%', background: s.value >= 70 ? '#10B981' : s.value >= 60 ? '#F59E0B' : '#EF4444', borderRadius: 99 }} />
                  </div>
                  <span style={{ textAlign: 'right', color: '#1A2B48', fontWeight: 600 }}>{s.value}</span>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: 'Inter', fontSize: 11, color: '#78716C', marginTop: 12, display: 'flex', gap: 16 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 14, height: 4, background: '#10B981', borderRadius: 99 }} />Score candidat</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 2, height: 12, background: '#78716C', opacity: .5 }} />Médiane cohorte</span>
            </div>
          </window.Card>
        </div>

        <window.Card style={{ padding: 24 }}>
          <window.Overline>Moments clés</window.Overline>
          <h3 style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 20, color: '#1A2B48', margin: '4px 0 16px' }}>Timeline de la simulation</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { t: '00:08', event: 'Acceptation du brief', badge: 'success', desc: 'Reformulation claire, 3 questions de cadrage.' },
              { t: '00:42', event: 'Crise paiement annoncée', badge: 'warning', desc: 'Réaction calme, demande d\'options chiffrées.' },
              { t: '01:15', event: 'Décision — tenir la date', badge: 'success', desc: 'Arbitrage assumé, communiqué à l\'équipe en 4 min.' },
              { t: '01:48', event: 'Budget dépassé', badge: 'error', desc: 'Pas de relecture du budget avant validation — signal.' },
              { t: '02:14', event: 'Livrable soumis', badge: 'info', desc: 'Plan de roadmap Q3 — note 76/100.' },
            ].map((e, i, arr) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '70px 24px 1fr auto', gap: 14, padding: '12px 0', position: 'relative' }}>
                <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#78716C', alignSelf: 'flex-start', paddingTop: 3 }}>{e.t}</span>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 99, background: { success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6' }[e.badge], marginTop: 6 }} />
                  {i < arr.length - 1 && <div style={{ position: 'absolute', top: 18, left: 4, bottom: -10, width: 2, background: '#E7E5E4' }} />}
                </div>
                <div>
                  <div style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: '#1A2B48' }}>{e.event}</div>
                  <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#57534E', marginTop: 2 }}>{e.desc}</div>
                </div>
                <window.Badge tone={e.badge}>{e.badge === 'success' ? 'Fort' : e.badge === 'warning' ? 'Attention' : e.badge === 'error' ? 'Faille' : 'Info'}</window.Badge>
              </div>
            ))}
          </div>
        </window.Card>
      </window.Page>
    </>
  );
};

function RadarChart({ scores }) {
  const cx = 180, cy = 180, r = 130;
  const n = scores.length;
  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i, v) => [cx + Math.cos(angle(i)) * r * (v / 100), cy + Math.sin(angle(i)) * r * (v / 100)];
  const path = scores.map((s, i) => pt(i, s.value)).map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ') + ' Z';
  const peerPath = scores.map((s, i) => pt(i, s.peer)).map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ') + ' Z';
  return (
    <svg viewBox="0 0 360 360" style={{ width: '100%', height: 'auto', maxWidth: 360, display: 'block', margin: '0 auto' }}>
      {[.25, .5, .75, 1].map(k => (
        <polygon key={k} points={scores.map((_, i) => pt(i, 100 * k).join(',')).join(' ')} fill="none" stroke="#E7E5E4" strokeWidth="1" />
      ))}
      {scores.map((_, i) => {
        const [x, y] = pt(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#E7E5E4" strokeWidth="1" />;
      })}
      <path d={peerPath} fill="#78716C" fillOpacity=".08" stroke="#78716C" strokeOpacity=".4" strokeDasharray="3 3" />
      <path d={path} fill="#EE7A3A" fillOpacity=".2" stroke="#EE7A3A" strokeWidth="2" />
      {scores.map((s, i) => {
        const [x, y] = pt(i, s.value);
        return <circle key={i} cx={x} cy={y} r="4" fill="#EE7A3A" />;
      })}
      {scores.map((s, i) => {
        const [x, y] = pt(i, 115);
        return <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontFamily="Inter" fontSize="11" fontWeight="600" fill="#1A2B48">{s.axis.split(' ')[0]}</text>;
      })}
    </svg>
  );
}
