# Outdoor prop kit (2026-11-07)
Round 1 modelled in Blender for this channel (no third-party assets); round 2 below is Poly Pizza imports. Metres, +Y up, origin at the base centre, transforms applied,
one mesh per file, plain base-colour materials named `kit_<swatch>` (recolour by material name in `prop()`), no textures.
Front faces +Z (doors, shop windows, car/boat/cart noses, bench seat). Size = X width x Z depth x Y height.

| file | size (m) | tris | use |
|---|---|---|---|
| house_a.glb | 7.6 x 7.0 x 8.7 | 476 | 2-floor brick house, brown roof, chimney; street rows |
| house_b.glb | 6.6 x 6.5 x 6.3 | 272 | 1-floor cream cottage, terracotta roof; suburbs, yard backdrops |
| shop_awning.glb | 6.3 x 6.7 x 5.1 | 312 | ochre corner shop, red/white awning, sign board; high street |
| apartment_block.glb | 12.4 x 10.6 x 17.3 | 1488 | 5-floor terracotta block with balconies; town skyline, aerials |
| street_lamp.glb | 0.6 x 0.6 x 5.1 | 154 | iron post lamp (lantern = `kit_yellowish`, make it emissive at night) |
| bench.glb | 1.8 x 0.6 x 1.0 | 132 | park bench, seat faces +Z |
| fence_section.glb | 2.0 x 0.1 x 1.0 | 240 | white picket fence, tiles along X every 2 m |
| hydrant.glb | 0.5 x 0.5 x 0.8 | 316 | red fire hydrant; kerbs |
| mailbox.glb | 0.3 x 0.5 x 1.4 | 84 | blue mailbox on a post, red flag; front yards |
| bus_stop.glb | 3.6 x 1.5 x 3.0 | 268 | glass shelter + bench + round stop sign |
| sign_post.glb | 2.2 x 0.1 x 2.6 | 60 | two-arrow fingerpost (blank faces: add text as a card) |
| power_pole.glb | 2.2 x 0.6 x 9.0 | 172 | wooden pole, crossarm, insulators, transformer; rows along roads |
| car_small.glb | 1.8 x 4.0 x 1.5 | 456 | red hatchback, nose +Z |
| car_van.glb | 2.1 x 5.0 x 2.0 | 420 | cream van, nose +Z |
| bicycle.glb | 0.5 x 1.8 x 1.1 | 644 | teal bicycle, front wheel +Z; lean on fences/lamps |
| tree_round.glb | 3.9 x 3.6 x 5.6 | 344 | broadleaf tree; parks, streets |
| tree_pine.glb | 4.0 x 4.0 x 8.0 | 80 | single pine |
| bush.glb | 2.2 x 1.7 x 1.3 | 320 | hedge clump; yard edges, park borders (not as a lens-edge foreground) |
| market_stall.glb | 2.8 x 1.6 x 2.6 | 636 | sage/cream canopy stall with produce crates |
| fountain.glb | 4.3 x 4.3 x 3.3 | 440 | two-tier park fountain, water curtain (`kit_spray`, `kit_water`) |
| dune.glb | 60 x 40 x 9 | 3200 | crescent dune, smooth, gentle windward side +Z, steep slip face -Z; desert, repeat + scale 0.5-2 |
| mesa_rock.glb | 81.5 x 39.3 x 35 | 308 | banded mesa + small butte; desert far layer |
| cactus.glb | 2.1 x 0.6 x 3.9 | 200 | saguaro; desert mid ground |
| sailboat.glb | 2.2 x 6.0 x 8.3 | 136 | white hull, cream main, red jib, bow +Z; sea (set waterline ~0.4 m) |
| buoy.glb | 1.2 x 1.3 x 2.3 | 222 | red/white channel buoy with lamp; sea mid ground (waterline ~0.4 m) |
| wave_tile.glb | 20 x 20 x 1.5 | 3200 | tileable low swell (all wave periods divide 20 m); origin at the lowest trough, mean water ~0.75 m above it |
| mountain_peak.glb | 1000 x 1000 x 407 | 6272 | faceted peak, snow cap (`kit_snow`), sage foot band; mountains far layer |
| pine_cluster.glb | 10.3 x 7.3 x 8.0 | 476 | 7 pines; forest edges, mountain slopes |
| haystack.glb | 4.2 x 4.2 x 4.2 | 266 | domed haystack with stake; field |
| meadow_flowers.glb | 6.3 x 5.9 x 0.7 | 3060 | 6 x 6 m grass tufts + 90 flowers; scatter with random yaw in the field |
| wooden_cart.glb | 1.8 x 3.9 x 1.5 | 752 | hand cart with straw and apples, shafts +Z; field, market |
| cloud_puff_a.glb | 9.6 x 5.1 x 4.8 | 400 | round cumulus, flat underside; sky-fall layers (scale 3-20x) |
| cloud_puff_b.glb | 12.7 x 4.4 x 4.2 | 560 | long low cloud bank |
| cloud_puff_c.glb | 6.1 x 3.4 x 3.4 | 320 | small puff, fills gaps between a/b |

Contact sheet (each prop scaled to fit its cell, not to scale): studio/out/props_outdoor_sheet.png

## Round 2 (2026-11-07): Poly Pizza imports, recoloured to the kit
Same conventions as above. Each import: textures/UVs/vertex colours stripped, merged to one mesh, flat-shaded, faces recoloured
to `kit_<swatch>` materials, scaled to real metres, fronts turned to +Z. All < 5k tris except the ferris wheel (landmark).
CC-BY items must be credited in the video description: copy lines from ATTRIBUTION_FOR_DESCRIPTION.txt.

| file | size (m) | tris | source / licence | use |
|---|---|---|---|---|
| hot_air_balloon.glb | 12.8 x 12.8 x 18.0 | 710 | "Hot air balloon", Poly by Google, CC-BY 3.0 | terracotta/cream striped balloon + basket; sky layers, town/field aerials |
| small_plane.glb | 10.0 x 8.8 x 4.2 | 584 | "Small Airplane", Vojtěch Balák, CC-BY 3.0 | white/terracotta high-wing prop plane, nose +Z; sky pass-by |
| bird.glb | 1.4 x 1.3 x 0.7 | 410 | "Flying seagull", Poly by Google, CC-BY 3.0 | single gull, wings up in a V, head +Z; sea, close fly-by |
| bird_flock.glb | 8.4 x 7.3 x 1.9 | 2870 | same gull x7 (CC-BY 3.0) | loose flock heading +Z; sky mid layer (scale 1-3x) |
| windmill.glb | 11.6 x 8.2 x 14.0 | 1714 | "Windmill", Quaternius, CC0 | cream tower windmill, terracotta cap, sails face +Z; field |
| lighthouse.glb | 7.3 x 7.7 x 22.0 | 3064 | "Light House", MaverickFX, CC0 | white/terracotta striped, lamp `kit_yellowish` (emissive at night); coast |
| water_tower.glb | 4.5 x 4.6 x 16.0 | 1158 | "Water Tower", Quaternius, CC0 | sage tank, terracotta roof, stone frame; town edge, field |
| ferris_wheel.glb | 26.6 x 5.5 x 30.0 | 10672 | "Ferris Wheel", CreativeTrio, CC0 | white cabins, blue legs, wheel plane faces +Z; town landmark (static, no separate rotor) |
| cow.glb | 0.6 x 2.2 x 1.2 | 796 | "Cow", Quaternius, CC0 | black/white cow, head +Z; field |
| sheep.glb | 0.5 x 1.3 x 1.0 | 610 | "Sheep", Quaternius, CC0 | white sheep, dark face/legs, head +Z; field, mountain foot |
| tractor.glb | 2.4 x 4.0 x 2.2 | 2766 | "Tractor", Poly by Google, CC-BY 3.0 | terracotta tractor, ochre rims, nose +Z; field |
| rock_cluster.glb | 3.0 x 2.6 x 3.0 | 2230 | "Rocks", Quaternius, CC0 (re-arranged) | 5 grey boulders with sage moss (`kit_stone`/`kit_sage`, swap to `kit_rock` for desert); mountains, coast, desert |

Not replaced: dune.glb, mesa_rock.glb (no CC0 Poly Pizza model read better; candidates were CC-BY scene chunks), palm (props/palm.glb already Quaternius CC0).
Contact sheet: studio/out/props_outdoor_sheet2.png

## ep15 additions (2026-11-07, modelled in Blender for this channel, no third-party assets)
| file | size (m) | tris | use |
|---|---|---|---|
| sub_hull.glb | 3.4 x 18.4 x 2.7 | ~150 | grey-blue low fibreglass hull, cockpit (window +Z) at z +4.2, exhaust pipe at z -5.5, deck at y 1.35; afloat at y -1.6 only cockpit + pipe show |
| sub_hatch.glb | 0.76 x 0.76 x 0.13 | ~48 | the roof hatch disc (sits on the cockpit at y 2.2) |
| cutter.glb | 8.4 x 40.5 x 16 | ~200 | plain white patrol cutter, bow +Z, deck y 4.6, bridge + mast + searchlight, no markings |
| fast_boat.glb | 2.6 x 8.3 x 2.2 | ~60 | dark grey interceptor boat with a console, bow +Z |
| dome_hall.glb | 34 x 22 x 22.6 | ~1000 | generic cream domed hall, portico of 8 columns +Z, no lettering |
