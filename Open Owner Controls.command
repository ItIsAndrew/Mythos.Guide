#!/bin/zsh
cd -- "${0:A:h}"

if command -v node >/dev/null 2>&1; then
  mythos_node="$(command -v node)"
else
  mythos_node="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
fi

if [[ ! -x "$mythos_node" ]]; then
  print "Ask Codex to help open your owner controls."
  read -r "?Press Return to close."
  exit 1
fi

"$mythos_node" --env-file=.env.local scripts/open-owner.mjs
read -r "?Press Return to close."
