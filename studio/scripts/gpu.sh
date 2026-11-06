#!/bin/sh
# One GPU job at a time (one 8 GB card; several agents share it). usage: sh scripts/gpu.sh <command...>
# mkdir is atomic, so the first caller gets the lock; the others wait. A stale lock (crashed job) is older than 20 min.
L=D:/remotion-tmp/gpu.lock
mkdir -p D:/remotion-tmp
while ! mkdir "$L" 2>/dev/null; do
  if [ -n "$(find "$L" -maxdepth 0 -mmin +20 2>/dev/null)" ]; then rmdir "$L" 2>/dev/null; continue; fi
  sleep 5
done
trap 'rmdir "$L" 2>/dev/null' EXIT INT TERM
"$@"
