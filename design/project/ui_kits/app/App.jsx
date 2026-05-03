const { useState: useStateA } = React;

window.App = function App() {
  const [role, setRole] = useStateA(() => localStorage.getItem('p360.role') || 'learner');
  const [screen, setScreen] = useStateA(() => localStorage.getItem('p360.screen') || 'dashboard');
  const [pmoOpen, setPmoOpen] = useStateA(false);

  const nav = (s, r) => {
    if (r && r !== role) { setRole(r); localStorage.setItem('p360.role', r); }
    setScreen(s); localStorage.setItem('p360.screen', s);
  };

  let content;
  if (role === 'learner') {
    if (screen === 'dashboard' || screen === 'simulations' || screen === 'inbox' || screen === 'portfolio') content = <window.Dashboard onOpenPmo={() => setPmoOpen(true)} onNav={nav} />;
    else if (screen === 'simulation') content = <window.Simulation onOpenPmo={() => setPmoOpen(true)} />;
    else if (screen === 'deliverable') content = <window.Deliverable />;
    else content = <window.Dashboard onOpenPmo={() => setPmoOpen(true)} onNav={nav} />;
  } else {
    content = <window.Recruiter360 />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FAFAF9' }} data-screen-label={screen}>
      <window.Sidebar current={screen} onNav={nav} role={role} />
      <main style={{ flex: 1, minWidth: 0 }}>{content}</main>
      <window.Fab onClick={() => setPmoOpen(true)} notif={2} />
      <window.PmoDrawer open={pmoOpen} onClose={() => setPmoOpen(false)} />
    </div>
  );
};
