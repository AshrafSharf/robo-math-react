Expanding Circle:
  G = g2d(0, 0, 20, 20, -5, 5, -5, 5, 1)
  r = 1
  P = paraplot(G, "r * cos(t)", "r * sin(t)")
  fromTo(r, 1, 4)

  Morphing Ellipse:
  G = g2d(0, 0, 20, 20, -5, 5, -5, 5, 1)
  a = 1
  P = paraplot(G, "a * cos(t)", "2 * sin(t)")
  fromTo(a, 1, 4)

  Lissajous Pattern:
  G = g2d(0, 0, 20, 20, -5, 5, -5, 5, 1)
  n = 1
  P = paraplot(G, "3 * cos(t)", "3 * sin(n * t)", 0, 6.28)
  fromTo(n, 1, 5)

  Spiral Unwind:
  G = g2d(0, 0, 20, 20, -5, 5, -5, 5, 1)
  k = 0.1
  P = paraplot(G, "k * t * cos(t)", "k * t * sin(t)", 0, 12.56)
  fromTo(k, 0.1, 0.4)
  fromTo(k, 0.4, 0.1)