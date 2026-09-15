"""
Aedificare rose field generator.

The motif is never illustrated. It is computed from the rhodonea curve
r = cos(k * theta), described by Guido Grandi in the 1720s.

Where a PDF is produced, motion is unavailable, so a specific seed is
frozen at high resolution and treated as a numbered one-off edition.
A printed rose is a still from a film, not the film.
"""
import math

ACID    = "#CCFF00"
MALA    = "#00B24F"
SHOCK   = "#FF1F5A"

SAMPLES = 4000


def rhodonea(k, radius, phase, cx, cy, samples=SAMPLES):
    """Polar rhodonea sampled to an SVG polyline path. Negative r is
    retained (reflected through the origin) which is what produces the
    full petal count for even k."""
    pts = []
    span = 2.0 * math.pi
    for i in range(samples + 1):
        t = span * i / samples
        r = math.cos(k * t) * radius
        x = cx + r * math.cos(t + phase)
        y = cy + r * math.sin(t + phase)
        pts.append(f"{x:.2f},{y:.2f}")
    return "M" + "L".join(pts)


def field(size, curves, stroke=0.8, opacity=1.0):
    """House configuration: three overlapping curves at descending radius,
    each phase-offset so the axes never align."""
    cx = cy = size / 2.0
    out = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" '
        f'width="{size}" height="{size}" fill="none">'
    ]
    for k, frac, colour, phase in curves:
        d = rhodonea(k, (size / 2.0) * frac * 0.96, phase, cx, cy)
        out.append(
            f'<path d="{d}" stroke="{colour}" stroke-width="{stroke}" '
            f'fill="none" stroke-linejoin="round" opacity="{opacity}"/>'
        )
    out.append("</svg>")
    return "\n".join(out)


if __name__ == "__main__":
    S = 1400

    # ---- Cover. Full house configuration. The one surface in this edition
    # that is permitted Shock rose, because Shock rose is once per SEQUENCE.
    cover = field(S, [
        (5, 1.00, ACID,  0.0),
        (7, 0.78, MALA,  0.41),
        (3, 0.54, SHOCK, 0.93),
    ], stroke=0.8)
    open("assets/rose-cover.svg", "w").write(cover)

    # ---- Interior dividers. Malachite only. Shock rose is spent.
    # Acid is spent on type, not here.
    for n, (k1, k2, ph) in enumerate([
        (4, 9, 0.22),
        (6, 11, 0.67),
        (8, 5, 1.13),
    ], start=1):
        d = field(S, [
            (k1, 1.00, MALA, ph),
            (k2, 0.71, MALA, ph + 0.38),
        ], stroke=0.7, opacity=0.85)
        open(f"assets/rose-div-{n}.svg", "w").write(d)

    print("seed log")
    print("  rose-cover   k=5/7/3  r=1.00/0.78/0.54  phi=0.000/0.410/0.930")
    print("  rose-div-1   k=4/9    r=1.00/0.71       phi=0.220/0.600")
    print("  rose-div-2   k=6/11   r=1.00/0.71       phi=0.670/1.050")
    print("  rose-div-3   k=8/5    r=1.00/0.71       phi=1.130/1.510")
