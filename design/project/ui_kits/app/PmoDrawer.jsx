window.PmoDrawer = function PmoDrawer({ open, onClose }) {
  const [tab, setTab] = React.useState('chat');
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(8,17,31,.5)', zIndex: 100, animation: 'fade 200ms' }} />
      <div style={{ position: 'fixed', top: 20, right: 20, bottom: 20, width: 540, maxWidth: 'calc(100vw - 40px)', background: '#fff', borderRadius: 12, boxShadow: '0 16px 40px rgba(15,26,46,.18)', zIndex: 101, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E7E5E4', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 99, background: '#1A2B48', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <window.Icon name="sparkles" size={20} color="#F59763" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 16, color: '#1A2B48' }}>Agent PMO</div>
            <div style={{ fontFamily: 'Inter', fontSize: 12, color: '#78716C' }}>Coach senior · disponible 24/7</div>
          </div>
          <button onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: 6, borderRadius: 6 }}>
            <window.Icon name="x" size={20} color="#78716C" />
          </button>
        </div>
        <div style={{ display: 'flex', padding: '0 24px', borderBottom: '1px solid #E7E5E4', gap: 24 }}>
          {[['chat', 'Chat'], ['context', 'Contexte']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ border: 0, background: 'transparent', padding: '12px 0', fontFamily: 'Inter', fontSize: 14, fontWeight: 600, color: tab === id ? '#1A2B48' : '#78716C', borderBottom: `2px solid ${tab === id ? '#EE7A3A' : 'transparent'}`, cursor: 'pointer', marginBottom: -1 }}>{label}</button>
          ))}
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: 24, background: '#FAFAF9' }}>
          {tab === 'chat' ? <ChatTab /> : <ContextTab />}
        </div>

        {tab === 'chat' && (
          <div style={{ padding: 16, borderTop: '1px solid #E7E5E4', background: '#fff' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <input placeholder="Demandez un conseil au PMO…" style={{ flex: 1, border: '1px solid #D6D3D1', borderRadius: 6, height: 40, padding: '0 12px', fontFamily: 'Inter', fontSize: 14, outline: 'none' }} />
              <window.Button variant="primary" icon={<window.Icon name="send" size={16} color="#fff" />} />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

function ChatTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 99, background: '#1A2B48', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><window.Icon name="sparkles" size={16} color="#F59763" /></div>
        <div style={{ background: '#fff', padding: '12px 14px', borderRadius: 8, border: '1px solid #E7E5E4', flex: 1 }}>
          <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#292524', lineHeight: 1.55 }}>
            Votre score de communication a baissé de 12% sur la dernière simulation. Dans le meeting de crise, vous avez coupé la parole à Léa deux fois sans reformuler sa contrainte technique.
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 99, background: '#1A2B48', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><window.Icon name="sparkles" size={16} color="#F59763" /></div>
        <div style={{ background: '#fff', padding: '12px 14px', borderRadius: 8, border: '1px solid #E7E5E4', flex: 1 }}>
          <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#292524', lineHeight: 1.55, marginBottom: 8 }}>Deux pistes concrètes :</div>
          <ol style={{ paddingLeft: 18, margin: 0, fontFamily: 'Inter', fontSize: 14, color: '#292524', lineHeight: 1.6 }}>
            <li>Reformulez la contrainte technique <b>avant</b> de trancher.</li>
            <li>Testez le pattern « Je comprends que X. Ma contrainte est Y. »</li>
          </ol>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <div style={{ background: '#1A2B48', color: '#fff', padding: '12px 14px', borderRadius: 8, maxWidth: 340 }}>
          <div style={{ fontFamily: 'Inter', fontSize: 14, lineHeight: 1.55 }}>OK, tu peux me montrer un exemple concret avec Léa ?</div>
        </div>
        <window.Avatar initials="AM" color="#EE7A3A" size={32} />
      </div>
      <div style={{ display: 'flex', gap: 8, fontFamily: 'Inter', fontSize: 13, color: '#78716C', padding: '4px 0' }}>
        <div style={{ display: 'flex', gap: 3 }}>
          <span style={{ width: 6, height: 6, borderRadius: 99, background: '#EE7A3A', animation: 'bounce 1s infinite' }} />
          <span style={{ width: 6, height: 6, borderRadius: 99, background: '#EE7A3A', animation: 'bounce 1s infinite .15s' }} />
          <span style={{ width: 6, height: 6, borderRadius: 99, background: '#EE7A3A', animation: 'bounce 1s infinite .3s' }} />
        </div>
        <span>Le PMO rédige une réponse…</span>
      </div>
    </div>
  );
}

function ContextTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <window.Overline>Simulation active</window.Overline>
        <div style={{ fontFamily: 'Montserrat', fontWeight: 700, fontSize: 16, color: '#1A2B48', marginTop: 4 }}>Lancement app mobile — Q3</div>
        <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#57534E', marginTop: 4 }}>Sprint 2 · Gestion de crise paiement</div>
      </div>
      <window.Card variant="outlined" style={{ padding: 16 }}>
        <window.Overline>Objectifs pédagogiques</window.Overline>
        <ul style={{ paddingLeft: 18, margin: '8px 0 0', fontFamily: 'Inter', fontSize: 13, color: '#292524', lineHeight: 1.7 }}>
          <li>Arbitrer date vs. qualité sous pression</li>
          <li>Communiquer une mauvaise nouvelle au PO</li>
          <li>Réallouer un budget contraint</li>
        </ul>
      </window.Card>
      <window.Card variant="outlined" style={{ padding: 16 }}>
        <window.Overline>Historique</window.Overline>
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8, fontFamily: 'Inter', fontSize: 13, color: '#57534E' }}>
          <div>12 interactions sur cette simulation</div>
          <div>3 décisions clés prises</div>
          <div>Dernière activité : <b style={{ color: '#1A2B48' }}>il y a 9 min</b></div>
        </div>
      </window.Card>
    </div>
  );
}

window.Fab = function Fab({ onClick, notif }) {
  return (
    <button onClick={onClick} style={{ position: 'fixed', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 99, background: '#EE7A3A', border: 0, cursor: 'pointer', boxShadow: '0 8px 24px rgba(15,26,46,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} aria-label="Ouvrir l'agent PMO">
      <window.Icon name="sparkles" size={22} color="#fff" />
      {notif && <span style={{ position: 'absolute', top: -4, right: -4, minWidth: 20, height: 20, borderRadius: 99, background: '#EF4444', color: '#fff', border: '2px solid #FAFAF9', fontFamily: 'Inter', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>{notif}</span>}
    </button>
  );
};
