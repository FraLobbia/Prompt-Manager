#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="/Users/frnk/frnklab/repos/Prompt-Manager"

REQUIRED_FORMULAE=(git)
REQUIRED_CASKS=(visual-studio-code google-chrome)

DEV_URL="http://localhost:4200"

abort() { echo "❌ $*"; exit 1; }

ensure_brew() {
  if ! command -v brew >/dev/null 2>&1; then
    abort "Homebrew non trovato. Installa e rilancia:
    /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
  fi
}

ensure_formula() {
  local name="$1"
  if brew list --formula --versions "$name" >/dev/null 2>&1; then
    echo "✅ Formula già presente: $name"
  else
    echo "📦 Installo formula: $name"
    brew install "$name"
  fi
}

ensure_cask() {
  local name="$1"
  if brew list --cask --versions "$name" >/dev/null 2>&1; then
    echo "✅ App già presente: $name"
  else
    echo "📦 Installo app (cask): $name"
    brew install --cask "$name"
  fi
}

git_pull_with_prompt() {
  cd "$PROJECT_ROOT" || return 0
  if [ ! -d ".git" ]; then
    echo "ℹ️  Non è una repo Git (niente pull)."
    return 0
  fi

  echo "🔄 Controllo stato Git in: $PROJECT_ROOT"
  git fetch --all --prune || true

  if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Modifiche locali non committate rilevate."
    echo "Scegli un'azione:"
    echo "  [1] Stash modifiche → pull --rebase → reapply (stash pop)"
    echo "  [2] Commit rapido di TUTTO → pull --rebase"
    echo "  [3] Annulla il pull (prosegui senza toccare Git)"
    echo "  [4] FORZA reset all'upstream (PERDI le modifiche locali)"
    read -r -p "Selezione [1/2/3/4]: " choice

    case "$choice" in
      1)
        git stash push -u -m "auto-stash run-dev.sh $(date +%F_%T)" || true
        git pull --rebase || { git stash pop || true; abort "Pull fallito"; }
        git stash pop || true
        ;;
      2)
        read -r -p "Messaggio commit: " msg
        msg=${msg:-"chore: quick save before pull"}
        git add -A
        git commit -m "$msg" || echo "ℹ️  Nessun cambiamento committabile."
        git pull --rebase || abort "Pull fallito"
        ;;
      3) ;;
      4)
        read -r -p "Confermi reset? [YES]: " conf
        if [ "$conf" = "YES" ]; then
          upstream="$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || true)"
          [ -z "$upstream" ] && abort "Nessun upstream configurato."
          git reset --hard "$upstream"
        fi
        ;;
    esac
  else
    git pull --rebase || echo "⚠️  Pull non riuscito, continuo comunque."
  fi
}

fullscreen_app() {
  local APP="$1"
  /usr/bin/osascript <<EOF >/dev/null
tell application "$APP" to activate
delay 1
tell application "System Events"
  tell process "$APP"
    key code 3 using {command down, control down}
  end tell
end tell
EOF
}

open_chrome_url_fullscreen() {
  local url="$1"
  open -a "Google Chrome" "$url"
  sleep 2
  fullscreen_app "Google Chrome"
}

[[ -d "$PROJECT_ROOT" ]] || abort "Directory progetto non valida."

ensure_brew
brew update
for f in "${REQUIRED_FORMULAE[@]}"; do ensure_formula "$f"; done
for c in "${REQUIRED_CASKS[@]}";  do ensure_cask "$c";  done

git_pull_with_prompt

# ===== Ordine scrivanie =====
echo "🌐 Apro Chrome su $DEV_URL"
open_chrome_url_fullscreen "$DEV_URL"

echo "🪟 Apro VS Code su: $PROJECT_ROOT"
if command -v code >/dev/null 2>&1; then
  code "$PROJECT_ROOT" || true
else
  open -a "Visual Studio Code" "$PROJECT_ROOT" || true
fi
sleep 2
fullscreen_app "Visual Studio Code"

echo "🎉 Fatto. Scrivanie in ordine: Chrome → VS Code"
