Sphere:
  G = g3d(5, 5, 25, 25, -3, 3, -3, 3, -3, 3, 1)
  para3d(G, "2*cos(u)*sin(v)", "2*sin(u)*sin(v)", "2*cos(v)", 0, 6.28, 0, 3.14)

Torus:
  G = g3d(5, 5, 25, 25, -5, 5, -5, 5, -2, 2, 1)
  para3d(G, "(3+cos(v))*cos(u)", "(3+cos(v))*sin(u)", "sin(v)", 0, 6.28, 0, 6.28)

Cylinder:
  G = g3d(5, 5, 25, 25, -3, 3, -3, 3, -3, 3, 1)
  para3d(G, "2*cos(u)", "2*sin(u)", "v", 0, 6.28, -2, 2)

Cone:
  G = g3d(5, 5, 25, 25, -3, 3, -3, 3, 0, 3, 1)
  para3d(G, "v*cos(u)", "v*sin(u)", "v", 0, 6.28, 0, 2)

Helicoid:
  G = g3d(5, 5, 25, 25, -3, 3, -3, 3, -3, 3, 1)
  para3d(G, "v*cos(u)", "v*sin(u)", "u/2", 0, 6.28, -2, 2)

Klein Bottle (partial):
  G = g3d(5, 5, 25, 25, -5, 5, -5, 5, -3, 3, 1)
  para3d(G, "(2+cos(u/2)*sin(v)-sin(u/2)*sin(2*v))*cos(u)", "(2+cos(u/2)*sin(v)-sin(u/2)*sin(2*v))*sin(u)", "sin(u/2)*sin(v)+cos(u/2)*sin(2*v)", 0, 6.28, 0, 6.28)

Variable Radius Sphere:
  G = g3d(5, 5, 25, 25, -5, 5, -5, 5, -5, 5, 1)
  r = 1
  para3d(G, "r*cos(u)*sin(v)", "r*sin(u)*sin(v)", "r*cos(v)", 0, 6.28, 0, 3.14)
  change(r, 1, 4)

Animated Torus Tube Radius:
  G = g3d(5, 5, 25, 25, -5, 5, -5, 5, -3, 3, 1)
  r = 0.5
  para3d(G, "(3+r*cos(v))*cos(u)", "(3+r*cos(v))*sin(u)", "r*sin(v)", 0, 6.28, 0, 6.28)
  change(r, 0.5, 2)

Animated Domain - Growing Sphere:
  G = g3d(5, 5, 25, 25, -3, 3, -3, 3, -3, 3, 1)
  vMax = 0.1
  para3d(G, "2*cos(u)*sin(v)", "2*sin(u)*sin(v)", "2*cos(v)", 0, 6.28, 0, vMax)
  change(vMax, 0.1, 3.14)

Mobius Strip:
  G = g3d(5, 5, 25, 25, -3, 3, -3, 3, -2, 2, 1)
  para3d(G, "(1+v/2*cos(u/2))*cos(u)", "(1+v/2*cos(u/2))*sin(u)", "v/2*sin(u/2)", 0, 6.28, -1, 1)
