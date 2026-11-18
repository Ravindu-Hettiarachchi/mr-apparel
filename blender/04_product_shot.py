# Render a transparent studio product shot of the polo in the given colours.
# env: COLOR=#hex TIP=#hex (optional) OUT=path.webp
import bpy, os, math
from mathutils import Vector
scn = bpy.context.scene
def lin(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c) + (1,)
body, tip = lin(os.environ.get('COLOR', '#1d2a44')), lin(os.environ.get('TIP') or os.environ.get('COLOR', '#1d2a44'))
for m in bpy.data.materials:
    if not m.node_tree: continue
    b = m.node_tree.nodes.get('Principled BSDF')
    if not b: continue
    for n in m.node_tree.nodes:
        if n.type == 'BUMP': n.inputs['Strength'].default_value = 0.28 if m.name.startswith('Fabric') else 0.45
        if n.type == 'TEX_VORONOI': n.inputs['Scale'].default_value = 750
    if m.name.startswith('Fabric'): b.inputs['Base Color'].default_value = body; b.inputs['Sheen Weight'].default_value = 0.3
    if m.name.startswith('Rib'): b.inputs['Base Color'].default_value = body; b.inputs['Sheen Weight'].default_value = 0.3
    if m.name.startswith('Tip'): b.inputs['Base Color'].default_value = tip; b.inputs['Sheen Weight'].default_value = 0.2
for o in [o for o in bpy.data.objects if o.type in ('LIGHT', 'CAMERA')]: bpy.data.objects.remove(o)
def link(o): scn.collection.objects.link(o); return o
meshes = [o for o in bpy.data.objects if o.type == 'MESH']
dg = bpy.context.evaluated_depsgraph_get()
pts = [o.matrix_world @ Vector(c) for o in meshes for c in o.bound_box]
mn = Vector([min(p[i] for p in pts) for i in range(3)]); mx = Vector([max(p[i] for p in pts) for i in range(3)])
ctr = (mn + mx) / 2; h = mx.z - mn.z
target = ctr
def area(name, loc, energy, size, color=(1, 1, 1)):
    L = link(bpy.data.objects.new(name, bpy.data.lights.new(name, 'AREA'))); L.location = loc
    L.data.energy = energy; L.data.size = size; L.data.color = color
    L.rotation_euler = (target - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
area("Key", ctr + Vector((-1.4, -2.0, 1.4)), 150, 2.2)
area("Fill", ctr + Vector((1.9, -1.4, 0.3)), 45, 2.5)
area("Rim", ctr + Vector((0.6, 2.0, 1.2)), 160, 1.5)
area("Top", ctr + Vector((0, -0.3, 2.2)), 40, 2.0)
w = scn.world or bpy.data.worlds.new("W"); scn.world = w
w.use_nodes = True; bg = w.node_tree.nodes['Background']; bg.inputs[0].default_value = (1, 1, 1, 1); bg.inputs[1].default_value = 0.18
cam = link(bpy.data.objects.new("Cam", bpy.data.cameras.new("Cam"))); scn.camera = cam; cam.data.lens = 85
yaw = math.radians(float(os.environ.get('YAW', '-18')))
dist = h * 3.5
cam.location = ctr + Vector((math.sin(-yaw) * dist, -math.cos(yaw) * dist, h * 0.12))
cam.rotation_euler = (ctr - cam.location).to_track_quat('-Z', 'Y').to_euler()
scn.render.engine = 'CYCLES'; scn.cycles.samples = int(os.environ.get('SAMPLES', '96')); scn.cycles.use_denoising = True
scn.render.film_transparent = True
scn.render.resolution_x = 900; scn.render.resolution_y = 1000
try:
    scn.view_settings.view_transform = 'AgX'; scn.view_settings.look = 'AgX - Medium High Contrast'
except Exception: pass
s = scn.render.image_settings; s.file_format = 'WEBP'; s.color_mode = 'RGBA'; s.quality = 84
scn.render.filepath = os.environ['OUT']
bpy.ops.render.render(write_still=True)
print("RENDERED", os.environ['OUT'])
