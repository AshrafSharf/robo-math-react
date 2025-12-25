G = g2d(0, 0, 35,35)
k = 1
P1 = plot(G, "3x^2")
P2 = plot(G, "k*sin(x) + 3")
A = areabetween(G,P1,P2,"green",0.2)
int1 = intersect(G, P1, P2, 1)
int2 = intersect(G, P1, P2, 2)
M = change(k,3)
hide(A)