g = g2d(0, 0, 35, 35)
a = 0
b = 3.14
p = plot(g, "sin(x)")
ar = areaunder(g, p, a, b, "blue", 0.3)
para(change(b, 6.28), change(a, 3.14))
hide(ar)
