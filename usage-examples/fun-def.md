Point traveling on a curve:
  G = g2d(0, 0, 20, 20)
  a = 2
  f = def(x, "a * sin(x)")
  P = plot(G, f)
  Q = point(G, 3, fun(f, 3))   // Point ON the curve at x=3
  fromTo(a, 1, 5)              // Both curve AND point update together
 
  Multiple points on same curve:
  G = g2d(0, 0, 20, 20)
  f = def(x, "x^2 + a")
  P = plot(G, f)
  P1 = point(G, 1, fun(f, 1))
  P2 = point(G, 2, fun(f, 2))
  P3 = point(G, 3, fun(f, 3))
  fromTo(a, 0, 5)              // Curve shifts, all points follow

  Parametric - point on circle:
  r=1
  G = g2d(0, 0, 20, 20)
  fx = def(t, "r * cos(t)")
  fy = def(t, "r * sin(t)")
  C = paraplot(G, fx, fy)
  Q = point(G, fun(fx, 0), fun(fy, 0))  // Point at t=0
  fromTo(r, 1, 4)                        // Circle expands, point moves

Line from origin to point on curve:
t=0
G = g2d(0, 0, 20, 20)
origin=point(G,0,0)
f = def(x, "x^2")
P = plot(G, f)
Q = point(G, t, fun(f, t))
L = line(G, origin, Q)
fromTo(t, 1, 5) // Point slides on the curve