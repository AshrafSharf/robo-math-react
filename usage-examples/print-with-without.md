  // printwithout - shows everything EXCEPT the specified patterns
  printwithout(4, 4, "x^2 + 2x + 1 = 0", "2x")
  // Result: Shows "x^2 + + 1 = 0", hides "2x"

  // With meq (multi-line equations)
  A = meq(mline("x^2 = 4", "given"), mline("x = \\pm 2", "solved"))
  printonly(4, 4, A, "x = \\pm 2")   // Only show second line
  printwithout(4, 4, A, "given")     // Show everything except "given" 
  annotation

  // Partial equation reveal
printonly(6, 2,"\frac{a}{b} + \frac{c}{d} = \frac{ad + bc}{bd}", "\frac{ad + bc}{bd}")
printonly(16,4,"\sin^2(\theta) + \cos^2\theta = 1", "\sin^2(\theta)","\cos^2\theta")


  printonly(14, 4, "f'(x) = \lim_{h \to 0} \frac{f(x+h) - f(x)}{h}","\lim_{h \to 0}")

A = meq(mline("x^2 = 4", "given"), mline("x = \pm 2", "solved"))
printonly(4, 4, A, "x = \pm 2")
printwithout(4, 4, A, "given")
printonly(12,4, "\begin{pmatrix} a & b \\ c & d \end{pmatrix} \cdot \vec{x} = \vec{b}", "\vec{x}", "\vec{b}")