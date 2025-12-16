(function () {

	function objectFlip(obj) {
		const ret = {};
		Object.keys(obj).forEach((key) => {
			ret[obj[key]] = key;
		});
		return ret;
	}

	window.REP_KEY_LIST_DIRECT_MAP = {
		'×': 'xx',
		'∑': 'sum',
		'∏': 'prod',
		'∮': 'oint',
		'∂': 'del',
		'∇': 'grad',
		'∞': 'oo',
		'⋈': 'root', // this is root word, not bowtie
		'∫': 'int',
		'α': 'alpha',
		'β': 'beta',
		'γ': 'gamma',
		'Γ': 'Gamma',
		'δ': 'delta',
		'Δ': 'Delta',
		'ε': 'epsilon',
		'ɛ': 'varepsilon',
		'ζ': 'zeta',
		'η': 'eta',
		'θ': 'theta',
		'ϑ': 'vartheta',
		'ι': 'iota',
		'κ': 'kappa',
		'λ': 'lambda',
		'Λ': 'Lambda',
		'μ': 'mu',
		'ν': 'nu',
		'ξ': 'xi',
		'π': 'pi',
		'ρ': 'rho',
		'σ': 'sigma',
		'Σ': 'Sigma',
		'τ': 'tau',
		'υ': 'upsilon',
		'ϕ': 'phi',
		'φ': 'varphi',
		'χ': 'chi',
		'ψ': 'psi',
		'ω': 'omega',
		'Ω': 'Omega',

		// Not direct mapping use different symbols
		'→': 'lim',
		'↑': 'hat',
		'↓': 'bar',
		'↣': 'ul',
		'↦': 'vec',
		'←': 'dot',
		'↔': 'norm',
		'⇒': 'ubrace',
		'⇐': 'obrace',
	};

  window.MATH_FUNC_KEY_LIST_DIRECT_MAP = {
    '√': 'sqrt',
    '⤖': 'abs'
  }

	window.REP_KEY_LIST_VALUE_MAP = objectFlip(window.REP_KEY_LIST_DIRECT_MAP);
  window.MATH_FUNC_LIST_VALUE_MAP = objectFlip(window.MATH_FUNC_KEY_LIST_DIRECT_MAP);

}())
