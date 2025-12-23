Helix:
  G = g3d(0, 0, 16, 8, -3, 3, -3, 3, 0, 5, 1)
  curve3d(G, "cos(t)", "sin(t)", "t/4", 0, 12.56)

Double Helix:
  G = g3d(0, 0, 16, 8, -3, 3, -3, 3, 0, 5, 1)
  curve3d(G, "cos(t)", "sin(t)", "t/4", 0, 12.56)
  curve3d(G, "cos(t+3.14)", "sin(t+3.14)", "t/4", 0, 12.56)

Trefoil Knot:
  G = g3d(0, 0, 16, 8, -3, 3, -3, 3, -2, 2, 1)
  curve3d(G, "sin(t)+2*sin(2*t)", "cos(t)-2*cos(2*t)", "-sin(3*t)", 0, 6.28)

Lissajous 3D:
  G = g3d(0, 0, 16, 8, -3, 3, -3, 3, -3, 3, 1)
  curve3d(G, "2*sin(3*t)", "2*sin(4*t)", "2*sin(5*t)", 0, 6.28)

Spiral on Sphere:
  G = g3d(0, 0, 16, 8, -3, 3, -3, 3, -3, 3, 1)
  curve3d(G, "2*cos(t)*sin(t/5)", "2*sin(t)*sin(t/5)", "2*cos(t/5)", 0, 15.7)

Toroidal Spiral:
  G = g3d(0, 0, 16, 8, -5, 5, -5, 5, -2, 2, 1)
  curve3d(G, "(3+cos(10*t))*cos(t)", "(3+cos(10*t))*sin(t)", "sin(10*t)", 0, 6.28)

Variable Radius Helix:
  G = g3d(0, 0, 16, 8, -5, 5, -5, 5, 0, 5, 1)
  r = 1
  curve3d(G, "r*cos(t)", "r*sin(t)", "t/4", 0, 12.56)
  change(r, 1, 3)

Growing Helix:
  G = g3d(0, 0, 16, 8, -3, 3, -3, 3, 0, 5, 1)
  tMax = 0.1
  curve3d(G, "cos(t)", "sin(t)", "t/4", 0, tMax)
  change(tMax, 0.1, 12.56)

Conical Helix:
  G = g3d(0, 0, 16, 8, -5, 5, -5, 5, 0, 5, 1)
  curve3d(G, "t/4*cos(t)", "t/4*sin(t)", "t/4", 0, 12.56)

Figure Eight Knot:
  G = g3d(0, 0, 16, 8, -3, 3, -3, 3, -2, 2, 1)
  curve3d(G, "(2+cos(2*t))*cos(3*t)", "(2+cos(2*t))*sin(3*t)", "sin(4*t)", 0, 6.28)

Animated Lissajous Frequency:
  G = g3d(0, 0, 16, 8, -3, 3, -3, 3, -3, 3, 1)
  n = 1
  curve3d(G, "2*sin(3*t)", "2*sin(n*t)", "2*sin(5*t)", 0, 6.28)
  change(n, 1, 7)
