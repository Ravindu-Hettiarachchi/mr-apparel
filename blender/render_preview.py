import bpy, math, os, sys
from mathutils import Vector
scn = bpy.context.scene
OUT = os.path.dirname(bpy.data.filepath)
def link(o): scn.collection.objects.link(o); return o
for o in [o for o in bpy.data.objects if o.type in ('LIGHT', 'CAMERA')]: bpy.data.objects.remove(o)
for loc, e, sz in (((1.6, -2.2, 2.3), 160, 2.5), ((-2.2, -1.2, 1.6), 60, 2.5), ((0, 2.5, 2.2), 120, 2), ((0, -1.5, 0.3), 20, 3)):
    L = link(bpy.data.objects.new("L", bpy.data.lights.new("L", 'AREA'))); L.location = loc; L.data.energy = e; L.data.size = sz
    L.rotation_euler = (Vector((0, 0, 1.15)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
cam = link(bpy.data.objects.new("Cam", bpy.data.cameras.new("Cam"))); scn.camera = cam; cam.data.lens = 70
scn.world = scn.world or bpy.data.worlds.new("W"); scn.world.use_nodes = True
scn.world.node_tree.nodes["Background"].inputs[0].default_value = (1, 1, 1, 1); scn.world.node_tree.nodes["Background"].inputs[1].default_value = 0.35
scn.render.engine = 'CYCLES'; scn.cycles.samples = int(os.environ.get("SAMPLES", "32")); scn.cycles.use_denoising = True
scn.render.resolution_x = 760; scn.render.resolution_y = 860
navy = (0.018, 0.03, 0.085, 1)
for o in bpy.data.objects:
    if o.type == 'MESH' and not o.data.materials:
        m = bpy.data.materials.new("prev"); m.use_nodes = True
        b = m.node_tree.nodes["Principled BSDF"]; b.inputs["Base Color"].default_value = navy; b.inputs["Roughness"].default_value = 0.8
        o.data.materials.append(m)
views = {"front": ((0, -3.0, 1.15), (90, 0, 0)), "back": ((0, 3.0, 1.15), (90, 0, 180)), "34": ((1.95, -2.25, 1.35), (86, 0, 41))}
for name in os.environ.get("VIEWS", "front,34").split(","):
    loc, rot = views[name]; cam.location = loc; cam.rotation_euler = [math.radians(a) for a in rot]
    scn.render.filepath = os.path.join(OUT, f"prev_{name}.png"); bpy.ops.render.render(write_still=True)
