# Bake AO into vertex colours and export a web-ready GLB.
import bpy, os, bmesh
OUT = os.path.dirname(bpy.data.filepath)
scn = bpy.context.scene
col = bpy.data.collections.get("MR Polo")
for o in list(bpy.data.objects):
    if o.type in ('LIGHT', 'CAMERA') or (col and o.name not in col.objects):
        bpy.data.objects.remove(o)
def apply_all(o):
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers):
        if m.type == 'SUBSURF':
            if not o.name.startswith(('Collar', 'Placket')): o.modifiers.remove(m); continue
            m.levels = 1
        bpy.ops.object.modifier_apply(modifier=m.name)
def join(names, newname):
    objs = [bpy.data.objects[n] for n in names if n in bpy.data.objects]
    for o in objs: apply_all(o)
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]; bpy.ops.object.join()
    objs[0].name = newname; objs[0].data.name = newname; return objs[0]
for o in bpy.data.objects:
    if o.type == 'MESH':
        bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
def pref(*ps): return [o.name for o in bpy.data.objects if o.type == 'MESH' and o.name.startswith(ps)]
fab = join(["Shirt", "Placket"], "Fabric")
groups = {"Collar": pref("Collar"), "CuffL": pref("CuffL"), "CuffR": pref("CuffR"),
          "TipCollar": pref("TipCollar"), "TipCuffL": pref("TipCuffL"), "TipCuffR": pref("TipCuffR"),
          "Buttons": pref("Button"), "Label": pref("Label")}
parts = {k: join(v, k) for k, v in groups.items() if v}
rib = parts.get("Collar"); btn = parts.get("Buttons")
for o, r in [(fab, 0.3)] + [(parts[k], 0.4) for k in ("Collar", "CuffL", "CuffR") if k in parts]:
    d = o.modifiers.new("dec", 'DECIMATE'); d.ratio = r; d.use_collapse_triangulate = True
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.object.modifier_apply(modifier="dec")
ALL = [fab] + list(parts.values())
# UVs for tiling fabric normal maps
for o in [x for x in ALL if x.name in ('Fabric', 'Collar', 'CuffL', 'CuffR', 'TipCollar', 'TipCuffL', 'TipCuffR')]:
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=1.15, island_margin=0.002, scale_to_bounds=False)
    bpy.ops.object.mode_set(mode='OBJECT')
# AO -> vertex colours
scn.render.engine = 'CYCLES'; scn.cycles.samples = 48; scn.cycles.device = 'CPU'
scn.world = scn.world or bpy.data.worlds.new("W")
for o in ALL:
    ca = o.data.color_attributes.new("AO", 'BYTE_COLOR', 'POINT'); o.data.color_attributes.active_color = ca
for o in ALL:
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    scn.render.bake.target = 'VERTEX_COLORS'
    bpy.ops.object.bake(type='AO', target='VERTEX_COLORS')
# centre + scale: shirt height -> 1.8 units, centred
import mathutils
allv = [o.matrix_world @ v.co for o in ALL for v in o.data.vertices]
mn = mathutils.Vector([min(p[i] for p in allv) for i in range(3)]); mx = mathutils.Vector([max(p[i] for p in allv) for i in range(3)])
c = (mn + mx) / 2; s = 1.8 / (mx.z - mn.z)
for o in ALL:
    o.data.transform(mathutils.Matrix.Translation(-c)); o.data.transform(mathutils.Matrix.Scale(s, 4))
    o.matrix_world = mathutils.Matrix.Identity(4)
print("TRIS", {o.name: sum(len(p.vertices) - 2 for p in o.data.polygons) for o in ALL})
bpy.ops.object.select_all(action='SELECT')
dst = os.path.join(OUT, "..", "public", "models", "polo.glb")
os.makedirs(os.path.dirname(dst), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=dst, export_format='GLB', use_selection=True, export_apply=True,
    export_vertex_color='ACTIVE', export_normals=True, export_texcoords=True, export_materials='PLACEHOLDER',
    export_yup=True)
print("EXPORTED", os.path.getsize(dst))
