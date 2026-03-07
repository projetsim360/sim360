#!/bin/bash
# Hook Stop : rappelle d'invoquer /validate apres completion d'une US
# Lit le JSON de l'event sur stdin et verifie si le message contient des indicateurs de completion

INPUT=$(cat)
RESPONSE=$(echo "$INPUT" | jq -r '.message // empty' 2>/dev/null)

# Si pas de message, essayer d'autres champs
if [ -z "$RESPONSE" ]; then
  RESPONSE=$(echo "$INPUT" | jq -r '.stop_reason // empty' 2>/dev/null)
fi

# Toujours rappeler /validate — le cout est zero (juste un message additionnel dans le contexte)
echo '{"additionalContext": "RAPPEL AUTOMATIQUE : Si une User Story vient d etre completee, propose a l utilisateur d invoquer /validate pour la tester de bout en bout avant de passer a la suivante. Si aucune US n a ete completee, ignore ce rappel."}'
exit 0
