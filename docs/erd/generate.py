#!/usr/bin/env python3
"""Draws the QAMPUS data model as two SVG files next to this script.

  qampus-erd-slide.svg   the presentation slide: key fields only, dark theme, 1280 x 720
  qampus-erd-full.svg    every field of every collection, light theme, for the paper

Run:  python3 docs/erd/generate.py
Plain Python 3, no packages. To get a PNG, open the SVG in a browser and screenshot it, or use any SVG tool.

When the schema changes (docs/SCHEMA.md, firestore.rules), edit the FIELDS lists below and run this again.
The field lists were checked against firestore.rules and the live Firestore console on 2026-11-06.
"""
import math, os

HERE = os.path.dirname(os.path.abspath(__file__))
SANS = "Inter, Liberation Sans, Arial, Helvetica, sans-serif"


def esc(t):
    return t.replace("&", "&amp;").replace("<", "&lt;")


# ---------------------------------------------------------------------------
# 1. SLIDE (key fields only)
# ---------------------------------------------------------------------------
def slide():
    S = []
    BG, BOX, EDGE, YEL, TXT, DIM, LINE = "#2b2b2b", "#1f1e1c", "#4a4741", "#FFC72C", "#ece9e2", "#b9b6ae", "#b4b1a9"
    W, ROW, HEAD = 217, 23, 34
    X1, X2, X3, X4 = 124, 395, 667, 940
    R1, R2, R3 = 104, 338, 572

    class B:
        def __init__(s, name, fields, x, y):
            s.name, s.fields, s.x, s.y = name, fields, x, y
            s.h = HEAD + 8 + len(fields) * ROW
        cx = property(lambda s: s.x + W / 2)
        bottom = property(lambda s: s.y + s.h)
        right = property(lambda s: s.x + W)

        def draw(s):
            S.append(f'<rect x="{s.x}" y="{s.y}" width="{W}" height="{s.h}" rx="5" fill="{BOX}" stroke="{EDGE}" stroke-width="1.3"/>')
            S.append(f'<text x="{s.x+14}" y="{s.y+23}" font-size="16.5" font-weight="700" fill="{YEL}">{esc(s.name)}</text>')
            S.append(f'<line x1="{s.x}" y1="{s.y+HEAD}" x2="{s.x+W}" y2="{s.y+HEAD}" stroke="{EDGE}" stroke-width="1.2"/>')
            for i, (n, tag) in enumerate(s.fields):
                yy = s.y + HEAD + 8 + i * ROW + 14
                S.append(f'<text x="{s.x+14}" y="{yy}" font-size="13" fill="{TXT}">{esc(n)}</text>')
                if tag:
                    c = YEL if tag == "PK" else DIM
                    S.append(f'<text x="{s.x+W-12}" y="{yy}" font-size="9.5" font-weight="700" text-anchor="end" fill="{c}">{tag}</text>')

    inst = B("institutionalIds", [("id", "PK"), ("uid", "FK")], X1, R1)
    users = B("users", [("uid", "PK"), ("role", ""), ("strike_count", ""), ("banned_until", ""), ("active_count", ""), ("last_revoked_offense", "FK")], X1, R2)
    notif = B("notifications", [("id", "PK"), ("type", ""), ("is_read", "")], X1, R3)
    off = B("offenses", [("id", "PK"), ("user_id", "FK"), ("ticket_id", "FK"), ("type", ""), ("revoked_at", ""), ("revoked_by", "FK")], X2, R1)
    tick = B("tickets", [("id", "PK"), ("user_id", "FK"), ("office_id", "FK"), ("daily_sequence", ""), ("status", "")], X2, R2)
    ev = B("events", [("id", "PK"), ("action", ""), ("actor_uid", "")], X2, R3)
    que = B("queues", [("id", "PK"), ("status", ""), ("last_seq", ""), ("waiting_seqs", ""), ("current_ticket_id", "FK")], X3, R2)
    staff = B("staff", [("email", "PK"), ("office_id", "FK"), ("role", "")], X4, R1)
    offi = B("offices", [("id", "PK"), ("code", ""), ("hours", ""), ("check_in_code", "")], X4, R2)
    boxes = [inst, users, notif, off, tick, ev, que, staff, offi]

    lines, labels = [], []

    def ln(pts):
        lines.append('<path d="M' + " L".join(f"{x},{y}" for x, y in pts) + f'" fill="none" stroke="{LINE}" stroke-width="1.8"/>')

    def card(x, y, t, anchor="start"):
        labels.append(f'<text x="{x}" y="{y}" font-size="14.5" font-weight="800" fill="{YEL}" text-anchor="{anchor}">{t}</text>')

    def lab(x, y, t, anchor="start"):
        labels.append(f'<text x="{x}" y="{y}" font-size="12" fill="{DIM}" text-anchor="{anchor}">{esc(t)}</text>')

    # vertical: inst - users
    ln([(inst.cx, inst.bottom), (users.cx, users.y)])
    card(inst.cx + 8, inst.bottom + 19, "0..1"); lab(inst.cx + 8, inst.bottom + 70, "reserves"); card(inst.cx + 8, users.y - 9, "1")
    # vertical: users - notifications
    ln([(users.cx, users.bottom), (notif.cx, notif.y)])
    card(users.cx + 8, users.bottom + 17, "1"); lab(users.cx + 28, users.bottom + 33, "mailbox"); card(notif.cx + 8, notif.y - 7, "N")
    # users - offenses (elbow)
    ym = users.y + 22
    ln([(users.right, ym), (users.right + 27, ym), (users.right + 27, off.y + 50), (off.x, off.y + 50)])
    card(users.right + 5, ym - 7, "1"); card(users.right + 31, off.y + 43, "N"); lab(users.right + 23, 262, "receives", "end")
    # offenses - tickets
    ln([(off.cx, off.bottom), (tick.cx, tick.y)])
    card(off.cx + 8, off.bottom + 18, "0..1"); lab(off.cx + 36, off.bottom + 33, "may cause"); card(tick.cx + 8, tick.y - 8, "1")
    # users - tickets
    yh = users.y + 100
    ln([(users.right, yh), (tick.x, yh)])
    card(users.right + 5, yh - 7, "1"); card(tick.x - 5, yh - 7, "N", "end"); lab((users.right + tick.x) / 2, yh + 17, "holds", "middle")
    # tickets - queues
    yq = tick.y + 82
    ln([(tick.right, yq), (que.x, yq)])
    card(tick.right + 5, yq - 7, "N"); card(que.x - 5, yq - 7, "1", "end"); lab((tick.right + que.x) / 2, yq + 17, "in", "middle")
    # queues - offices
    ln([(que.right, yq), (offi.x, yq)])
    card(que.right + 5, yq - 7, "N"); card(offi.x - 5, yq - 7, "1", "end"); lab((que.right + offi.x) / 2, yq + 17, "daily", "middle")
    # staff - offices
    ln([(staff.cx, staff.bottom), (offi.cx, offi.y)])
    card(staff.cx + 8, staff.bottom + 19, "N"); lab(staff.cx + 8, staff.bottom + 74, "assigned to"); card(offi.cx + 8, offi.y - 9, "1")
    # tickets - events
    ln([(tick.cx, tick.bottom), (ev.cx, ev.y)])
    card(tick.cx + 8, tick.bottom + 19, "1"); lab(tick.cx + 34, tick.bottom + 40, "logged in"); card(ev.cx + 8, ev.y - 8, "N")

    # key box
    kx, ky, kh = X3, R1, 92
    key = [f'<rect x="{kx}" y="{ky}" width="{W}" height="{kh}" rx="5" fill="{BOX}" stroke="{EDGE}" stroke-width="1.3"/>',
           f'<text x="{kx+14}" y="{ky+21}" font-size="10" font-weight="700" letter-spacing="1.6" fill="{DIM}">KEY</text>',
           f'<text x="{kx+14}" y="{ky+42}" font-size="12" font-weight="700" fill="{YEL}">PK</text><text x="{kx+50}" y="{ky+42}" font-size="12" fill="{TXT}">document id</text>',
           f'<text x="{kx+14}" y="{ky+60}" font-size="12" font-weight="700" fill="{DIM}">FK</text><text x="{kx+50}" y="{ky+60}" font-size="12" fill="{TXT}">points to another</text>',
           f'<text x="{kx+14}" y="{ky+78}" font-size="12" font-weight="800" fill="{YEL}">1</text><text x="{kx+30}" y="{ky+78}" font-size="12" font-weight="800" fill="{YEL}">N</text><text x="{kx+48}" y="{ky+78}" font-size="12" font-weight="800" fill="{YEL}">0..1</text><text x="{kx+92}" y="{ky+78}" font-size="12" fill="{TXT}">cardinality</text>']
    # id patterns box
    px, py, ph = X3, R3, 111
    pat = [f'<rect x="{px}" y="{py}" width="{W}" height="{ph}" rx="5" fill="{BOX}" stroke="{EDGE}" stroke-width="1.3"/>',
           f'<text x="{px+14}" y="{py+21}" font-size="10" font-weight="700" letter-spacing="1.6" fill="{DIM}">ID PATTERNS</text>']
    for i, t in enumerate(["ticket = queue id + seq", "queue = office id + date", "offense = ticket id", "staff = lowercase email", "notification = under users/{uid}"]):
        pat.append(f'<text x="{px+14}" y="{py+40+i*15}" font-size="11.5" fill="{TXT}">{esc(t)}</text>')

    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" font-family="{SANS}">',
           f'<rect width="1280" height="720" fill="{BG}"/>',
           f'<rect width="1280" height="88" fill="{YEL}"/>',
           '<text x="73" y="61" font-size="42" font-weight="900" fill="#1b1b1b" letter-spacing="0.5">ENTITY RELATIONSHIP DIAGRAM</text>']
    svg += lines
    for b in boxes:
        S.clear(); b.draw(); svg += S
    svg += key + pat + labels
    svg += [f'<rect x="1160" y="648" width="52" height="52" fill="{YEL}"/>',
            '<text x="1186" y="684" font-size="24" font-weight="900" text-anchor="middle" fill="#1b1b1b">05</text>', '</svg>']
    return "\n".join(svg)


# ---------------------------------------------------------------------------
# 2. FULL (every field, light theme)
# ---------------------------------------------------------------------------
def full():
    S = []
    ROW, HEAD, W = 20, 44, 232
    cp = "copy"

    def f(n, t="", k=""):
        return (n, t, k)

    FIELDS = {
        "users": [f("uid", "", "PK"), f("role"), f("name"), f("email"), f("institutional_id", "", "FK"), f("program"), f("guest_type"),
                  f("push_enabled"), f("push_token"), f("strike_count"), f("banned_until"), f("active_count"), f("active_offices", "map"),
                  f("last_revoked_offense", "", "FK"), f("created_at"), f("updated_at", "optional")],
        "institutionalIds": [f("id", "", "PK"), f("uid", "", "FK")],
        "notifications": [f("id", "", "PK"), f("type"), f("title"), f("message"), f("ticket_id", "", "FK"), f("office_id", "", "FK"),
                          f("is_read"), f("created_at"), f("read_at")],
        "tickets": [f("id", "", "PK"), f("office_id", "", "FK"), f("office_name", cp), f("queue_date"), f("user_id", "", "FK"),
                    f("holder_name", cp), f("holder_institutional_id", cp), f("daily_sequence"), f("ticket_number"), f("status"),
                    f("joined_at"), f("called_at"), f("service_started_at"), f("completed_at"), f("cancelled_at"), f("no_show_at"),
                    f("cancelled_by"), f("reason")],
        "offenses": [f("id", "", "PK"), f("user_id", "", "FK"), f("ticket_id", "", "FK"), f("office_id", "", "FK"), f("office_name", cp),
                     f("ticket_number", cp), f("holder_name", cp), f("holder_institutional_id", cp), f("type"), f("resulted_in_ban"),
                     f("created_at"), f("revoked_at"), f("revoked_by", "", "FK"), f("revoke_reason")],
        "offices": [f("id", "", "PK"), f("code"), f("name"), f("short_name"), f("location"), f("status"), f("default_service_minutes"),
                    f("hours", "map"), f("check_in_code")],
        "staff": [f("email", "", "PK"), f("name"), f("office_id", "", "FK"), f("role")],
        "queues": [f("id", "", "PK"), f("status"), f("last_seq"), f("last_called_seq"), f("current_ticket_id", "", "FK"),
                   f("waiting_seqs", "array"), f("cutoff_overridden"), f("completed_count"), f("service_seconds_total"),
                   f("created_at"), f("updated_at")],
        "events": [f("id", "", "PK"), f("entity_type"), f("entity_id", "", "FK"), f("action"), f("from_status"), f("to_status"),
                   f("actor_uid"), f("actor_name", cp), f("reason"), f("office_id", "", "FK"), f("ticket_number"), f("created_at")],
    }
    SUB = {"users": "doc id = Firebase Auth uid", "institutionalIds": "doc id = student or guest ID",
           "notifications": "subcollection: users/{uid}/notifications", "tickets": "doc id = queueId_seq",
           "offenses": "doc id = ticket id", "offices": "doc id = office id", "staff": "doc id = lowercase email",
           "queues": "doc id = officeId_yyyymmdd", "events": "activity log, one line per action"}

    class Box:
        def __init__(s, name, x, y, dashed=False):
            s.name, s.x, s.y, s.dashed = name, x, y, dashed
            s.fields = FIELDS[name]
            s.w = W
            s.h = HEAD + len(s.fields) * ROW + 8
        cx = property(lambda s: s.x + s.w / 2)
        bottom = property(lambda s: s.y + s.h)
        right = property(lambda s: s.x + s.w)

        def draw(s):
            d = ' stroke-dasharray="7 4"' if s.dashed else ""
            S.append(f'<rect x="{s.x}" y="{s.y}" width="{s.w}" height="{s.h}" rx="5" fill="#fff" stroke="#222" stroke-width="1.7"{d}/>')
            S.append(f'<path d="M{s.x},{s.y+HEAD} L{s.x},{s.y+5} Q{s.x},{s.y} {s.x+5},{s.y} L{s.x+s.w-5},{s.y} Q{s.x+s.w},{s.y} {s.x+s.w},{s.y+5} L{s.x+s.w},{s.y+HEAD} Z" fill="#ececec"/>')
            S.append(f'<line x1="{s.x}" y1="{s.y+HEAD}" x2="{s.x+s.w}" y2="{s.y+HEAD}" stroke="#222" stroke-width="1.2"/>')
            S.append(f'<text x="{s.x+14}" y="{s.y+20}" font-size="16" font-weight="700" fill="#111">{esc(s.name)}</text>')
            S.append(f'<text x="{s.x+14}" y="{s.y+36}" font-size="11" fill="#555">{esc(SUB[s.name])}</text>')
            for i, (n, t, k) in enumerate(s.fields):
                yy = s.y + HEAD + ROW * i + 15
                if k:
                    S.append(f'<text x="{s.x+9}" y="{yy}" font-size="10" font-weight="700" fill="#111">{k}</text>')
                S.append(f'<text x="{s.x+34}" y="{yy}" font-size="13.5" font-weight="{700 if k == "PK" else 400}" fill="#111">{esc(n)}</text>')
                if t:
                    S.append(f'<text x="{s.x+s.w-10}" y="{yy}" font-size="11.5" font-style="italic" text-anchor="end" fill="#666">{t}</text>')

    GAP, top, XG = 62, 26, 78
    A = 30; B = A + W + XG; C = B + W + XG; D = C + W + XG
    inst = Box("institutionalIds", A, top)
    users = Box("users", A, inst.bottom + GAP)
    notif = Box("notifications", A, users.bottom + GAP, True)
    tick = Box("tickets", B, top)
    off = Box("offenses", B, tick.bottom + GAP)
    offi = Box("offices", C, top)
    que = Box("queues", C, offi.bottom + GAP)
    staff = Box("staff", D, top)
    ev = Box("events", D, que.y)
    boxes = [inst, users, notif, tick, off, offi, que, staff, ev]
    Wd = D + W + 30
    Ht = max(b.bottom for b in boxes) + 26

    def mark(x, y, dx, dy, kind):
        px, py = -dy, dx
        o = []
        def line(x1, y1, x2, y2):
            o.append(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="#222" stroke-width="1.7"/>')
        at = lambda d: (x + dx * d, y + dy * d)
        if kind in ("one", "zero-one"):
            ax, ay = at(12); line(ax + px * 8, ay + py * 8, ax - px * 8, ay - py * 8)
            if kind == "one":
                bx, by = at(19); line(bx + px * 8, by + py * 8, bx - px * 8, by - py * 8)
            else:
                cx, cy = at(27); o.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="5.5" fill="#fff" stroke="#222" stroke-width="1.7"/>')
        if kind in ("many", "zero-many"):
            fx, fy = at(17)
            for s_ in (-1, 0, 1): line(fx, fy, x + px * 9 * s_, y + py * 9 * s_)
            if kind == "zero-many":
                cx, cy = at(25); o.append(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="5.5" fill="#fff" stroke="#222" stroke-width="1.7"/>')
        S.append("".join(o))

    def conn(pts, k1, k2, label=None, lpos=None):
        S.append('<path d="M' + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + '" fill="none" stroke="#222" stroke-width="1.7" stroke-linejoin="round"/>')
        def unit(p, q):
            dx, dy = q[0] - p[0], q[1] - p[1]; n = math.hypot(dx, dy); return dx / n, dy / n
        ux, uy = unit(pts[0], pts[1]); mark(pts[0][0], pts[0][1], ux, uy, k1)
        ux, uy = unit(pts[-1], pts[-2]); mark(pts[-1][0], pts[-1][1], ux, uy, k2)
        if label:
            lx, ly = lpos; w = len(label) * 6.6 + 10
            S.append(f'<rect x="{lx-w/2:.1f}" y="{ly-11:.1f}" width="{w:.1f}" height="16" fill="#fff"/>')
            S.append(f'<text x="{lx:.1f}" y="{ly+1:.1f}" font-size="12.5" font-style="italic" text-anchor="middle" fill="#222">{esc(label)}</text>')

    xa = users.cx
    conn([(xa, inst.bottom), (xa, users.y)], "zero-one", "one", "claims ID", (xa + 52, (inst.bottom + users.y) / 2 + 4))
    conn([(xa, users.bottom), (xa, notif.y)], "one", "zero-many", "mailbox", (xa + 40, (users.bottom + notif.y) / 2 + 4))
    yt = users.y + 90
    conn([(users.right, yt), (tick.x, yt)], "one", "zero-many", "holds", ((users.right + tick.x) / 2, yt - 12))
    yo = users.bottom - 60; yo2 = off.y + 70; xm = (users.right + tick.x) / 2
    conn([(users.right, yo), (xm, yo), (xm, yo2), (off.x, yo2)], "one", "zero-many", "receives", (xm, (yo + yo2) / 2))
    xt = tick.cx
    conn([(xt, tick.bottom), (xt, off.y)], "one", "zero-one", "causes", (xt + 36, (tick.bottom + off.y) / 2 + 4))
    yq = que.y + 70
    conn([(tick.right, yq), (que.x, yq)], "zero-many", "one", "issues", ((tick.right + que.x) / 2, yq - 12))
    ys = staff.y + 70
    conn([(offi.right, ys), (staff.x, ys)], "one", "zero-many", "assigned", ((offi.right + staff.x) / 2, ys - 12))
    xo = offi.cx
    conn([(xo, offi.bottom), (xo, que.y)], "one", "zero-many", "one per day", (xo + 52, (offi.bottom + que.y) / 2 + 4))
    ye = ev.y + 70
    conn([(que.right, ye), (ev.x, ye)], "one", "zero-many", "logged", ((que.right + ev.x) / 2, ye - 12))
    for b in boxes: b.draw()
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{Wd}" height="{Ht}" viewBox="0 0 {Wd} {Ht}" font-family="{SANS}">'
            f'<rect width="{Wd}" height="{Ht}" fill="#fff"/>' + "\n".join(S) + "</svg>")


if __name__ == "__main__":
    for name, fn in (("qampus-erd-slide.svg", slide), ("qampus-erd-full.svg", full)):
        with open(os.path.join(HERE, name), "w") as fh:
            fh.write(fn())
        print("wrote", name)
