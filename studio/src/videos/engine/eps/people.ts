// What If channel cast (shared by every episode; channel data, not engine). Designed 2026-11-05 to be unlike any other
// series: real skin tones, navy ink (toon.ts), and one signature item each. "You" = the viewer: red beanie, round glasses,
// Lead = one curly hair + signature colours: red varsity jacket, white tee, blue jeans (US red/white/blue; user 2026-11-05).
import { Outfit, SKINS } from "../toon";

export const YOU: Outfit = { jacket: "#f4f1ea", pants: "#3b5b9a", boots: "#f4f1ea", hat: null, sprout: true, build: "adult", top: "tee", bottom: "jeans",
  layer: { kind: "jacket", color: "#c63939" }, shoe: "sneaker", skin: SKINS[0] };
export const NEIGHBOR: Outfit = { jacket: "#c63939", pants: "#405a7a", boots: "#394b50", hat: null, build: "stout", top: "button", pattern: "plaid", bottom: "jeans",
  shoe: "boot", style: "balding", hair: "#8a8a8a", moustache: "#6a6a6a", skin: SKINS[2], acc: ["suspenders"], accCol: "#3b3f52" };
export const GRANDMA: Outfit = { fem: true, jacket: "#f4e3c1", pants: "#5a4a6a", boots: "#3a2f3f", hat: null, build: "adult", top: "blouse", bottom: "skirt",
  layer: { kind: "cardigan", color: "#9a5a8a" }, style: "smooth", bun: true, hair: "#e3e3e3", glasses: "#9a5a8a", shoe: "flat", skin: SKINS[3], acc: ["bowtie"], accCol: "#5b8eaa" };
export const TEEN: Outfit = { jacket: "#7a4a8c", pants: "#2c3550", boots: "#f4f1ea", hat: null, build: "kid", top: "hoodie", bottom: "joggers", shoe: "hightop",
  style: "curls", curly: true, hair: "#2a1e16", skin: SKINS[1] };
export const RUNNER: Outfit = { jacket: "#f0b93a", pants: "#2c3550", boots: "#f4f1ea", hat: null, build: "adult", top: "jersey", pattern: "number", num: "7",
  bottom: "shorts", shoe: "sneaker", style: "smooth", hair: "#1e1a1a", skin: SKINS[2], acc: ["headband"] };
/** the cast sheet row (CastSheet composition) */
export const CHANNEL_CAST: [string, Outfit][] = [["You", YOU], ["Neighbor", NEIGHBOR], ["Grandma", GRANDMA], ["Teen", TEEN], ["Runner", RUNNER]];
