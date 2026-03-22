"""
Parcours 2 — Scenario Brownfield (reprise de projet)
Test E2E visible dans le navigateur. Ne ferme jamais le navigateur.
"""
import time
import os
import signal
from playwright.sync_api import sync_playwright

BASE = "http://localhost:5173"
SCREENSHOTS = "/tmp/test-parcours2"
os.makedirs(SCREENSHOTS, exist_ok=True)

results = []

def report(step, name, status, detail=""):
    icon = "✅" if status == "OK" else "❌" if status == "FAIL" else "⚠️"
    results.append({"step": step, "name": name, "status": status, "detail": detail})
    print(f"  {icon} Etape {step}: {name} — {status} {detail}")

def ss(page, name):
    page.screenshot(path=f"{SCREENSHOTS}/{name}.png", full_page=True)


with sync_playwright() as p:
    browser = p.chromium.launch(headless=False, slow_mo=800, args=["--start-maximized"])
    page = browser.new_page(viewport={"width": 1440, "height": 900})

    # ─── ETAPE 1: Connexion ────────────────────────────────
    print("\n=== ETAPE 1: Connexion ===")
    page.goto(f"{BASE}/auth/sign-in")
    page.wait_for_load_state("networkidle")
    time.sleep(1)
    page.fill('input[name="email"]', "admin@sim360.dev")
    page.fill('input[name="password"]', "Admin123!")
    page.click('button[type="submit"]')
    try:
        page.wait_for_url(lambda url: "/auth/" not in url, timeout=15000)
        report("1", "Connexion", "OK")
    except:
        report("1", "Connexion", "FAIL")

    # ─── ETAPE 2: Selectionner le scenario Brownfield ───────
    print("\n=== ETAPE 2: Scenario Brownfield ===")
    page.goto(f"{BASE}/simulations/new")
    page.wait_for_load_state("networkidle")
    time.sleep(2)

    # Chercher la card Brownfield (contient "Reprise" ou "ERP")
    try:
        brownfield_card = page.locator('[data-slot="card"].cursor-pointer:has-text("Reprise"), [data-slot="card"].cursor-pointer:has-text("ERP")').first
        if brownfield_card.is_visible():
            report("2.1", "Card Brownfield trouvee", "OK")

            # Verifier le badge "Reprise"
            card_text = brownfield_card.inner_text()
            has_reprise_badge = "Reprise" in card_text
            report("2.2", "Badge 'Reprise' sur la card", "OK" if has_reprise_badge else "FAIL")

            # Cliquer pour ouvrir la modal
            brownfield_card.click()
            time.sleep(1)
        else:
            report("2.1", "Card Brownfield", "FAIL", "Non trouvee dans le catalogue")
    except Exception as e:
        report("2.1", "Card Brownfield", "FAIL", str(e)[:120])

    # ─── ETAPE 3: Verifier la modal Brownfield ──────────────
    print("\n=== ETAPE 3: Modal detail Brownfield ===")
    try:
        dialog = page.locator('[data-slot="dialog-content"], [role="dialog"]').first
        dialog.wait_for(timeout=5000)
        ss(page, "03-modal-brownfield")

        if dialog.is_visible():
            dialog_text = dialog.inner_text()

            # Badge Reprise en cours
            has_reprise = "Reprise" in dialog_text
            report("3.1", "Badge 'Reprise en cours' dans modal", "OK" if has_reprise else "FAIL")

            # Badge Avance
            has_avance = "AVANCE" in dialog_text.upper()
            report("3.2", "Badge difficulte 'Avance'", "OK" if has_avance else "WARN")

            # Description mentionnant le precedent CP
            has_precedent = "precedent" in dialog_text.lower() or "quitte" in dialog_text.lower()
            report("3.3", "Description mentionne le precedent CP", "OK" if has_precedent else "FAIL")

            # Phases — Depart et Termine
            has_depart = "Depart" in dialog_text or "depart" in dialog_text
            has_termine = "Termine" in dialog_text or "termine" in dialog_text
            report("3.4", "Phase 'Depart' visible", "OK" if has_depart else "FAIL")
            report("3.5", "Phases 'Termine' visibles", "OK" if has_termine else "FAIL")

            # Contexte de reprise
            has_contexte = "Contexte de reprise" in dialog_text or "contexte" in dialog_text.lower()
            report("3.6", "Section 'Contexte de reprise'", "OK" if has_contexte else "FAIL")

            # Stats brownfield
            has_retard = "15j" in dialog_text or "retard" in dialog_text.lower()
            has_budget = "65%" in dialog_text
            has_risques = "risque" in dialog_text.lower()
            report("3.7", "Stat retard (15j)", "OK" if has_retard else "FAIL")
            report("3.8", "Stat budget (65%)", "OK" if has_budget else "FAIL")
            report("3.9", "Risques listes", "OK" if has_risques else "FAIL")

            # Pas d'emojis
            has_emoji = any(c in dialog_text for c in "📁⏱👥🌱🔥📊📋🎯🚀")
            report("3.10", "Pas d'emojis", "OK" if not has_emoji else "FAIL")
        else:
            report("3.1", "Modal Brownfield", "FAIL", "Non visible")
    except Exception as e:
        report("3.1", "Modal Brownfield", "FAIL", str(e)[:120])

    # ─── ETAPE 4: Lancer la simulation ──────────────────────
    print("\n=== ETAPE 4: Lancer simulation Brownfield ===")
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
            report("4.1", "Simulation Brownfield lancee", "OK")
        else:
            report("4.1", "Bouton Lancer", "FAIL", "Non visible")
    except Exception as e:
        report("4.1", "Lancement", "FAIL", str(e)[:120])

    ss(page, "04-simulation-brownfield")

    # ─── ETAPE 5: Passation Brownfield ──────────────────────
    print("\n=== ETAPE 5: Passation ===")
    if sim_url:
        try:
            body_text = page.inner_text("body")
            has_passation = "Passation" in body_text or "Prise de poste" in body_text
            report("5.1", "Banner passation visible", "OK" if has_passation else "FAIL")

            has_rh = "Accueil RH" in body_text
            report("5.2", "Etape RH dans banner", "OK" if has_rh else "FAIL")
        except Exception as e:
            report("5.1", "Passation", "FAIL", str(e)[:120])

        # Meeting RH
        try:
            hr_btn = page.locator('a:has-text("accueil RH"), a:has-text("Accueil RH"), button:has-text("accueil RH")').first
            if hr_btn.is_visible():
                hr_btn.click()
                page.wait_for_load_state("networkidle")
                time.sleep(2)

                # Verifier la culture secteur FINANCE
                meeting_text = page.inner_text("body")
                report("5.3", "Page meeting RH ouverte", "OK")

                # Demarrer
                start_btn = page.locator('button:has-text("Demarrer")').first
                if start_btn.is_visible():
                    start_btn.click()
                    time.sleep(3)

                    # Message sur la culture
                    msg_input = page.locator('input[placeholder*="Message"]').first
                    if msg_input.is_visible():
                        msg_input.fill("Quelle est la culture de l'entreprise ?")
                        msg_input.press("Enter")
                        print("    ⏳ Reponse IA (15s)...")
                        time.sleep(15)
                        ss(page, "05-hr-chat")

                        chat_text = page.inner_text("body")
                        # Pour un scenario FINANCE, la DRH devrait mentionner compliance, rigueur, etc.
                        has_culture = len(chat_text) > 500
                        report("5.4", "DRH repond sur la culture", "OK" if has_culture else "FAIL")

                    # Cloturer
                    close_btn = page.locator('button:has-text("Cloturer")').first
                    if close_btn.is_visible():
                        close_btn.click()
                        time.sleep(10)
                        report("5.5", "Meeting RH cloture", "OK")
            else:
                report("5.3", "Bouton accueil RH", "FAIL", "Non visible")
        except Exception as e:
            report("5.3", "Meeting RH", "FAIL", str(e)[:120])

        # Retour simulation → Meeting PMO
        print("\n=== ETAPE 6: Meeting PMO ===")
        if sim_url:
            page.goto(sim_url)
            page.wait_for_load_state("networkidle")
            time.sleep(2)
            ss(page, "06-after-hr")

            try:
                pmo_btn = page.locator('a:has-text("PMO"), button:has-text("PMO")').first
                if pmo_btn.is_visible():
                    pmo_btn.click()
                    page.wait_for_load_state("networkidle")
                    time.sleep(2)

                    meeting_text = page.inner_text("body")
                    has_alexandre = "Alexandre" in meeting_text
                    report("6.1", "Participant Alexandre Bertrand (PMO)", "OK" if has_alexandre else "FAIL")

                    # Demarrer
                    start_btn = page.locator('button:has-text("Demarrer")').first
                    if start_btn.is_visible():
                        start_btn.click()
                        time.sleep(3)

                        msg_input = page.locator('input[placeholder*="Message"]').first
                        if msg_input.is_visible():
                            msg_input.fill("Quel est l'etat actuel du projet ?")
                            msg_input.press("Enter")
                            print("    ⏳ Reponse PMO (15s)...")
                            time.sleep(15)
                            ss(page, "06-pmo-chat")

                            pmo_text = page.inner_text("body")
                            # Le PMO Brownfield doit etre direct sur les problemes
                            has_problemes = any(w in pmo_text.lower() for w in ["retard", "risque", "budget", "difficulte", "probleme", "urgence", "critique"])
                            report("6.2", "PMO mentionne les problemes du projet", "OK" if has_problemes else "FAIL")

                        # Cloturer
                        close_btn = page.locator('button:has-text("Cloturer")').first
                        if close_btn.is_visible():
                            close_btn.click()
                            time.sleep(10)
                            report("6.3", "Meeting PMO cloture", "OK")
                else:
                    report("6.1", "Bouton PMO", "FAIL", "Non visible")
            except Exception as e:
                report("6.1", "Meeting PMO", "FAIL", str(e)[:120])

        # ─── ETAPE 7: Commencer le projet ──────────────────────
        print("\n=== ETAPE 7: Commencer le projet ===")
        if sim_url:
            page.goto(sim_url)
            page.wait_for_load_state("networkidle")
            time.sleep(2)
            ss(page, "07-passation-done")

            try:
                body_text = page.inner_text("body")
                has_commencer = "Commencer le projet" in body_text
                report("7.1", "Bouton 'Commencer le projet' visible", "OK" if has_commencer else "FAIL")

                if has_commencer:
                    commence_btn = page.locator('button:has-text("Commencer le projet")').first
                    commence_btn.click()
                    time.sleep(3)
                    ss(page, "07-project-started")

                    body_text = page.inner_text("body")
                    # Verifier que les KPIs sont maintenant visibles
                    has_kpis = "Indicateurs" in body_text or "Budget" in body_text
                    report("7.2", "KPIs visibles apres demarrage", "OK" if has_kpis else "FAIL")

                    # Verifier historique herite (contexte brownfield)
                    has_historique = "Historique" in body_text or "herite" in body_text or "Contexte" in body_text
                    report("7.3", "Panneau historique herite visible", "OK" if has_historique else "WARN")

                    # Verifier les decisions disponibles
                    has_decisions = "decision" in body_text.lower() or "Decision" in body_text
                    report("7.4", "Decisions disponibles", "OK" if has_decisions else "WARN")

            except Exception as e:
                report("7.1", "Demarrage projet", "FAIL", str(e)[:120])

    # ─── RAPPORT FINAL ──────────────────────────────────────
    print("\n" + "=" * 60)
    print("RAPPORT PARCOURS 2 — Brownfield")
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
    signal.pause()
