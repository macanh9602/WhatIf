#!/bin/sh
# One GPU job at a time (one 8 GB card; several agents share it). usage: sh scripts/gpu.sh <command...>
# mkdir is atomic, so the first caller gets the lock; the others wait. A stale lock (crashed job) is older than 20 min.
T=${REMOTION_TMP:-D:/remotion-tmp}
L=$T/gpu.lock
mkdir -p "$T"
while ! mkdir "$L" 2>/dev/null; do
  if [ -n "$(find "$L" -maxdepth 0 -mmin +20 2>/dev/null)" ]; then rmdir "$L" 2>/dev/null; continue; fi
  sleep 5
done
# Heartbeat: a job longer than 20 min (full gates, a 2K render) must not look stale, or a waiter steals the lock and
# its cleanup below deletes the running job's bundle.
( while sleep 60; do touch "$L"; done ) >/dev/null 2>&1 &
HB=$!
trap 'kill $HB 2>/dev/null; rmdir "$L" 2>/dev/null' EXIT INT TERM
# Remotion never deletes its bundles (~420 MB each, a copy of public/) or Chrome profiles: 58 GB filled D: on 2026-11-07.
# With the lock held no other GPU job runs, so anything older than 15 min is a dead job's leftover.
find "$T" -mindepth 1 -maxdepth 1 ! -name gpu.lock -mmin +15 -exec rm -rf {} + 2>/dev/null
export GPU_LOCK=1  # the render scripts refuse to start without it
"$@"
