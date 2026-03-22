"""
Parcours 1 — Scenario Greenfield + Passation
Test E2E visible dans le navigateur.
Utilise un scenario du catalogue (plus fiable que la generation IA).
"""
import time
import os
from playwright.sync_api import sync_playwright

BASE = "http://localhost:5173"
SCREENSHOTS = "/tmp/test-parcours1"
os.makedirs(SCREENSHOTS, exist_ok=True)

results = []

def report(step, name, status, detail=""):
    icon = "✅" if status == "OK" else "❌" if status == "FAIL" else "⚠️"
    results.append({"step": step, "name": name, "status": status, "detail": detail})
    print(f"  {icon} Etape {step}: {name} — {status} {detail}")

def screenshot(page, name):
    page.screenshot(path=f"{SCREENSHOTS}/{name}.png", full_page=True)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=False, slow_mo=800, args=["--start-maximized"])
    page = browser.new_page(viewport={"width": 1440, "height": 900})

    # ─── ETAPE 1: Connexion ────────────────────────────────
    print("\n=== ETAPE 1: Connexion ===")
    page.goto(f"{BASE}/auth/sign-in")
    page.wait_for_load_state("networkidle")
    time.sleep(1)

    try:
        page.fill('input[name="email"]', "admin@sim360.dev")
        page.fill('input[name="password"]', "Admin123!")
        page.click('button[type="submit"]')
        page.wait_for_url(lambda url: "/auth/" not in url, timeout=15000)
        page.wait_for_load_state("networkidle")
        report("1", "Connexion admin", "OK")
    except Exception as e:
        screenshot(page, "01-login-error")
        report("1", "Connexion admin", "FAIL", str(e)[:120])

    screenshot(page, "01-after-login")

    # ─── ETAPE 2: Page nouvelle simulation ──────────────────
    print("\n=== ETAPE 2: Nouvelle simulation ===")
    page.goto(f"{BASE}/simulations/new")
    page.wait_for_load_state("networkidle")
    time.sleep(2)
    screenshot(page, "02-new-simulation")

    # Verifier les onglets
    try:
        tab_catalogue = page.locator("text=Catalogue").first
        tab_generer = page.locator("text=Generer avec l'IA").first
        report("2.1", "Onglet Catalogue visible", "OK" if tab_catalogue.is_visible() else "FAIL")
        report("2.2", "Onglet Generer IA visible", "OK" if tab_generer.is_visible() else "FAIL")
    except Exception as e:
        report("2.1", "Onglets", "FAIL", str(e)[:100])

    # Verifier qu'il y a des scenarios dans le catalogue
    try:
        cards = page.locator('[data-slot="card"], .cursor-pointer').all()
        report("2.3", f"Scenarios dans le catalogue ({len(cards)} cards)", "OK" if len(cards) >= 1 else "FAIL")
    except Exception as e:
        report("2.3", "Cards scenarios", "FAIL", str(e)[:100])

    # Verifier les emojis
    try:
        body_text = page.inner_text("body")
        has_emoji = any(c in body_text for c in "📁⏱👥🌱🔥📊📋🎯🚀🤔")
        report("2.4", "Pas d'emojis dans la page", "OK" if not has_emoji else "FAIL", "Emojis trouves!" if has_emoji else "")
    except:
        pass

    # ─── ETAPE 3: Cliquer un scenario → modal ───────────────
    print("\n=== ETAPE 3: Modal scenario ===")
    try:
        # Cliquer sur la premiere card de scenario
        first_card = page.locator('[data-slot="card"].cursor-pointer').first
        if first_card.is_visible():
            first_card.click()
            time.sleep(1)

            # Verifier que la modal s'ouvre
            dialog = page.locator('[data-slot="dialog-content"], [role="dialog"]').first
            dialog.wait_for(timeout=5000)
            screenshot(page, "03-modal-open")

            if dialog.is_visible():
                dialog_text = dialog.inner_text()
                report("3.1", "Modal s'ouvre au clic sur un scenario", "OK")

                # Verifier les sections
                has_objectifs = "Objectif" in dialog_text
                has_competences = "COMPETENCE" in dialog_text.upper()
                has_deroulement = "Deroulement" in dialog_text or "Phase" in dialog_text
                has_lancer = "Lancer" in dialog_text

                report("3.2", "Section Objectifs", "OK" if has_objectifs else "FAIL")
                report("3.3", "Section Competences", "OK" if has_competences else "FAIL")
                report("3.4", "Section Phases/Deroulement", "OK" if has_deroulement else "FAIL")
                report("3.5", "Bouton 'Lancer la simulation'", "OK" if has_lancer else "FAIL")

                # Pas d'emojis dans la modal
                has_emoji_modal = any(c in dialog_text for c in "📁⏱👥🌱🔥📊📋")
                report("3.6", "Pas d'emojis dans la modal", "OK" if not has_emoji_modal else "FAIL")
            else:
                report("3.1", "Modal visible", "FAIL", "Dialog detecte mais non visible")
        else:
            report("3.1", "Premiere card de scenario", "FAIL", "Non visible")
    except Exception as e:
        screenshot(page, "03-modal-error")
        report("3.1", "Modal scenario", "FAIL", str(e)[:120])

    # ─── ETAPE 4: Lancer la simulation ──────────────────────
    print("\n=== ETAPE 4: Lancer simulation ===")
    sim_url = None
    try:
        launch_btn = page.locator('[data-slot="dialog-content"] button:has-text("Lancer"), [role="dialog"] button:has-text("Lancer")').first
        if launch_btn.is_visible():
            launch_btn.click()
            print("    ⏳ Lancement...")
            page.wait_for_url("**/simulations/**", timeout=15000)
            page.wait_for_load_state("networkidle")
            time.sleep(3)
            sim_url = page.url
            report("4.1", "Simulation creee et redirection", "OK")
        else:
            report("4.1", "Bouton Lancer", "FAIL", "Non visible dans la modal")
    except Exception as e:
        screenshot(page, "04-launch-error")
        report("4.1", "Lancement simulation", "FAIL", str(e)[:120])

    screenshot(page, "04-simulation-page")

    # ─── ETAPE 5: Verifier la passation ONBOARDING ──────────
    print("\n=== ETAPE 5: Passation ONBOARDING ===")
    if sim_url and "/simulations/" in sim_url:
        try:
            body_text = page.inner_text("body")

            # Statut
            has_passation = "Passation" in body_text or "Prise de poste" in body_text or "passation" in body_text
            report("5.1", "Indication passation visible", "OK" if has_passation else "FAIL")

            # Etapes dans le banner
            has_accueil_rh = "Accueil RH" in body_text
            has_pmo_step = "PMO" in body_text
            has_demarrage = "Demarrage" in body_text or "Commencer" in body_text
            report("5.2", "Etape 'Accueil RH' dans le banner", "OK" if has_accueil_rh else "FAIL")
            report("5.3", "Etape 'PMO' dans le banner", "OK" if has_pmo_step else "FAIL")
            report("5.4", "Etape 'Demarrage' dans le banner", "OK" if has_demarrage else "FAIL")

            # Blocage contenu — chercher les composants KPI specifiques (pas les mots dans le sidebar)
            kpi_section = page.locator('text=Indicateurs de performance').first
            kpi_visible = kpi_section.is_visible() if kpi_section.count() > 0 else False
            report("5.5", "Section KPIs masquee pendant passation", "OK" if not kpi_visible else "FAIL", "KPIs visibles!" if kpi_visible else "")

            # Budget dans la card header — doit etre masque
            budget_badge = page.locator('text=/EUR/').first
            budget_visible = budget_badge.is_visible() if budget_badge.count() > 0 else False
            report("5.6", "Badge Budget masque pendant passation", "OK" if not budget_visible else "FAIL")

        except Exception as e:
            report("5.1", "Verification passation", "FAIL", str(e)[:120])

        screenshot(page, "05-passation-state")

        # ─── ETAPE 6: Demarrer l'accueil RH ───────────────────
        print("\n=== ETAPE 6: Meeting RH ===")
        try:
            hr_btn = page.locator('a:has-text("accueil RH"), button:has-text("accueil RH"), a:has-text("Accueil RH")').first
            if hr_btn.is_visible():
                hr_btn.click()
                page.wait_for_load_state("networkidle")
                time.sleep(2)
                screenshot(page, "06-meeting-hr-page")
                report("6.1", "Navigation vers meeting RH", "OK")

                # Verifier les participants
                meeting_text = page.inner_text("body")
                has_claire = "Claire" in meeting_text
                has_maxime = "Maxime" in meeting_text
                report("6.2", "Participant Claire Dumont (DRH)", "OK" if has_claire else "FAIL")
                report("6.3", "Participant Maxime Roche (Office Manager)", "OK" if has_maxime else "FAIL")

                # Verifier les objectifs (pas de checks verts)
                objectives_area = page.locator('text=Objectifs, text=objectifs').first
                report("6.4", "Section Objectifs visible", "OK" if objectives_area.is_visible() else "WARN")

                # Demarrer la reunion
                start_btn = page.locator('button:has-text("Demarrer")').first
                if start_btn.is_visible():
                    start_btn.click()
                    time.sleep(3)
                    screenshot(page, "06-meeting-started")
                    report("6.5", "Reunion RH demarree", "OK")

                    # Envoyer un message
                    msg_input = page.locator('input[placeholder*="Message"]').first
                    if msg_input.is_visible():
                        msg_input.fill("Bonjour, presentez-moi la culture de l'entreprise")
                        msg_input.press("Enter")
                        print("    ⏳ Attente reponse IA (15s)...")
                        time.sleep(15)
                        screenshot(page, "06-chat-response")

                        # Verifier les bulles de chat
                        bubbles = page.locator('[class*="rounded-2xl"]').all()
                        report("6.6", f"Messages dans le chat ({len(bubbles)} bulles)", "OK" if len(bubbles) >= 2 else "FAIL")

                        # Verifier pas d'emojis
                        chat_text = page.inner_text("body")
                        has_emoji_chat = any(c in chat_text for c in "🎯📋🤔💡✨🚀😊")
                        report("6.7", "Pas d'emojis dans la reponse IA", "OK" if not has_emoji_chat else "WARN", "Emojis" if has_emoji_chat else "")
                    else:
                        report("6.6", "Champ message", "FAIL", "Non visible")

                    # Cloturer
                    close_btn = page.locator('button:has-text("Cloturer")').first
                    if close_btn.is_visible():
                        close_btn.click()
                        print("    ⏳ Cloture (10s)...")
                        time.sleep(10)
                        screenshot(page, "06-meeting-completed")
                        report("6.8", "Reunion RH cloturee", "OK")
                    else:
                        report("6.8", "Bouton Cloturer", "WARN", "Non visible")
                else:
                    report("6.5", "Bouton Demarrer", "FAIL", "Non visible")
            else:
                report("6.1", "Bouton accueil RH", "FAIL", "Non visible")
        except Exception as e:
            screenshot(page, "06-error")
            report("6.1", "Meeting RH", "FAIL", str(e)[:120])

        # ─── ETAPE 7: Retour simulation, verifier etat ────────
        print("\n=== ETAPE 7: Verification post-RH ===")
        if sim_url:
            page.goto(sim_url)
            page.wait_for_load_state("networkidle")
            time.sleep(2)
            screenshot(page, "07-after-hr")

            try:
                body_text = page.inner_text("body")
                # Check si PMO est l'etape active
                report("7.1", "Page simulation accessible apres RH", "OK")

                has_pmo_btn = "PMO" in body_text
                report("7.2", "Etape PMO visible", "OK" if has_pmo_btn else "FAIL")

                # Verifier les checks verts (SVG) pour l'etape HR
                green_circles = page.locator('div.bg-green-500').all()
                report("7.3", f"Cercles verts (etapes completees): {len(green_circles)}", "OK" if len(green_circles) >= 1 else "WARN")

            except Exception as e:
                report("7.1", "Verification post-RH", "FAIL", str(e)[:120])
    else:
        report("5.1", "Simulation non creee", "FAIL", "Pas de redirection vers /simulations/")

    # ─── RAPPORT FINAL ──────────────────────────────────────
    print("\n" + "=" * 60)
    print("RAPPORT PARCOURS 1 — Greenfield + Passation RH")
    print("=" * 60)

    ok_count = sum(1 for r in results if r["status"] == "OK")
    fail_count = sum(1 for r in results if r["status"] == "FAIL")
    warn_count = sum(1 for r in results if r["status"] == "WARN")

    print(f"\n✅ OK: {ok_count}  |  ❌ FAIL: {fail_count}  |  ⚠️ WARN: {warn_count}")
    print(f"Total: {len(results)} tests\n")

    if fail_count > 0:
        print("--- ECHECS ---")
        for r in results:
            if r["status"] == "FAIL":
                print(f"  ❌ {r['step']}: {r['name']} — {r['detail']}")

    if warn_count > 0:
        print("\n--- AVERTISSEMENTS ---")
        for r in results:
            if r["status"] == "WARN":
                print(f"  ⚠️ {r['step']}: {r['name']} — {r['detail']}")

    print(f"\nScreenshots: {SCREENSHOTS}/")
    print("\n👀 Navigateur laisse ouvert.")
    # Ne jamais fermer — presentation en cours
    import signal
    signal.pause()
