#!/usr/bin/env bash
set -Eeuo pipefail

for entry in /entrypoint.d/*.sh; do
    if [ -f "$entry" ] && [ -x "$entry" ]; then
        echo "Calling '${entry}'..."
        "$entry"
    fi
done
unset entry

"$@"
