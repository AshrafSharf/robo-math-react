G = g2d(0, 0, 20, 20, -10, 10, -10, 10, 1)
A = point(G, -1, 4)
L = line(G, A, point(G, 3, 1))
C = circle(G, 2, 6, 1)
A2 = translate(G, A, 2, 3)
result = translate(G, A, L, C, 2, 3)


