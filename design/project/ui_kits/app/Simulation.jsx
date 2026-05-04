window.Simulation = function Simulation({ onOpenPmo }) {
  const [decision, setDecision] = React.useState(null);
  const messages = [
    { from: 'Léa Ramos', role: 'Lead Dev', color: '#EE7A3A', initials: 'LR', text: 'On est en retard sur le module paiement. Stripe nous demande une revalidation KYC.' },
    { from: 'Jean Bachelet', role: 'PO', color: '#3D5478', initials: 'JB', text: 'La date de lancement ne peut pas bouger. Marketing a déjà acheté les campagnes.' },
    { from: 'Priya Dhawan', role: 'Design', color: '#78716C', initials: 'PD', text: 'On peut livrer une v1 sans paiement si besoin, juste un CTA "Pré-commander".' },
  ];
  return (
    <>
      <window.Toolbar
        breadcrumb={['Simulations', 'Lancement app mobile — Q3', 'Meeting de crise']}
        title="Décision — planning vs. qualité"
        subtitle="Kickoff de crise · 3 participants · 12:08 restantes"
        actions={<>
          <window.Button variant="ghost" icon={<window.Icon name="pause" size={16} />}>Pause</window.Button>
          <window.Button variant="secondary" icon={<window.Icon name="flag" size={16} />}>Quitter la réunion</window.Button>
        </>}
      />
      <window.Page>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <window.Card style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ background: '#0F1A2E', padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 99, background: '#EE7A3A', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <window.Icon name="mic" size={18} color="#fff" />
                  <div style={{ position: 'absolute', inset: -4, borderRadius: 99, border: '2px solid #EE7A3A', opacity: .5, animation: 'pulse 1.5s infinite' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Inter', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: '#F59763', fontWeight: 600 }}>Meeting en cours</div>
                  <div style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 18, color: '#fff', marginTop: 2 }}>Sprint 2 · Gestion de crise paiement</div>
                </div>
                <window.Badge tone="error" dot>Live</window.Badge>
              </div>
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <window.Overline>Transcript</window.Overline>
                {messages.map((m, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12 }}>
                    <window.Avatar initials={m.initials} color={m.color} size={36} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 4 }}>
                        <span style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#1A2B48' }}>{m.from}</span>
                        <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#78716C' }}>{m.role}</span>
                      </div>
                      <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#292524', lineHeight: 1.55, background: '#F5F5F4', padding: '10px 14px', borderRadius: 8 }}>{m.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </window.Card>

            <window.Card style={{ padding: 24, borderTop: '3px solid #EE7A3A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <window.Icon name="zap" size={18} color="#EE7A3A" />
                <window.Overline style={{ color: '#9C4718' }}>Décision requise</window.Overline>
              </div>
              <h3 style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 20, color: '#1A2B48', margin: '0 0 16px' }}>Que faites-vous ?</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { id: 'a', label: 'Tenir la date. Livrer sans paiement, CTA pré-commande.' },
                  { id: 'b', label: 'Décaler de 2 semaines. Prévenir marketing dès maintenant.' },
                  { id: 'c', label: 'Négocier avec Stripe un contournement temporaire.' },
                ].map(o => (
                  <label key={o.id} style={{ display: 'flex', gap: 12, padding: 14, borderRadius: 8, border: `1.5px solid ${decision === o.id ? '#EE7A3A' : '#D6D3D1'}`, background: decision === o.id ? '#FFF4ED' : '#fff', cursor: 'pointer', fontFamily: 'Inter', fontSize: 14, color: '#292524', alignItems: 'center', transition: 'all 150ms' }}>
                    <input type="radio" checked={decision === o.id} onChange={() => setDecision(o.id)} style={{ accentColor: '#EE7A3A' }} />
                    <span style={{ flex: 1 }}>{o.label}</span>
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
                <window.Button variant="ghost">Demander conseil au PMO</window.Button>
                <window.Button variant="primary" disabled={!decision} icon={<window.Icon name="check" size={16} color="#fff" />}>Valider la décision</window.Button>
              </div>
            </window.Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <window.Card style={{ padding: 20 }}>
              <window.Overline>Contexte</window.Overline>
              <h4 style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 16, color: '#1A2B48', margin: '4px 0 12px' }}>Contraintes clés</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'Inter', fontSize: 13, color: '#57534E' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}><window.Icon name="calendar" size={16} color="#78716C" /><span><b style={{ color: '#1A2B48' }}>Deadline :</b> 15 juillet — ferme.</span></div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}><window.Icon name="euro" size={16} color="#78716C" /><span><b style={{ color: '#1A2B48' }}>Budget restant :</b> 28 k€ sur 120 k€.</span></div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}><window.Icon name="users" size={16} color="#78716C" /><span><b style={{ color: '#1A2B48' }}>Équipe :</b> 6 personnes, 2 en congé.</span></div>
              </div>
            </window.Card>
            <window.Card style={{ padding: 20 }}>
              <window.Overline>Score en direct</window.Overline>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10 }}>
                {[['Communication', 72, '#EE7A3A'],['Décision', 84, '#10B981'],['Leadership', 68, '#3B82F6']].map(([k,v,c]) => (
                  <div key={k}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter', fontSize: 12, marginBottom: 4 }}><span style={{ color: '#57534E' }}>{k}</span><span style={{ color: '#1A2B48', fontWeight: 600 }}>{v}</span></div>
                    <window.ProgressBar value={v} color={c} />
                  </div>
                ))}
              </div>
            </window.Card>
            <window.Button variant="secondary" icon={<window.Icon name="sparkles" size={16} />} onClick={onOpenPmo}>Ouvrir le coach IA</window.Button>
          </div>
        </div>
      </window.Page>
    </>
  );
};
