window.Dashboard = function Dashboard({ onOpenPmo, onNav }) {
  return (
    <>
      <window.Toolbar
        breadcrumb={['Accueil', 'Tableau de bord']}
        title="Bienvenue Alex."
        subtitle="3 simulations en cours. Votre score leadership progresse de 12% ce mois."
        actions={<>
          <window.Button variant="ghost" icon={<window.Icon name="download" size={16} />}>Exporter</window.Button>
          <window.Button variant="primary" icon={<window.Icon name="play" size={16} color="#fff" />}>Lancer une simulation</window.Button>
        </>}
      />
      <window.Page>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <window.KpiTile label="Simulations actives" value="3" trend="↑ 1 cette semaine" spark={<svg style={{ height: 28, width: '100%', marginTop: 8 }} viewBox="0 0 120 28"><path d="M 0 22 L 20 18 L 40 20 L 60 14 L 80 10 L 100 8 L 120 4" stroke="#10B981" strokeWidth="1.5" fill="none"/></svg>} />
          <window.KpiTile label="Score leadership" value="84" suffix="/100" trend="↑ 12 pts ce mois" spark={<svg style={{ height: 28, width: '100%', marginTop: 8 }} viewBox="0 0 120 28"><path d="M 0 22 L 20 18 L 40 14 L 60 12 L 80 8 L 100 6 L 120 4" stroke="#10B981" strokeWidth="1.5" fill="none"/></svg>} />
          <window.KpiTile label="Livrables rendus" value="7" suffix="/9" trend="→ 2 en attente" trendDir="neutral" />
          <window.KpiTile label="Temps décisionnel" value="1.8" suffix="min" trend="↓ 30s vs. S-1" trendDir="down" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          <window.Card style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
              <div>
                <window.Overline>Simulations</window.Overline>
                <h3 style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 22, color: '#1A2B48', margin: '4px 0 0' }}>En cours</h3>
              </div>
              <a style={{ fontFamily: 'Inter', fontSize: 13, color: '#EE7A3A', fontWeight: 600, cursor: 'pointer' }}>Voir tout →</a>
            </div>
            {[
              { title: 'Lancement app mobile — Q3', phase: 'Sprint 2 · Kickoff meeting', progress: 68, badge: 'À démarrer', tone: 'accent', team: ['AM','LR','CK'] },
              { title: 'Migration CRM — Banque privée', phase: 'Sprint 4 · Gestion de crise', progress: 42, badge: 'En cours', tone: 'success', team: ['AM','JB','PD','+2'] },
              { title: 'Relance produit SaaS', phase: 'Sprint 1 · Brief initial', progress: 15, badge: 'Brouillon', tone: 'brand', team: ['AM'] },
            ].map((s, i) => (
              <div key={i} onClick={() => onNav('simulation')} style={{ padding: '16px 0', borderTop: i > 0 ? '1px solid #E7E5E4' : 'none', cursor: 'pointer', display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <h4 style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 16, color: '#1A2B48', margin: 0 }}>{s.title}</h4>
                    <window.Badge tone={s.tone} dot>{s.badge}</window.Badge>
                  </div>
                  <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#57534E', marginBottom: 10 }}>{s.phase}</div>
                  <window.ProgressBar value={s.progress} />
                </div>
                <div style={{ display: 'flex' }}>
                  {s.team.map((t, j) => <div key={j} style={{ marginLeft: j > 0 ? -8 : 0 }}><window.Avatar initials={t} size={28} color={['#1A2B48','#EE7A3A','#3D5478','#78716C'][j % 4]} /></div>)}
                </div>
              </div>
            ))}
          </window.Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <window.Card style={{ padding: 20 }}>
              <window.Overline>Inbox</window.Overline>
              <h4 style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 18, color: '#1A2B48', margin: '4px 0 14px' }}>3 messages non lus</h4>
              {[
                { from: 'Léa Ramos (Lead Dev)', preview: 'Blocage sur l\'API paiement. On discute ?', time: '9 min' },
                { from: 'Jean Bachelet (PO)', preview: 'Retour utilisateur — priorités Q3.', time: '1 h' },
                { from: 'Coach PMO', preview: 'Votre feedback du sprint 1 est prêt.', time: '3 h' },
              ].map((m, i) => (
                <div key={i} style={{ padding: '10px 0', borderTop: i > 0 ? '1px solid #E7E5E4' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <span style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#1A2B48' }}>{m.from}</span>
                    <span style={{ fontFamily: 'Inter', fontSize: 11, color: '#78716C' }}>{m.time}</span>
                  </div>
                  <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#57534E', lineHeight: 1.4 }}>{m.preview}</div>
                </div>
              ))}
            </window.Card>

            <window.Card variant="interactive" style={{ padding: 20, background: '#1A2B48', color: '#fff' }} onClick={onOpenPmo}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 99, background: '#EE7A3A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><window.Icon name="sparkles" size={18} color="#fff" /></div>
                <window.Overline style={{ color: '#A8B9D4' }}>Agent PMO</window.Overline>
              </div>
              <h4 style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 18, color: '#fff', margin: '0 0 6px' }}>Feedback disponible</h4>
              <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#D6E0EF', lineHeight: 1.5 }}>Votre score de communication a baissé de 12%. Je vous propose 2 pistes.</div>
              <div style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#F59763', marginTop: 12 }}>Ouvrir le coach →</div>
            </window.Card>
          </div>
        </div>
      </window.Page>
    </>
  );
};
