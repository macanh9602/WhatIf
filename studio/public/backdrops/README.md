# Horizon backdrops (2026-11-07)
Neutral PNGs: flat even light, no shadows, no haze/fog/sky tint, kit palette at normal saturation, no ink. The engine applies
the per-layer atmospheric grade (haze tint, contrast/saturation drop, blur, time of day). Sky is alpha (film transparent).
All files: 8192x1024 RGBA, equirectangular, 360 deg wide (longitude -180..+180), latitude -18..+27 deg, 22.76 px per degree
on both axes. Horizon (eye level) = row 614 from the top (60%). Columns: three.js +Z at x=4096 (centre), +X at x=6144,
-Z at x=0/8191 (seam), -X at x=2048. Built in Blender scene `backdrops` from kit props + generated landforms (no textures, no HDRIs).

| file | horizon row | projection | +Z faces | content |
|---|---|---|---|---|
| town_far.png | 614 | equirect 360, lat -18..+27 | x=4096 | skyline block clusters (2.8-3.3 km) on low sage hills, eye 10 m |
| town_mid.png | 614 | equirect 360, lat -18..+27 | x=4096 | rooftops ring (houses, shops, apartment back row, trees, ferris wheel, 2 water towers), eye 2 m |
| desert_far.png | 614 | equirect 360, lat -18..+27 | x=4096 | banded terra/rock mesas on low sand ridge (5-6.5 km), eye 10 m |
| desert_mid.png | 614 | equirect 360, lat -18..+27 | x=4096 | smooth dune ridges, saguaros, 4 mesa_rock buttes, eye 2 m |
| sea_far.png | 614 | equirect 360, lat -18..+27 | x=4096 | green islands with sand rims (6-8 km), open water = alpha, eye 10 m |
| sea_mid.png | 614 | equirect 360, lat -18..+27 | x=4096 | lighthouse on rock islet, 2 headlands, sailboats (waterline ~ horizon), eye 2 m |
| mountains_far.png | 614 | equirect 360, lat -18..+27 | x=4096 | snow-capped stone range, sage foot (9-12.5 km), eye 10 m |
| mountains_mid.png | 614 | equirect 360, lat -18..+27 | x=4096 | foothills, pine forest below a tree line, sage tops (1.2-2.6 km), eye 2 m |
| field_far.png | 614 | equirect 360, lat -18..+27 | x=4096 | patchwork rolling hills (straw/ochre/grass/sage), eye 10 m |
| field_mid.png | 614 | equirect 360, lat -18..+27 | x=4096 | golden field, windmills, tree lines, farmhouses, water towers, haystacks, eye 2 m |
