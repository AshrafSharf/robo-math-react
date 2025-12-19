export function loadMJAMS() {
        const MathJax = window.MathJax;
        if (!MathJax || !MathJax.OutputJax || !MathJax.OutputJax.SVG) {
            throw new Error('MathJax SVG output not available');
        }
        let fontDefs = {
            directory: 'AMS/Regular',
            family: 'MathJax_AMS',
            id: 'MJAMS',
            skew: {},
            Ranges: [],

            // WHITE SQUARE (□) - \square
            0x25A1: [695, 195, 667, 56, 611, '71 -6V689H596V-6H71ZM126 49H541V634H126V49'],

            // BLACK SQUARE (■) - \blacksquare
            0x25A0: [695, 195, 667, 56, 611, '71 -6H596V689H71V-6'],

            // WHITE UP-POINTING TRIANGLE (△) - \triangle
            0x25B3: [695, 195, 667, 56, 611, '56 -6L333 689L611 -6H56ZM164 49H503L333 571L164 49'],

            // BLACK UP-POINTING TRIANGLE (▲) - \blacktriangle
            0x25B2: [695, 195, 667, 56, 611, '56 -6L333 689L611 -6H56'],

            // WHITE DOWN-POINTING TRIANGLE (▽) - \triangledown
            0x25BD: [695, 195, 667, 56, 611, '56 689L333 -6L611 689H56ZM164 634H503L333 112L164 634'],

            // BLACK DOWN-POINTING TRIANGLE (▼) - \blacktriangledown
            0x25BC: [695, 195, 667, 56, 611, '56 689L333 -6L611 689H56'],

            // WHITE DIAMOND (◇) - \lozenge
            0x25CA: [695, 195, 667, 56, 611, '333 689L611 341L333 -6L56 341L333 689ZM333 571L164 341L333 112L503 341L333 571'],

            // THEREFORE (∴)
            0x2234: [521, 16, 620, 54, 566, '250 436Q250 473 273 496T325 519T377 496T400 436T377 376T325 353T273 376T250 436ZM54 56Q54 93 77 116T129 139T181 116T204 56T181 -4T129 -27T77 -4T54 56ZM396 56Q396 93 419 116T471 139T523 116T546 56T523 -4T471 -27T419 -4T396 56'],

            // BECAUSE (∵)
            0x2235: [521, 16, 620, 54, 566, '54 436Q54 473 77 496T129 519T181 496T204 436T181 376T129 353T77 376T54 436ZM396 436Q396 473 419 496T471 519T523 496T546 436T523 376T471 353T419 376T396 436ZM250 56Q250 93 273 116T325 139T377 116T400 56T377 -4T325 -27T273 -4T250 56'],

            // ↞ TWOHEADLEFTARROW (U+219E) - \twoheadleftarrow
            0x219E: [449, -57, 1000, 55, 944, '165 199v102h779v-102H165zM165 250l140-120v240L165 250zM305 250l140-120v240L305 250'],

            // ↠ TWOHEADRIGHTARROW (U+21A0) - \twoheadrightarrow
            0x21A0: [449, -57, 1000, 55, 944, '55 199v102h779v-102H55zM835 250l-140-120v240L835 250zM695 250l-140-120v240L695 250'],

            // ↢ LEFTARROWTAIL (U+21A2) - \leftarrowtail
            0x21A2: [449, -57, 1000, 55, 944, '265 199v102h679v-102H265zM265 250l140-120v240L265 250zM165 150v200h-110v-200h110'],

            // ↣ RIGHTARROWTAIL (U+21A3) - \rightarrowtail
            0x21A3: [449, -57, 1000, 55, 944, '55 199v102h679v-102H55zM735 250l-140-120v240L735 250zM835 150v200h110v-200h-110'],

            // ↶ CURVEARROWLEFT (U+21B6) - \curvearrowleft
            0x21B6: [553, 3, 1000, 55, 944, '750 100Q750 -50 600 -100T300 -100Q150 -50 100 100T150 350L100 300L50 400L150 500L250 400L200 350Q150 250 200 150T400 50Q550 50 650 150T750 350V100ZM100 350L50 250'],

            // ↷ CURVEARROWRIGHT (U+21B7) - \curvearrowright
            0x21B7: [553, 3, 1000, 55, 944, '250 100Q250 -50 400 -100T700 -100Q850 -50 900 100T850 350L900 300L950 400L850 500L750 400L800 350Q850 250 800 150T600 50Q450 50 350 150T250 350V100ZM900 350L950 250'],

            // ↺ CIRCLEARROWLEFT (U+21BA) - \circlearrowleft
            0x21BA: [603, 103, 1000, 55, 944, '500 500Q250 500 150 300T150 0Q150 -150 300 -200T500 -150L450 -200L400 -100L500 0L600 -100L550 -150Q650 -200 750 -100T750 100Q750 300 600 400T500 500ZM400 0L350 -100'],

            // ↻ CIRCLEARROWRIGHT (U+21BB) - \circlearrowright
            0x21BB: [603, 103, 1000, 55, 944, '500 500Q750 500 850 300T850 0Q850 -150 700 -200T500 -150L550 -200L600 -100L500 0L400 -100L450 -150Q350 -200 250 -100T250 100Q250 300 400 400T500 500ZM600 0L650 -100'],
        };
        MathJax.OutputJax.SVG.FONTDATA.FONTS['MathJax_AMS'] = fontDefs;
        Object.defineProperty(MathJax.OutputJax.SVG.FONTDATA.FONTS['MathJax_AMS'], 'available', {
            get: function () {
                return true;
            }
        });
        Object.defineProperty(MathJax.OutputJax.SVG.FONTDATA.FONTS['MathJax_AMS'], 'loadComplete', {
            get: function () {
                return true;
            },
            set: function (value) {
                // Ignore
            }
        });
        Object.defineProperty(MathJax.OutputJax.SVG.FONTDATA.FONTS['MathJax_AMS'], 'isUnknown', {
            get: function () {
                return false;
            }
        });
        Object.defineProperty(MathJax.OutputJax.SVG.FONTDATA.FONTS['MathJax_AMS'], 'checkSVG', {
            value: function () {
                return true;
            }
        });
        Object.defineProperty(MathJax.OutputJax.SVG.FONTDATA.FONTS['MathJax_AMS'], 'loadWeb', {
            value: function (font) {
                var result = MathJax.OutputJax.SVG.FONTDATA.FONTS['MathJax_AMS'];
                result['available'] = true;
                result['loadComplete'] = true;
                return result;
            }
        });
        Object.defineProperty(MathJax.OutputJax.SVG.FONTDATA.FONTS['MathJax_AMS'], 'loadRaw', {
            value: function (name) {
                var result = MathJax.OutputJax.SVG.FONTDATA.FONTS['MathJax_AMS'];
                result['available'] = true;
                result['loadComplete'] = true;
                return result;
            }
        });
    }

