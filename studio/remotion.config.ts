// Remotion Studio (npx remotion studio): the "@ep" alias picks the episode (EP env, else the newest eps/<ep>; scripts/ep.mjs).
import { Config } from "@remotion/cli/config";
import { epOverride } from "./scripts/ep.mjs";

Config.overrideWebpackConfig(epOverride());
