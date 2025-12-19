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

