#!/bin/bash
# Hook PostToolUse : Lint automatique apres chaque Edit/Write de fichier TypeScript
# Recoit le JSON de l'event sur stdin

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.filePath // empty')

# Ne lint que les fichiers TypeScript/React
if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

case "$FILE_PATH" in
  *.ts|*.tsx)
    # Determine le package (api, webapp, ou core)
    if [[ "$FILE_PATH" == *"/apps/api/"* ]]; then
      FILTER="@sim360/api"
    elif [[ "$FILE_PATH" == *"/apps/webapp/"* ]]; then
      FILTER="@sim360/webapp"
    elif [[ "$FILE_PATH" == *"/libs/core/"* ]]; then
      FILTER="@sim360/core"
    else
      exit 0
    fi

    # Typecheck le fichier modifie (rapide, pas tout le projet)
    cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0

    # Rapporte juste un avertissement, ne bloque pas
    RESULT=$(npx tsc --noEmit --pretty false "$FILE_PATH" 2>&1 | head -5)
    if [ $? -ne 0 ] && [ -n "$RESULT" ]; then
      echo "{\"additionalContext\": \"TypeScript errors in $FILE_PATH:\\n$RESULT\"}"
    fi
    ;;
esac

exit 0
