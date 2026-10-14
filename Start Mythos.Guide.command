#!/bin/zsh
cd -- "${0:A:h}"

if command -v node >/dev/null 2>&1; then
  mythos_node="$(command -v node)"
else
  mythos_node="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
fi

if [[ ! -x "$mythos_node" ]]; then
  print "Mythos.Guide needs its local runtime. Ask Codex to help start it."
  read -r "?Press Return to close."
  exit 1
fi

"$mythos_node" --env-file=.env.local scripts/dev-server.mjs --open
