g = g3d(5, 5, 25, 25)
V = vector3d(g, 0, 0, 0, 3, 3, 0)
A=rotate3d(V, 90, 0, 0, 1)
rotate3d(A, 45, 1, 0, 1)


#Example
G=g3d(5, 5, 25, 25)
P1=point3d(G,0,2,3)
P2=point3d(G,-1,3,4)
S=translate3d(P1, P2, 5, 5,0)
T=item(S, 0)
U=translate3d(T, 10, 10,2)
V1=vector3d(G, 0, 0, 0, 3, 3, 0)
V2=vector3d(G, -1, 2, 0, 3, 0, 0)
translate3d(V1, V2, 1, 2, 3)