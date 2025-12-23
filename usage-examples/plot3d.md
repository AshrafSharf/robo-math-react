Basic Paraboloid:
  G = g3d(0, 0, 16, 8, -5, 5, -5, 5, 0, 10, 1)
  plot3d(G, "x^2 + y^2")

Saddle Surface:
  G = g3d(0, 0, 16, 8, -3, 3, -3, 3, -5, 5, 1)
  plot3d(G, "x^2 - y^2")

Ripple Surface:
  G = g3d(0, 0, 16, 8, -5, 5, -5, 5, -2, 2, 1)
  plot3d(G, "sin(x) * cos(y)")

Wave Function:
  G = g3d(0, 0, 16, 8, -5, 5, -5, 5, -2, 2, 1)
  plot3d(G, "sin(sqrt(x^2 + y^2))")

Variable Binding - Amplitude:
  G = g3d(0, 0, 16, 8, -5, 5, -5, 5, -5, 5, 1)
  a = 1
  plot3d(G, "a * sin(x) * cos(y)")
  change(a, 1, 3)

Variable Binding - Frequency:
  G = g3d(0, 0, 16, 8, -5, 5, -5, 5, -2, 2, 1)
  f = 1
  plot3d(G, "sin(f * x) * cos(f * y)")
  change(f, 1, 3)

Explicit Domain:
  G = g3d(0, 0, 16, 8, -10, 10, -10, 10, -2, 2, 1)
  plot3d(G, "sin(x) * cos(y)", -3.14, 3.14, -3.14, 3.14)

Gaussian Surface:
  G = g3d(0, 0, 16, 8, -3, 3, -3, 3, 0, 1, 1)
  plot3d(G, "exp(-(x^2 + y^2))")

Animated Domain:
  G = g3d(0, 0, 16, 8, -5, 5, -5, 5, -2, 2, 1)
  xMax = 1
  plot3d(G, "sin(x) * cos(y)", -5, xMax, -5, 5)
  change(xMax, 1, 5)
