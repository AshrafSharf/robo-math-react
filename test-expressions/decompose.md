g = g2d(2,2,20,20)
// Create a diagonal vector and a horizontal reference
  A = vector(g, 0, 0, 2, 2)       // diagonal vector
  B = vector(g, 0, 0, 3, 0)       // horizontal reference

  // Get parallel component (default) - projection of A along B's direction
  parallel = decompose(g, A, B)

  // Get perpendicular component - the "leftover" after removing parallel part
  perp = decompose(g, A, B, "perp")

  What it does:
  - Splits vector A into two components relative to reference vector B
  - Parallel component: The part of A that lies along B's direction
  - Perpendicular component: The part of A that is orthogonal to B

  Visual intuition:
          A (2,2)
         /|
        / |  ← perpendicular component
       /  |
      /   |
     -----+------ B (3,0)
     parallel component

  The parallel + perpendicular components sum back to the original vector A.