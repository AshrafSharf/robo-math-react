G = g2d(0, 0, 20, 20)
A = point(G, 1, 1)
B = point(G, 4, 8)
L = line(G, A, B)
stroke(A, B, L,"green")



M = mtext(2, 5, "a + b = c")
S = select(M,"a")
first = item(S, 0)
stroke(first, "red")


