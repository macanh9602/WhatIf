#!/usr/bin/env bash
# Viewer review loop on Claude (fb0020 + fb0033 + fb0094): Opus builds, a FRESH Claude session per reviewer reviews,
# they talk each finding through. --restricted: no hooks/settings/memory of the director, only the Read tool, confined to out/ep01.
#   review_claude.sh review N P        fresh reviewer P (A|B|C|D|E|F) on the round-N pack (D = DP/editor, fb0035;
#                                      E = producer / acting, fb0036; F = cleanup QC: clipping, anchors, limb count, fb0094)
#   review_claude.sh reply  N P        send out/ep01/review_rN/reply_P.md into P's round-N session
#   review_claude.sh verify N P PREV   resume P's session from round PREV on the round-N pack (checks its own pass criteria)
# Output: out/ep01/review_rN/claude_P[_reply].md, session id in claude_P.session. MODEL overrides the reviewer model (default opus).
set -euo pipefail
cd "$(dirname "$0")/.."
mode=$1 n=$2 p=$3 prev=${4:-}
EP=out/ep01 PR=scripts/review_prompts
dir=$EP/review_r$n pack=$EP/review_r$n
[ "$p" = C ] && pack=${pack}_big
[ "$p" = D ] && pack=${pack}_cam # 8 frames per shot: camera moves
[ "$p" = E ] && pack=${pack}_act # 6 frames per shot at 270 x 480: faces across each beat
[ "$p" = F ] && pack=${pack}_act # 6 frames per shot: accessories and limbs across motion
ctx() {
  echo; echo "## attached images: open EVERY one with the Read tool, in this order (paths relative to your working directory)"
  for f in "$pack"/sheet_*.jpg; do echo "- ${f#$EP/}"; done
  [ "$p" = F ] && echo "- ../chars/outfits_16.png (character sheet: the reference for faces, hands, outfits, accessories)"
  echo; echo "## index"; cat "$pack/index.md"
  [ "$p" = A ] || { echo; echo "## transcript"; cat "$pack/transcript.md"; }
  [ "$p" = D ] && { S="src/videos/owen/eps/${EP:-$(ls src/videos/owen/eps | grep -E '^ep[0-9]+$' | sort | tail -1)}/story.ts"; echo; echo "## camera plan ($S)"; sed -n '/^export const SHOTS/,/^];/p;/^export const MOVES/,/^export const HOLD/p' "$S"; }
  [ "$p" = E ] && { B=../bible; for f in $B/episodes/ep01-broken-arm/SCRIPT.md $B/characters/owen.md $B/characters/mom.md $B/characters/supporting.md; do echo; echo "## $f"; cat "$f"; done; echo; echo "## final narration (locked)"; cat "$pack/transcript.md"; }
  [ -z "${NOTE:-}" ] || { echo; echo "## note from the director"; echo "$NOTE"; }
  return 0
}
rev() { # $1 session ("" = new), $2 output file; prompt on stdin
  local s=$1 how=(--resume "$1")
  [ -n "$s" ] || { s=$(python -c "import uuid; print(uuid.uuid4())"); how=(--session-id "$s"); echo "$s" > "$dir/claude_$p.session"; }
  # cwd fixed to out/ep01 so a later round can resume the session (sessions are stored per working directory)
  (cd "$EP" && claude -p --restricted --tools Read --add-dir ../chars --model "${MODEL:-opus}" "${how[@]}") > "$2"
  test -s "$2" || { echo "no answer from Claude for $p" >&2; exit 1; }
}
case $mode in
  review) { cat "$PR/$p.md" "$PR/lessons.md"; ctx; } | rev "" "$dir/claude_$p.md" ;;
  reply)  { cat "$PR/reply.md"; echo; cat "$dir/reply_$p.md"; } | rev "$(cat "$dir/claude_$p.session")" "$dir/claude_${p}_reply.md" ;;
  verify) cp "$EP/review_r$prev/claude_$p.session" "$dir/claude_$p.session"
          { cat "$PR/verify.md" "$PR/lessons.md"; ctx; } | rev "$(cat "$dir/claude_$p.session")" "$dir/claude_$p.md" ;;
  *) echo "mode: review|reply|verify" >&2; exit 2 ;;
esac
echo "$dir/claude_$p*.md"
