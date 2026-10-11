# Facturation Stripe (CAD)

La facturation vend les plans individuels **Apprenant** (`STARTER`) et **Professionnel** (`PRO`), au mois ou à l'année, en dollars canadiens. Le plan **Équipe** (`ENTERPRISE`) reste vendu sur devis par le formulaire de contact et s'applique au tenant.

Tant que `STRIPE_SECRET_KEY` est vide, la facturation est éteinte. L'API démarre normalement et la section « Abonnement » des paramètres n'affiche aucun bouton d'achat.

## Pourquoi l'abonnement est rattaché à l'utilisateur

Toutes les inscriptions rejoignent le même tenant. Un abonnement posé sur le tenant ferait passer tous les inscrits au plan payé. L'abonnement individuel est donc stocké sur l'utilisateur (`users.plan`, `stripeCustomerId`, `stripeSubscriptionId`, `subscriptionStatus`, `currentPeriodEnd`).

Le plan effectif d'un utilisateur est le plus élevé entre son plan personnel et le plan du tenant. Les quotas (`PLAN_QUOTAS_ENFORCED`) utilisent ce plan effectif.

## Mise en place dans Stripe

1. **Produits et prix.** Créer deux produits, Apprenant et Professionnel. Pour chacun, créer un prix mensuel et un prix annuel récurrents, en CAD, avec `tax_behavior = exclusive`. Montants de la grille publique : 19 $ et 49 $ par mois, 190 $ et 490 $ par an.
2. **Taxes.** Activer Stripe Tax et enregistrer les inscriptions TPS/TVH et TVQ de l'entreprise. Stripe calcule alors la bonne taxe selon l'adresse de l'acheteur. Le Checkout exige l'adresse de facturation pour cela.
3. **Portail client.** Configurer le portail (moyen de paiement, factures, changement de plan entre les quatre prix, résiliation). L'application l'ouvre depuis les paramètres.
4. **Webhook.** Ajouter le point de terminaison `https://<domaine-api>/api/v1/billing/webhook` avec ces événements :
   - `checkout.session.completed`
   - `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - `invoice.payment_failed`

   Copier le secret de signature dans `STRIPE_WEBHOOK_SECRET`.
5. **Variables d'environnement** de l'API sur Kapapra : celles de la section « Billing » de `.env.example`.
6. **Migration.** Le redéploiement de l'API doit appliquer la migration `20261011000000_billing` (`prisma migrate deploy`).

Tester d'abord avec les clés de test et `stripe listen --forward-to localhost:3001/api/v1/billing/webhook`.

## Règles appliquées par le webhook

| Statut Stripe | Plan personnel |
|---|---|
| `active`, `trialing` | Plan du prix souscrit |
| `past_due`, `incomplete` | Inchangé pendant les relances de paiement |
| `canceled`, `unpaid`, `incomplete_expired`, `paused` | Aucun, retour au plan du tenant |

- **Source du plan.** Le plan vient de l'identifiant du prix, ce qui couvre les changements faits dans le portail.
- **Idempotence.** Chaque événement est enregistré dans `billing_events` dans la même transaction que la mise à jour de l'utilisateur. Une relivraison par Stripe ne change rien.
- **Signature.** Elle est vérifiée sur le corps brut de la requête. Une signature invalide renvoie 400.

## Points d'API

| Méthode | Route | Rôle |
|---|---|---|
| `GET` | `/api/v1/billing/status` | État de la facturation, offres disponibles, abonnement courant |
| `POST` | `/api/v1/billing/checkout` | Session Checkout pour `{ plan: STARTER \| PRO, period: monthly \| annual }` |
| `POST` | `/api/v1/billing/portal` | Lien vers le portail client |
| `POST` | `/api/v1/billing/webhook` | Réception des événements Stripe (public, signé) |
