# Realistic ghost-mannequin polo. Run: blender -b -P 02_polo.py   (or exec inside a live Blender)
import bpy, bmesh, math, os
from mathutils import Vector, Euler, Matrix
from mathutils.bvhtree import BVHTree

OUT = os.path.dirname(os.path.abspath(__file__)) if '__file__' in dir() else os.path.expanduser('~/Documents/mr-apparel/blender')
LIVE = not bpy.app.background
scn = bpy.context.scene
COL = bpy.data.collections.get("MR Polo") or bpy.data.collections.new("MR Polo")
if COL.name not in scn.collection.children: scn.collection.children.link(COL)
for o in list(COL.objects): bpy.data.objects.remove(o)
if not LIVE:
    for o in list(bpy.data.objects):
        if o.name not in COL.objects: bpy.data.objects.remove(o)
def _lc(layer, name):
    if layer.collection.name == name: return layer
    for c in layer.children:
        r = _lc(c, name)
        if r: return r
bpy.context.view_layer.active_layer_collection = _lc(bpy.context.view_layer.layer_collection, "MR Polo")
def link(o): COL.objects.link(o); return o
def apply_mods(o):
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    for m in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=m.name)

# ================= 1. body form (torso + angled arms) =================
SA = math.radians(63)             # sleeve angle below horizontal (reference: arms hang close)
ARM_DIR = Vector((math.cos(SA), 0, -math.sin(SA)))
SH = Vector((0.182, 0, 1.364))    # shoulder joint
ARM_R = 0.06                     # sleeve volume (ghost sleeves stand off the arm)
SLEEVE_LEN = 0.20

RINGS = [  # z, half-width, half-depth, front bulge
    (0.78, 0.175, 0.112), (0.88, 0.172, 0.110), (1.00, 0.168, 0.108), (1.12, 0.172, 0.114),
    (1.22, 0.180, 0.122), (1.30, 0.184, 0.122), (1.36, 0.19, 0.116), (1.40, 0.186, 0.106),
    (1.428, 0.166, 0.094), (1.448, 0.125, 0.08), (1.461, 0.092, 0.07), (1.47, 0.07, 0.062)]
bm = bmesh.new(); N = 64; rings = []
for z, w, d in RINGS:
    ring = []
    for i in range(N):
        t = i / N * 2 * math.pi; c, s = math.cos(t), math.sin(t)
        x = math.copysign(abs(c) ** (2 / 2.5), c) * w
        y = math.copysign(abs(s) ** (2 / 2.3), s) * d
        if y < 0: y *= 1.04                         # slightly fuller chest at front (-y)
        ring.append(bm.verts.new((x, y, z)))
    rings.append(ring)
for r0, r1 in zip(rings, rings[1:]):
    for i in range(N): bm.faces.new((r0[i], r0[(i + 1) % N], r1[(i + 1) % N], r1[i]))
bm.faces.new(list(reversed(rings[0]))); bm.faces.new(rings[-1])
body_me = bpy.data.meshes.new("Form"); bm.to_mesh(body_me); bm.free()
form = link(bpy.data.objects.new("Form", body_me))
parts = [form]
for s in (1, -1):
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=ARM_R, depth=0.25)
    a = bpy.context.active_object
    d = Vector((ARM_DIR.x * s, 0, ARM_DIR.z))
    a.location = Vector((SH.x * s, 0, SH.z)) + d * 0.125
    bpy.ops.mesh.primitive_uv_sphere_add(radius=ARM_R, segments=48, ring_count=24)
    cap = bpy.context.active_object; cap.location = Vector((SH.x * s, 0, SH.z)); cap.scale = (1, 0.92, 1); parts.append(cap)
    a.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
    a.scale = (1, 0.92, 1)
    parts.append(a)
bpy.ops.object.select_all(action='DESELECT')
for p in parts: p.select_set(True)
bpy.context.view_layer.objects.active = form; bpy.ops.object.join()
r = form.modifiers.new("r", 'REMESH'); r.mode = 'VOXEL'; r.voxel_size = 0.006
sm = form.modifiers.new("s", 'CORRECTIVE_SMOOTH'); sm.iterations = 80; sm.smooth_type = 'LENGTH_WEIGHTED'; sm.use_only_smooth = True
apply_mods(form)
sm = form.modifiers.new("s2", 'SMOOTH'); sm.factor = 0.9; sm.iterations = 14
apply_mods(form)
vg_sh = form.vertex_groups.new(name="shoulder")
for v in form.data.vertices:
    x, z = abs(v.co.x), v.co.z
    w = max(0.0, 1 - abs(z - 1.40) / 0.08) * max(0.0, 1 - abs(x - 0.2) / 0.12)
    if w > 0: vg_sh.add([v.index], min(1.0, w * 1.5), 'REPLACE')
sm = form.modifiers.new("s3", 'SMOOTH'); sm.factor = 1.0; sm.iterations = 40; sm.vertex_group = "shoulder"
apply_mods(form)

# ================= 2. shirt shell: cut openings =================
me = form.data
bm = bmesh.new(); bm.from_mesh(me)
def arm_t(co, s):
    base = Vector((SH.x * s, 0, SH.z)); d = Vector((ARM_DIR.x * s, 0, ARM_DIR.z))
    rel = co - base; t = rel.dot(d); dist = (rel - d * t).length
    return t, dist
HEM_Z = 0.80
def neck_z(co):  # neckline: lower at front (-y)
    yy = co.y
    return 1.47 - (0.05 * max(0, -yy / 0.075) ** 1.6 if yy < 0 else 0.0)
kill = []
for v in bm.verts:
    co = v.co
    if co.z < HEM_Z: kill.append(v); continue
    if co.z > 1.40 and (co.x / 0.082) ** 2 + ((co.y - 0.004) / 0.072) ** 2 < 1: kill.append(v); continue
    for s in (1, -1):
        if co.x * s > 0.12:
            t, dist = arm_t(co, s)
            if t > SLEEVE_LEN and abs(co.x) > 0.19 and dist < ARM_R * 2.0: kill.append(v); break
bmesh.ops.delete(bm, geom=list(set(kill)), context='VERTS')
# keep biggest island
bm.verts.ensure_lookup_table()
seen = set(); islands = []
for v in bm.verts:
    if v in seen: continue
    stack = [v]; isl = []
    while stack:
        x = stack.pop()
        if x in seen: continue
        seen.add(x); isl.append(x)
        stack += [e.other_vert(x) for e in x.link_edges]
    islands.append(isl)
islands.sort(key=len)
for isl in islands[:-1]: bmesh.ops.delete(bm, geom=isl, context='VERTS')
# straighten openings: relax boundary loops toward their planes
for _ in range(8):
    for v in bm.verts:
        if v.is_boundary:
            nb = [e.other_vert(v) for e in v.link_edges if e.is_boundary]
            if len(nb) == 2: v.co = v.co * 0.5 + (nb[0].co + nb[1].co) * 0.25
for v in bm.verts:
    if v.is_boundary and v.co.z < HEM_Z + 0.02: v.co.z = HEM_Z
bm.to_mesh(me); bm.free()
form.name = "Shirt"; shirt = form

for p in shirt.data.polygons: p.use_smooth = True
print("SHIRT", len(shirt.data.vertices))

# ================= 3. polo details =================
def boundary_loops(mesh):
    bm = bmesh.new(); bm.from_mesh(mesh); bm.verts.ensure_lookup_table()
    edges = [e for e in bm.edges if e.is_boundary]; used = set(); loops = []
    for e0 in edges:
        if e0 in used: continue
        loop = [e0.verts[0]]; cur = e0.verts[1]; used.add(e0); prev = e0
        while cur != loop[0]:
            loop.append(cur)
            nxt = [e for e in cur.link_edges if e.is_boundary and e not in used]
            if not nxt: break
            used.add(nxt[0]); cur = nxt[0].other_vert(cur)
        loops.append([v.co.copy() for v in loop])
    bm.free(); return loops

def resample(loop, n):
    pts = loop + [loop[0]]; L = [0]
    for a, b in zip(pts, pts[1:]): L.append(L[-1] + (b - a).length)
    out = []
    for i in range(n):
        t = L[-1] * i / n; k = max(j for j in range(len(L)) if L[j] <= t)
        k = min(k, len(pts) - 2); f = (t - L[k]) / max(1e-9, L[k + 1] - L[k])
        out.append(pts[k].lerp(pts[k + 1], f))
    return out

def grid_obj(name, rows, closed=False):
    bm = bmesh.new(); vs = [[bm.verts.new(p) for p in r] for r in rows]
    n = len(rows[0])
    for r0, r1 in zip(vs, vs[1:]):
        for i in range(n if closed else n - 1):
            j = (i + 1) % n; bm.faces.new((r0[i], r0[j], r1[j], r1[i]))
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o = link(bpy.data.objects.new(name, me))
    for p in me.polygons: p.use_smooth = True
    return o

loops = boundary_loops(shirt.data)
neck = max(loops, key=lambda l: sum(p.z for p in l) / len(l))
sleeves = [l for l in loops if l is not neck and sum(p.z for p in l) / len(l) > 1.0]
print("LOOPS", len(loops), "sleeves", len(sleeves))

# --- collar (stand + fold + fall, open at front for placket) ---
C = sum(neck, Vector()) / len(neck)
ring = resample(neck, 160)
def ang(p): return math.atan2(p.x - C.x, -(p.y - C.y))      # 0 at front
ring.sort(key=lambda p: (ang(p)) % (2 * math.pi))
GAP = math.radians(9)
ring = [p for p in ring if GAP < ang(p) % (2 * math.pi) < 2 * math.pi - GAP]
ring.sort(key=lambda p: ang(p) % (2 * math.pi))
STAND, FALL = 0.03, 0.05
prof = []                                    # (outward, up)
for i in range(6): t = i / 5; prof.append((0.002 * t, STAND * t))
for i in range(1, 6): a = math.pi * i / 5; prof.append((0.004 + 0.004 * math.sin(a) * 0 + 0.0045 * (1 - math.cos(a)), STAND + 0.0045 * math.sin(a)))
for i in range(1, 11):
    prof.append((0, 0))  # fall rows computed per-angle below
bvh_sh = BVHTree.FromObject(shirt, bpy.context.evaluated_depsgraph_get())
rows = []
nfall0 = 11  # first fall row index
for ri, (o, h) in enumerate(prof):
    row = []
    for p in ring:
        a = ang(p) % (2 * math.pi); a = a if a < math.pi else a - 2 * math.pi
        tip = max(0.0, 1 - abs(a) / math.radians(60)) ** 2.2
        outward = Vector((p.x - C.x, p.y - C.y, 0)).normalized()
        stand_h = STAND * (1 - 0.3 * tip)
        if ri < nfall0:
            hh = h * (stand_h / STAND)
            q = p + outward * o + Vector((0, 0, hh))
        else:
            t = (ri - nfall0 + 1) / (len(prof) - nfall0)
            L = 0.046 + 0.036 * tip                      # fall length (longer at the points)
            top = p + Vector((0, 0, stand_h + 0.004)) + outward * 0.006
            down = Vector((0, 0, -1)) * (0.80 - 0.25 * tip) + outward * (0.45 + 0.1 * tip)
            down.normalize()
            q = top + down * (L * t)
            q.x += math.copysign(0.03 * tip * t, p.x)   # points spread outward into a V
            hit = bvh_sh.find_nearest(q)
            if hit[0] is not None and (q - hit[0]).dot(hit[1]) < 0.0045:
                q = hit[0] + hit[1] * 0.0045
        row.append(q)
    rows.append(row)
collar = grid_obj("Collar", list(map(list, zip(*rows))) if False else rows)
sol = collar.modifiers.new("sol", 'SOLIDIFY'); sol.thickness = 0.0028; sol.offset = 0
sub = collar.modifiers.new("sub", 'SUBSURF'); sub.levels = 1; sub.render_levels = 2

# --- placket ---
front_pt = min(neck, key=lambda p: p.y)
bvh = BVHTree.FromObject(shirt, bpy.context.evaluated_depsgraph_get())
PW, PL = 0.032, 0.14
prow = []
for j in range(13):
    z = front_pt.z - 0.004 - PL * j / 12
    row = []
    for i in range(5):
        x = -PW / 2 + PW * i / 4
        hit = bvh.ray_cast(Vector((x, -0.5, z)), Vector((0, 1, 0)))
        row.append(hit[0] + Vector((0, -0.0022, 0)) if hit[0] else Vector((x, -0.12, z)))
    prow.append(row)
placket = grid_obj("Placket", prow)
ps = placket.modifiers.new("sol", 'SOLIDIFY'); ps.thickness = 0.002; ps.offset = 1
psub = placket.modifiers.new("sub", 'SUBSURF'); psub.levels = 1; psub.render_levels = 2
# buttons
btn_objs = []
for k in range(3):
    z = front_pt.z - 0.02 - k * 0.042
    hit = bvh.ray_cast(Vector((0, -0.5, z)), Vector((0, 1, 0)))
    if not hit[0]: continue
    bpy.ops.mesh.primitive_cylinder_add(vertices=40, radius=0.0056, depth=0.0022)
    b = bpy.context.active_object; b.name = f"Button{k}"
    bb_ = bmesh.new(); bb_.from_mesh(b.data)
    top = [f for f in bb_.faces if f.normal.z > 0.9][0]
    res_ = bmesh.ops.inset_region(bb_, faces=[top], thickness=0.0012, depth=-0.0004)
    bb_.to_mesh(b.data); bb_.free()
    for hx, hy in ((1, 1), (1, -1), (-1, 1), (-1, -1)):
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.0007, depth=0.01, location=(b.location.x + hx * 0.0014, b.location.y + hy * 0.0014, b.location.z))
        hole = bpy.context.active_object
        bo = b.modifiers.new("h", 'BOOLEAN'); bo.object = hole; bo.operation = 'DIFFERENCE'
        bpy.context.view_layer.objects.active = b; bpy.ops.object.modifier_apply(modifier="h")
        bpy.data.objects.remove(hole)
    b.location = hit[0] + hit[1] * 0.0042
    b.rotation_euler = (hit[1]).to_track_quat('Z', 'Y').to_euler()
    bv = b.modifiers.new("bev", 'BEVEL'); bv.width = 0.0009; bv.segments = 3
    for p in b.data.polygons: p.use_smooth = True
    btn_objs.append(b)

# --- ribbed cuffs ---
cuffs = []
for si, l in enumerate(sleeves):
    rr = resample(l, 96); c = sum(rr, Vector()) / len(rr)
    s_ = 1 if c.x > 0 else -1
    d = Vector((ARM_DIR.x * s_, 0, ARM_DIR.z)).normalized()
    rows = []
    for j in range(5):
        t = j / 4
        rows.append([p + d * (0.03 * t) - (p - c).normalized() * (0.003 * t) for p in rr])
    cuff = grid_obj(f"Cuff{si}", rows, closed=True)
    cs = cuff.modifiers.new("sol", 'SOLIDIFY'); cs.thickness = 0.003
    cuffs.append(cuff)

tx = bpy.data.textures.new("folds", 'CLOUDS'); tx.noise_scale = 0.09; tx.noise_depth = 1
dsp = shirt.modifiers.new("soft", 'DISPLACE'); dsp.texture = tx; dsp.strength = 0.004; dsp.mid_level = 0.5; dsp.texture_coords = 'GLOBAL'
emp = bpy.data.objects.new("FoldSpace", None); link(emp); emp.scale = (1, 1, 7)
tx2 = bpy.data.textures.new("drape", 'CLOUDS'); tx2.noise_scale = 0.06; tx2.noise_depth = 2
vgf = shirt.vertex_groups.new(name="drape")
for v in shirt.data.vertices:
    z = v.co.z; arm = abs(v.co.x) > 0.24
    w = 0.55 if arm else max(0.0, min(1.0, (1.28 - z) / 0.35))
    if w > 0: vgf.add([v.index], w, 'REPLACE')
d2 = shirt.modifiers.new("drape", 'DISPLACE'); d2.texture = tx2; d2.strength = 0.009; d2.mid_level = 0.5
d2.texture_coords = 'OBJECT'; d2.texture_coords_object = emp; d2.vertex_group = "drape"
apply_mods(shirt)
bpy.data.objects.remove(emp)
def seam(plane_co, plane_no, keep, name, r=0.0011, off=0.0009):
    bm = bmesh.new(); bm.from_mesh(shirt.data)
    res = bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:], plane_co=plane_co, plane_no=plane_no)
    bm.normal_update()
    edges = [e for e in res['geom_cut'] if isinstance(e, bmesh.types.BMEdge) and keep((e.verts[0].co + e.verts[1].co) / 2)]
    nb = bmesh.new(); vm = {}
    for e in edges:
        for v in e.verts:
            if v not in vm: vm[v] = nb.verts.new(v.co + v.normal * off)
        nb.edges.new((vm[e.verts[0]], vm[e.verts[1]]))
    bm.free()
    if not edges: nb.free(); return None
    me2 = bpy.data.meshes.new(name); nb.to_mesh(me2); nb.free()
    o = link(bpy.data.objects.new(name, me2))
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.object.convert(target='CURVE'); o.data.bevel_depth = r; o.data.bevel_resolution = 2
    bpy.ops.object.convert(target='MESH')
    for p in o.data.polygons: p.use_smooth = True
    return o
seams = []
for s_ in (1, -1):
    d = Vector((ARM_DIR.x * s_, 0, ARM_DIR.z))
    base = Vector((SH.x * s_, 0, SH.z))
    nrm = Vector((0.93 * s_, 0, 0.37)).normalized()
    seams.append(seam(Vector((0.212 * s_, 0, 1.30)), nrm, lambda c, s_=s_: c.x * s_ > 0.12 and c.z > 1.17, f"SeamArm{s_}"))
def side_shoulder(c):
    x = abs(c.x); s_ = 1 if c.x > 0 else -1
    if c.z < 1.21 and x > 0.12: return True                        # side seams
    if c.z > 1.36 and 0.09 < x < 0.2: return True  # shoulder seams
    return False
seams.append(seam(Vector((0, 0.004, 0)), Vector((0, 1, 0)), side_shoulder, "SeamSide"))
for dz in (0.016, 0.022):
    seams.append(seam(Vector((0, 0, HEM_Z + dz)), Vector((0, 0, 1)), lambda c: True, f"Hem{dz}", r=0.0006, off=0.0007))
seams = [x for x in seams if x]
sh_sol = shirt.modifiers.new("sol", 'SOLIDIFY'); sh_sol.thickness = 0.0025; sh_sol.offset = -1
sh_sub = shirt.modifiers.new("sub", 'SUBSURF'); sh_sub.levels = 0; sh_sub.render_levels = 1

# ================= 4. materials (Blender preview) =================
def fabric_mat(name, color, kind):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes
    b = N["Principled BSDF"]; b.inputs["Base Color"].default_value = color
    b.inputs["Roughness"].default_value = 0.88
    b.inputs["Sheen Weight"].default_value = 0.6; b.inputs["Sheen Roughness"].default_value = 0.4
    tc = N.new("ShaderNodeTexCoord"); bump = N.new("ShaderNodeBump"); bump.inputs["Distance"].default_value = 0.0015
    if kind == "pique":
        tex = N.new("ShaderNodeTexVoronoi"); tex.inputs["Scale"].default_value = 520; tex.feature = 'F1'
        nt.links.new(tc.outputs["Object"], tex.inputs["Vector"]); nt.links.new(tex.outputs["Distance"], bump.inputs["Height"])
        bump.inputs["Strength"].default_value = 0.6
    elif kind == "rib":
        tex = N.new("ShaderNodeTexWave"); tex.inputs["Scale"].default_value = 260; tex.wave_type = 'BANDS'; tex.bands_direction = 'Z'
        nt.links.new(tc.outputs["Object"], tex.inputs["Vector"]); nt.links.new(tex.outputs["Fac"], bump.inputs["Height"])
        bump.inputs["Strength"].default_value = 0.6
    if kind:
        nt.links.new(bump.outputs["Normal"], b.inputs["Normal"])
    return m
NAVY = (0.012, 0.02, 0.06, 1)
mf = fabric_mat("Fabric", NAVY, "pique"); mr = fabric_mat("Rib", NAVY, "rib")
mb_ = bpy.data.materials.new("Button"); mb_.use_nodes = True
bb = mb_.node_tree.nodes["Principled BSDF"]; bb.inputs["Base Color"].default_value = (0.85, 0.85, 0.82, 1); bb.inputs["Roughness"].default_value = 0.25
for o, m in [(shirt, mf), (placket, mf), (collar, mr)] + [(x, mf) for x in seams] + [(c, mr) for c in cuffs] + [(b, mb_) for b in btn_objs]:
    o.data.materials.clear(); o.data.materials.append(m)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, "polo.blend"), copy=LIVE)
print("DONE")
