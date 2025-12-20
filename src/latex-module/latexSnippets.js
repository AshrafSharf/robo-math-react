/**
 * LaTeX Snippets for quick access
 * Organized with General (always visible) + category tabs
 */

export const snippetCategories = [
  'Conics',
  'Calc',
  'Sets',
  'Matrix',
  'Vector',
  'Complex',
  'Stats',
  'Trig',
  'Greek',
  'Logic'
];

const snippets = [
  // ==================== GENERAL (Always Visible) ====================
  // Basic operations
  { latex: '\\frac{a}{b}', name: 'Fraction', category: 'General' },
  { latex: '\\sqrt{x}', name: 'Square root', category: 'General' },
  { latex: '\\sqrt[n]{x}', name: 'nth root', category: 'General' },
  { latex: 'x^2', name: 'Square', category: 'General' },
  { latex: 'x^n', name: 'Power', category: 'General' },
  { latex: 'x_i', name: 'Subscript', category: 'General' },
  { latex: 'a_n', name: 'aₙ (sequence)', category: 'General' },
  { latex: 'x^{n}_{i}', name: 'Super+subscript', category: 'General' },
  // Operators
  { latex: '\\times', name: 'Times', category: 'General' },
  { latex: '\\div', name: 'Divide', category: 'General' },
  { latex: '\\cdot', name: 'Dot', category: 'General' },
  { latex: '\\pm', name: 'Plus-minus', category: 'General' },
  // Equals variants
  { latex: '\\neq', name: '≠ Not equal', category: 'General' },
  { latex: '\\approx', name: '≈ Approximately', category: 'General' },
  { latex: '\\equiv', name: '≡ Equivalent', category: 'General' },
  { latex: '\\cong', name: '≅ Congruent', category: 'General' },
  { latex: '\\sim', name: '∼ Similar', category: 'General' },
  { latex: '\\propto', name: '∝ Proportional', category: 'General' },
  // Comparisons
  { latex: '\\leq', name: '≤ Less or equal', category: 'General' },
  { latex: '\\geq', name: '≥ Greater or equal', category: 'General' },
  // Implications/Arrows
  { latex: '\\Rightarrow', name: '⇒ Implies', category: 'General' },
  { latex: '\\Leftrightarrow', name: '⇔ Iff', category: 'General' },
  { latex: '\\rightarrow', name: '→ Arrow', category: 'General' },
  // Brackets
  { latex: '|x|', name: 'Absolute value', category: 'General' },
  { latex: '\\|x\\|', name: 'Norm', category: 'General' },
  { latex: '\\lfloor x \\rfloor', name: 'Floor', category: 'General' },
  { latex: '\\lceil x \\rceil', name: 'Ceiling', category: 'General' },
  { latex: '\\left( x \\right)', name: 'Auto parens', category: 'General' },
  // Common constants
  { latex: '\\pi', name: 'Pi', category: 'General' },
  { latex: '\\infty', name: 'Infinity', category: 'General' },
  // Common Greek
  { latex: '\\alpha', name: 'alpha', category: 'General' },
  { latex: '\\beta', name: 'beta', category: 'General' },
  { latex: '\\theta', name: 'theta', category: 'General' },
  { latex: '\\lambda', name: 'lambda', category: 'General' },
  { latex: '\\sigma', name: 'sigma', category: 'General' },
  { latex: '\\Delta', name: 'Delta', category: 'General' },
  { latex: '\\Sigma', name: 'Sigma', category: 'General' },
  // Sum/Product
  { latex: '\\sum_{i=1}^{n}', name: 'Sum', category: 'General' },
  { latex: '\\prod_{i=1}^{n}', name: 'Product', category: 'General' },
  // Functions
  { latex: 'f(x)', name: 'f(x)', category: 'General' },
  { latex: '\\sin', name: 'sin', category: 'General' },
  { latex: '\\cos', name: 'cos', category: 'General' },
  { latex: '\\tan', name: 'tan', category: 'General' },
  { latex: '\\log', name: 'log', category: 'General' },
  { latex: '\\ln', name: 'ln', category: 'General' },
  // Text
  { latex: '\\text{text}', name: 'Text', category: 'General' },
  // Proof symbols
  { latex: '\\therefore', name: '∴ Therefore', category: 'General' },
  { latex: '\\because', name: '∵ Because', category: 'General' },
  // Tricky constructions
  { latex: 'e^{\\ln x}', name: 'e^ln x', category: 'General' },
  { latex: 'x^{-1}', name: 'x⁻¹', category: 'General' },
  { latex: 'x^{1/n}', name: 'x^(1/n)', category: 'General' },
  { latex: '\\frac{\\frac{a}{b}}{c}', name: 'Nested frac', category: 'General' },
  { latex: '\\sqrt{\\frac{a}{b}}', name: '√(a/b)', category: 'General' },
  { latex: '\\frac{1}{\\sqrt{x}}', name: '1/√x', category: 'General' },
  { latex: '\\left(\\frac{a}{b}\\right)^n', name: '(a/b)ⁿ', category: 'General' },
  { latex: '\\log_a b', name: 'log base a', category: 'General' },
  { latex: '\\sin^2 x', name: 'sin²x', category: 'General' },
  { latex: '\\cos^{-1} x', name: 'cos⁻¹x', category: 'General' },

  // ==================== CALCULUS ====================
  // Integrals
  { latex: '\\int', name: 'Integral', category: 'Calc' },
  { latex: '\\int_a^b f(x)\\,dx', name: 'Definite integral', category: 'Calc' },
  { latex: '\\iint', name: 'Double integral', category: 'Calc' },
  { latex: '\\iiint', name: 'Triple integral', category: 'Calc' },
  { latex: '\\oint', name: 'Contour integral', category: 'Calc' },
  // Derivatives
  { latex: '\\frac{d}{dx}', name: 'd/dx', category: 'Calc' },
  { latex: '\\frac{dy}{dx}', name: 'dy/dx', category: 'Calc' },
  { latex: '\\frac{d^2y}{dx^2}', name: 'd²y/dx²', category: 'Calc' },
  { latex: "f'(x)", name: "f'(x)", category: 'Calc' },
  { latex: "f''(x)", name: "f''(x)", category: 'Calc' },
  { latex: '\\dot{x}', name: 'ẋ (time deriv)', category: 'Calc' },
  // Partial derivatives
  { latex: '\\partial', name: '∂', category: 'Calc' },
  { latex: '\\frac{\\partial f}{\\partial x}', name: '∂f/∂x', category: 'Calc' },
  { latex: '\\frac{\\partial^2 f}{\\partial x \\partial y}', name: '∂²f/∂x∂y', category: 'Calc' },
  // Limits
  { latex: '\\lim_{x \\to a}', name: 'lim x→a', category: 'Calc' },
  { latex: '\\lim_{x \\to \\infty}', name: 'lim x→∞', category: 'Calc' },
  { latex: '\\lim_{x \\to 0}', name: 'lim x→0', category: 'Calc' },
  // Vector calculus
  { latex: '\\nabla', name: '∇ (nabla)', category: 'Calc' },
  { latex: '\\nabla f', name: '∇f (gradient)', category: 'Calc' },
  { latex: '\\nabla \\cdot \\vec{F}', name: '∇·F (divergence)', category: 'Calc' },
  { latex: '\\nabla \\times \\vec{F}', name: '∇×F (curl)', category: 'Calc' },
  { latex: '\\nabla^2 f', name: '∇²f (Laplacian)', category: 'Calc' },
  // Evaluation
  { latex: '\\bigg|_a^b', name: 'Evaluated a to b', category: 'Calc' },
  // Series
  { latex: '\\sum_{n=0}^{\\infty} a_n x^n', name: 'Power series', category: 'Calc' },
  { latex: '\\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n', name: 'Taylor series', category: 'Calc' },

  // ==================== SET THEORY ====================
  // Set notation
  { latex: '\\emptyset', name: '∅ (Empty set)', category: 'Sets' },
  { latex: '\\{a, b, c\\}', name: 'Set {a,b,c}', category: 'Sets' },
  { latex: '\\{x \\mid x > 0\\}', name: 'Set builder', category: 'Sets' },
  // Membership
  { latex: '\\in', name: '∈ (element of)', category: 'Sets' },
  { latex: '\\notin', name: '∉ (not element)', category: 'Sets' },
  // Subsets
  { latex: '\\subset', name: '⊂ (proper subset)', category: 'Sets' },
  { latex: '\\subseteq', name: '⊆ (subset)', category: 'Sets' },
  { latex: '\\supset', name: '⊃ (superset)', category: 'Sets' },
  // Operations
  { latex: '\\cup', name: '∪ (union)', category: 'Sets' },
  { latex: '\\cap', name: '∩ (intersection)', category: 'Sets' },
  { latex: '\\setminus', name: '∖ (difference)', category: 'Sets' },
  { latex: 'A^c', name: 'Aᶜ (complement)', category: 'Sets' },
  { latex: 'A \\times B', name: 'A × B (product)', category: 'Sets' },
  // Big operators
  { latex: '\\bigcup_{i=1}^{n}', name: '⋃ (big union)', category: 'Sets' },
  { latex: '\\bigcap_{i=1}^{n}', name: '⋂ (big intersection)', category: 'Sets' },
  // Intervals
  { latex: '[a, b]', name: '[a,b] closed', category: 'Sets' },
  { latex: '(a, b)', name: '(a,b) open', category: 'Sets' },
  { latex: '[a, b)', name: '[a,b) half-open', category: 'Sets' },

  // ==================== MATRIX ====================
  // 2x2 matrices
  { latex: '\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}', name: '2×2 (paren)', category: 'Matrix' },
  { latex: '\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}', name: '2×2 [bracket]', category: 'Matrix' },
  { latex: '\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}', name: '2×2 |det|', category: 'Matrix' },
  // 3x3 matrices
  { latex: '\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}', name: '3×3 (paren)', category: 'Matrix' },
  { latex: '\\begin{bmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{bmatrix}', name: '3×3 [bracket]', category: 'Matrix' },
  { latex: '\\begin{vmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{vmatrix}', name: '3×3 |det|', category: 'Matrix' },
  // Special matrices
  { latex: '\\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}', name: '2×2 Identity', category: 'Matrix' },
  { latex: '\\begin{bmatrix} 1 & 0 & 0 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & 1 \\end{bmatrix}', name: '3×3 Identity', category: 'Matrix' },
  // Operations
  { latex: 'A^T', name: 'Aᵀ (transpose)', category: 'Matrix' },
  { latex: 'A^{-1}', name: 'A⁻¹ (inverse)', category: 'Matrix' },
  // Functions
  { latex: '\\det(A)', name: 'det(A)', category: 'Matrix' },
  { latex: '\\text{tr}(A)', name: 'tr(A) (trace)', category: 'Matrix' },
  { latex: '\\text{rank}(A)', name: 'rank(A)', category: 'Matrix' },
  // Elements
  { latex: 'a_{ij}', name: 'aᵢⱼ', category: 'Matrix' },
  // Eigenvalues
  { latex: 'A\\vec{v} = \\lambda\\vec{v}', name: 'Av = λv', category: 'Matrix' },
  { latex: '\\det(A - \\lambda I) = 0', name: 'Characteristic eq', category: 'Matrix' },
  // Augmented
  { latex: '\\left[\\begin{array}{cc|c} a & b & c \\\\ d & e & f \\end{array}\\right]', name: 'Augmented', category: 'Matrix' },
  // Row operations
  { latex: 'R_1 \\leftrightarrow R_2', name: 'Swap rows', category: 'Matrix' },
  { latex: 'R_1 + kR_2', name: 'Add rows', category: 'Matrix' },

  // ==================== VECTOR ====================
  // Column vectors
  { latex: '\\begin{pmatrix} x \\\\ y \\end{pmatrix}', name: '2D column', category: 'Vector' },
  { latex: '\\begin{pmatrix} x \\\\ y \\\\ z \\end{pmatrix}', name: '3D column', category: 'Vector' },
  // Notation
  { latex: '\\vec{v}', name: 'v⃗ (arrow)', category: 'Vector' },
  { latex: '\\mathbf{v}', name: 'v (bold)', category: 'Vector' },
  { latex: '\\overrightarrow{AB}', name: 'AB⃗', category: 'Vector' },
  { latex: '\\hat{v}', name: 'v̂ (unit)', category: 'Vector' },
  // Unit vectors
  { latex: '\\hat{i}', name: 'î', category: 'Vector' },
  { latex: '\\hat{j}', name: 'ĵ', category: 'Vector' },
  { latex: '\\hat{k}', name: 'k̂', category: 'Vector' },
  // Magnitude
  { latex: '|\\vec{v}|', name: '|v⃗|', category: 'Vector' },
  { latex: '\\sqrt{x^2 + y^2 + z^2}', name: '√(x²+y²+z²)', category: 'Vector' },
  // Component form
  { latex: '\\langle x, y, z \\rangle', name: '⟨x,y,z⟩', category: 'Vector' },
  { latex: 'a\\hat{i} + b\\hat{j} + c\\hat{k}', name: 'aî + bĵ + ck̂', category: 'Vector' },
  // Products
  { latex: '\\vec{a} \\cdot \\vec{b}', name: 'a⃗·b⃗ (dot)', category: 'Vector' },
  { latex: '\\vec{a} \\times \\vec{b}', name: 'a⃗×b⃗ (cross)', category: 'Vector' },
  { latex: '\\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\ a_1 & a_2 & a_3 \\\\ b_1 & b_2 & b_3 \\end{vmatrix}', name: 'Cross (det form)', category: 'Vector' },
  { latex: '|\\vec{a}||\\vec{b}|\\cos\\theta', name: '|a||b|cosθ', category: 'Vector' },
  // Unit vector formula
  { latex: '\\frac{\\vec{v}}{|\\vec{v}|}', name: 'v/|v| (unit)', category: 'Vector' },

  // ==================== CONICS ====================
  // Quadratic formula
  { latex: 'x=\\dfrac{-b\\pm\\sqrt{b^2-4ac}}{2a}', name: 'Quadratic formula', category: 'Conics' },
  { latex: 'ax^2+bx+c=0', name: 'Quadratic equation', category: 'Conics' },
  { latex: 'b^2-4ac', name: 'Discriminant', category: 'Conics' },
  // General conic
  { latex: 'Ax^2+Bxy+Cy^2+Dx+Ey+F=0', name: 'General conic', category: 'Conics' },
  // Parabola
  { latex: 'y^2=4ax', name: 'Parabola (right)', category: 'Conics' },
  { latex: 'x^2=4ay', name: 'Parabola (up)', category: 'Conics' },
  { latex: '(y-k)^2=4a(x-h)', name: 'Parabola vertex', category: 'Conics' },
  { latex: 'x=at^2', name: 'Parabola x=at²', category: 'Conics' },
  { latex: 'y=2at', name: 'Parabola y=2at', category: 'Conics' },
  { latex: 'yy_1=2a(x+x_1)', name: 'Parabola tangent', category: 'Conics' },
  // Ellipse
  { latex: '\\frac{x^2}{a^2}+\\frac{y^2}{b^2}=1', name: 'Ellipse', category: 'Conics' },
  { latex: '\\frac{(x-h)^2}{a^2}+\\frac{(y-k)^2}{b^2}=1', name: 'Ellipse translated', category: 'Conics' },
  { latex: 'c^2=a^2-b^2', name: 'Ellipse foci', category: 'Conics' },
  { latex: 'x=a\\cos\\theta', name: 'Ellipse x=acosθ', category: 'Conics' },
  { latex: 'y=b\\sin\\theta', name: 'Ellipse y=bsinθ', category: 'Conics' },
  { latex: '\\frac{xx_1}{a^2}+\\frac{yy_1}{b^2}=1', name: 'Ellipse tangent', category: 'Conics' },
  // Hyperbola
  { latex: '\\frac{x^2}{a^2}-\\frac{y^2}{b^2}=1', name: 'Hyperbola', category: 'Conics' },
  { latex: '\\frac{(x-h)^2}{a^2}-\\frac{(y-k)^2}{b^2}=1', name: 'Hyperbola translated', category: 'Conics' },
  { latex: 'c^2=a^2+b^2', name: 'Hyperbola foci', category: 'Conics' },
  { latex: 'x=a\\sec\\theta', name: 'Hyperbola x=asecθ', category: 'Conics' },
  { latex: 'y=b\\tan\\theta', name: 'Hyperbola y=btanθ', category: 'Conics' },
  { latex: '\\frac{xx_1}{a^2}-\\frac{yy_1}{b^2}=1', name: 'Hyperbola tangent', category: 'Conics' },

  // ==================== COMPLEX NUMBERS ====================
  { latex: 'i^2 = -1', name: 'i² = -1', category: 'Complex' },
  { latex: 'a + bi', name: 'a + bi', category: 'Complex' },
  // Real/Imaginary parts
  { latex: '\\text{Re}(z)', name: 'Re(z)', category: 'Complex' },
  { latex: '\\text{Im}(z)', name: 'Im(z)', category: 'Complex' },
  // Conjugate
  { latex: '\\bar{z}', name: 'z̄ (conjugate)', category: 'Complex' },
  // Modulus/Argument
  { latex: '|z|', name: '|z| (modulus)', category: 'Complex' },
  { latex: '\\arg(z)', name: 'arg(z)', category: 'Complex' },
  // Polar form
  { latex: 'r(\\cos\\theta + i\\sin\\theta)', name: 'r(cosθ + isinθ)', category: 'Complex' },
  { latex: 're^{i\\theta}', name: 'reⁱᶿ', category: 'Complex' },
  // Euler's formula
  { latex: 'e^{i\\theta} = \\cos\\theta + i\\sin\\theta', name: "Euler's formula", category: 'Complex' },
  { latex: 'e^{i\\pi} + 1 = 0', name: "Euler's identity", category: 'Complex' },
  // De Moivre
  { latex: '(\\cos\\theta + i\\sin\\theta)^n = \\cos(n\\theta) + i\\sin(n\\theta)', name: "De Moivre's", category: 'Complex' },
  // Roots
  { latex: '\\sqrt[n]{z}', name: 'ⁿ√z', category: 'Complex' },
  // Operations
  { latex: 'z\\bar{z} = |z|^2', name: 'zz̄ = |z|²', category: 'Complex' },

  // ==================== STATISTICS ====================
  // Probability
  { latex: 'P(A)', name: 'P(A)', category: 'Stats' },
  { latex: 'P(A|B)', name: 'P(A|B)', category: 'Stats' },
  { latex: 'P(A \\cap B)', name: 'P(A∩B)', category: 'Stats' },
  { latex: 'P(A \\cup B)', name: 'P(A∪B)', category: 'Stats' },
  // Mean/Average
  { latex: '\\mu', name: 'μ (mean)', category: 'Stats' },
  { latex: '\\bar{x}', name: 'x̄ (sample mean)', category: 'Stats' },
  { latex: 'E[X]', name: 'E[X]', category: 'Stats' },
  { latex: '\\frac{1}{n}\\sum_{i=1}^{n} x_i', name: 'Mean formula', category: 'Stats' },
  // Variance/Std Dev
  { latex: '\\sigma^2', name: 'σ² (variance)', category: 'Stats' },
  { latex: '\\text{Var}(X)', name: 'Var(X)', category: 'Stats' },
  // Covariance/Correlation
  { latex: '\\text{Cov}(X,Y)', name: 'Cov(X,Y)', category: 'Stats' },
  { latex: '\\rho', name: 'ρ (correlation)', category: 'Stats' },
  // Distributions
  { latex: 'X \\sim N(\\mu, \\sigma^2)', name: 'Normal dist', category: 'Stats' },
  // PDF/CDF
  { latex: 'f(x)', name: 'f(x) (PDF)', category: 'Stats' },
  { latex: 'F(x)', name: 'F(x) (CDF)', category: 'Stats' },
  // Normal distribution
  { latex: '\\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}', name: 'Normal PDF', category: 'Stats' },
  { latex: 'Z = \\frac{X - \\mu}{\\sigma}', name: 'Z-score', category: 'Stats' },
  // Combinatorics
  { latex: 'n!', name: 'n!', category: 'Stats' },
  { latex: '\\binom{n}{k}', name: 'C(n,k)', category: 'Stats' },
  { latex: 'P(n,k)', name: 'P(n,k)', category: 'Stats' },
  // Estimators
  { latex: '\\hat{\\theta}', name: 'θ̂ (estimator)', category: 'Stats' },
  { latex: '\\chi^2', name: 'χ²', category: 'Stats' },

  // ==================== GEOMETRY & TRIG ====================
  // Trig functions
  { latex: '\\sin(x)', name: 'sin(x)', category: 'Trig' },
  { latex: '\\cos(x)', name: 'cos(x)', category: 'Trig' },
  { latex: '\\tan(x)', name: 'tan(x)', category: 'Trig' },
  { latex: '\\csc(x)', name: 'csc(x)', category: 'Trig' },
  { latex: '\\sec(x)', name: 'sec(x)', category: 'Trig' },
  { latex: '\\cot(x)', name: 'cot(x)', category: 'Trig' },
  // Inverse trig
  { latex: '\\sin^{-1}(x)', name: 'sin⁻¹(x)', category: 'Trig' },
  { latex: '\\cos^{-1}(x)', name: 'cos⁻¹(x)', category: 'Trig' },
  { latex: '\\tan^{-1}(x)', name: 'tan⁻¹(x)', category: 'Trig' },
  { latex: '\\sin^{-1}\\left(\\frac{a}{b}\\right)', name: 'sin⁻¹(a/b)', category: 'Trig' },
  // Squared
  { latex: '\\sin^2(x) + \\cos^2(x) = 1', name: 'Pythagorean', category: 'Trig' },
  // Identities
  { latex: '\\sin(2x) = 2\\sin(x)\\cos(x)', name: 'Double angle sin', category: 'Trig' },
  { latex: '\\cos(2x) = \\cos^2(x) - \\sin^2(x)', name: 'Double angle cos', category: 'Trig' },
  // Angles
  { latex: '\\angle ABC', name: '∠ABC', category: 'Trig' },
  { latex: '^\\circ', name: '° (degree)', category: 'Trig' },
  // Shapes
  { latex: '\\triangle ABC', name: '△ABC', category: 'Trig' },
  // Relations
  { latex: '\\perp', name: '⊥ (perpendicular)', category: 'Trig' },
  { latex: '\\parallel', name: '∥ (parallel)', category: 'Trig' },
  // Lines/Segments
  { latex: '\\overline{AB}', name: 'AB̅ (segment)', category: 'Trig' },
  // Formulas
  { latex: 'A = \\pi r^2', name: 'Circle area', category: 'Trig' },
  { latex: 'C = 2\\pi r', name: 'Circumference', category: 'Trig' },
  { latex: 'A = \\frac{1}{2}bh', name: 'Triangle area', category: 'Trig' },
  { latex: 'a^2 + b^2 = c^2', name: 'Pythagorean thm', category: 'Trig' },
  { latex: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B}', name: 'Law of sines', category: 'Trig' },
  { latex: 'c^2 = a^2 + b^2 - 2ab\\cos C', name: 'Law of cosines', category: 'Trig' },

  // ==================== GREEK SYMBOLS ====================
  // Lowercase
  { latex: '\\alpha', name: 'α alpha', category: 'Greek' },
  { latex: '\\beta', name: 'β beta', category: 'Greek' },
  { latex: '\\gamma', name: 'γ gamma', category: 'Greek' },
  { latex: '\\delta', name: 'δ delta', category: 'Greek' },
  { latex: '\\epsilon', name: 'ε epsilon', category: 'Greek' },
  { latex: '\\zeta', name: 'ζ zeta', category: 'Greek' },
  { latex: '\\eta', name: 'η eta', category: 'Greek' },
  { latex: '\\theta', name: 'θ theta', category: 'Greek' },
  { latex: '\\iota', name: 'ι iota', category: 'Greek' },
  { latex: '\\kappa', name: 'κ kappa', category: 'Greek' },
  { latex: '\\lambda', name: 'λ lambda', category: 'Greek' },
  { latex: '\\mu', name: 'μ mu', category: 'Greek' },
  { latex: '\\nu', name: 'ν nu', category: 'Greek' },
  { latex: '\\xi', name: 'ξ xi', category: 'Greek' },
  { latex: '\\pi', name: 'π pi', category: 'Greek' },
  { latex: '\\rho', name: 'ρ rho', category: 'Greek' },
  { latex: '\\sigma', name: 'σ sigma', category: 'Greek' },
  { latex: '\\tau', name: 'τ tau', category: 'Greek' },
  { latex: '\\upsilon', name: 'υ upsilon', category: 'Greek' },
  { latex: '\\phi', name: 'φ phi', category: 'Greek' },
  { latex: '\\chi', name: 'χ chi', category: 'Greek' },
  { latex: '\\psi', name: 'ψ psi', category: 'Greek' },
  { latex: '\\omega', name: 'ω omega', category: 'Greek' },
  // Uppercase
  { latex: '\\Gamma', name: 'Γ Gamma', category: 'Greek' },
  { latex: '\\Delta', name: 'Δ Delta', category: 'Greek' },
  { latex: '\\Theta', name: 'Θ Theta', category: 'Greek' },
  { latex: '\\Lambda', name: 'Λ Lambda', category: 'Greek' },
  { latex: '\\Xi', name: 'Ξ Xi', category: 'Greek' },
  { latex: '\\Pi', name: 'Π Pi', category: 'Greek' },
  { latex: '\\Sigma', name: 'Σ Sigma', category: 'Greek' },
  { latex: '\\Phi', name: 'Φ Phi', category: 'Greek' },
  { latex: '\\Psi', name: 'Ψ Psi', category: 'Greek' },
  { latex: '\\Omega', name: 'Ω Omega', category: 'Greek' },

  // ==================== LOGIC & PROOFS ====================
  // Quantifiers
  { latex: '\\forall', name: '∀ (for all)', category: 'Logic' },
  { latex: '\\exists', name: '∃ (exists)', category: 'Logic' },
  { latex: '\\nexists', name: '∄ (not exists)', category: 'Logic' },
  // Connectives
  { latex: '\\land', name: '∧ (and)', category: 'Logic' },
  { latex: '\\lor', name: '∨ (or)', category: 'Logic' },
  { latex: '\\lnot', name: '¬ (not)', category: 'Logic' },
  // Truth values
  { latex: '\\bot', name: '⊥ (false)', category: 'Logic' },
  // Turnstiles
  { latex: '\\vdash', name: '⊢ (proves)', category: 'Logic' },
  { latex: '\\models', name: '⊨ (models)', category: 'Logic' },
  // Annotations
  { latex: '\\underbrace{x}_{\\text{label}}', name: 'Underbrace', category: 'Logic' },
  { latex: '\\overbrace{x}^{\\text{label}}', name: 'Overbrace', category: 'Logic' },
  { latex: '\\boxed{x}', name: 'Boxed', category: 'Logic' },
];

/**
 * Get general snippets (always visible)
 */
export function getGeneralSnippets() {
  return snippets.filter(s => s.category === 'General');
}

/**
 * Get snippets by category (excludes General)
 */
export function getSnippetsByCategory(category) {
  if (!category || category === 'All') {
    return snippets.filter(s => s.category !== 'General');
  }
  return snippets.filter(s => s.category === category);
}

/**
 * Get all snippets
 */
export function getAllSnippets() {
  return snippets;
}
