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
# Remotion never deletes its bundles (~420 MB each, a copy of public/) or Chrome profiles: 58 GB filled D: on 2026-11-07.
# With the lock held no other GPU job runs, so anything older than 15 min is a dead job's leftover.
find D:/remotion-tmp -mindepth 1 -maxdepth 1 ! -name gpu.lock -mmin +15 -exec rm -rf {} + 2>/dev/null
"$@"
