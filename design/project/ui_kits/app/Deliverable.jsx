window.Deliverable = function Deliverable() {
  return (
    <>
      <window.Toolbar
        breadcrumb={['Simulations', 'Lancement app mobile', 'Livrables']}
        title="Plan de roadmap Q3"
        subtitle="Soumis il y a 2 heures · Feedback coach disponible"
        actions={<>
          <window.Button variant="ghost" icon={<window.Icon name="download" size={16} />}>Télécharger</window.Button>
          <window.Button variant="primary" icon={<window.Icon name="send" size={16} color="#fff" />}>Soumettre v2</window.Button>
        </>}
      />
      <window.Page>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
          <window.Card style={{ padding: 32 }}>
            <window.Overline>Livrable</window.Overline>
            <h2 style={{ fontFamily: 'Montserrat', fontWeight: 800, fontSize: 26, color: '#1A2B48', margin: '6px 0 16px' }}>Plan de roadmap Q3 — v1</h2>
            <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#57534E', lineHeight: 1.7 }}>
              <p>Suite au sprint 2 et à la crise paiement, la roadmap Q3 se recentre sur 3 priorités :</p>
              <ol style={{ paddingLeft: 20 }}>
                <li><b style={{ color: '#1A2B48' }}>Stabilisation KYC</b> — dérisquer l'intégration Stripe (2 sprints).</li>
                <li><b style={{ color: '#1A2B48' }}>MVP pré-commande</b> — tenir la comm marketing sans bloquer le launch.</li>
                <li><b style={{ color: '#1A2B48' }}>Onboarding in-app</b> — préparer la conversion post-lancement.</li>
              </ol>
              <p>Budget réalloué : 28 k€ restants répartis 60/30/10 sur ces axes.</p>
            </div>
            <div style={{ marginTop: 20, padding: 16, background: '#F5F5F4', borderRadius: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
              <window.Icon name="paperclip" size={18} color="#78716C" />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#1A2B48' }}>roadmap-Q3-v1.pdf</div>
                <div style={{ fontFamily: 'Inter', fontSize: 12, color: '#78716C' }}>2.4 Mo · modifié il y a 2h</div>
              </div>
              <window.Button variant="ghost" size="sm">Ouvrir</window.Button>
            </div>
          </window.Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <window.Card style={{ padding: 24, borderLeft: '3px solid #EE7A3A' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 99, background: '#1A2B48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><window.Icon name="sparkles" size={16} color="#F59763" /></div>
                <div>
                  <window.Overline>Feedback coach</window.Overline>
                  <div style={{ fontFamily: 'Inter', fontSize: 12, color: '#78716C', marginTop: 2 }}>Analyse senior · 3 min de lecture</div>
                </div>
              </div>
              <h4 style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 18, color: '#1A2B48', margin: '4px 0 12px' }}>Solide sur la forme. Manque de conséquences.</h4>
              <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#292524', lineHeight: 1.6 }}>
                Votre priorisation est claire et votre réallocation budgétaire justifiée. Ce que j'attends en v2 : <b>expliciter ce qu'on arrête</b>. Une roadmap qui n'arrête rien est une wishlist.
              </div>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  { label: 'Structure & clarté', score: 88, tone: 'success' },
                  { label: 'Argumentation', score: 72, tone: 'warning' },
                  { label: 'Arbitrages explicites', score: 45, tone: 'error' },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Inter', fontSize: 13 }}>
                    <span style={{ flex: 1, color: '#44403C' }}>{s.label}</span>
                    <div style={{ width: 100 }}><window.ProgressBar value={s.score} color={s.tone === 'success' ? '#10B981' : s.tone === 'warning' ? '#F59E0B' : '#EF4444'} /></div>
                    <span style={{ width: 30, textAlign: 'right', color: '#1A2B48', fontWeight: 600 }}>{s.score}</span>
                  </div>
                ))}
              </div>
            </window.Card>

            <window.Card variant="outlined" style={{ padding: 20 }}>
              <window.Overline>2 pistes à creuser</window.Overline>
              <ul style={{ paddingLeft: 18, margin: '8px 0 0', fontFamily: 'Inter', fontSize: 13, color: '#44403C', lineHeight: 1.7 }}>
                <li>Ajoutez une section « Ce qu'on ne fait pas ce trimestre » avec 3 renoncements assumés.</li>
                <li>Chiffrez le coût d'opportunité de la stabilisation KYC vs. un contournement Stripe.</li>
              </ul>
            </window.Card>
          </div>
        </div>
      </window.Page>
    </>
  );
};
