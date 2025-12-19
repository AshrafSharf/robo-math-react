import { FontDefs } from '../mathtext/font-defs.js';
import { FontMapService } from '../mathtext/services/font-map.service.js';

/**
 * CDN version of PluginInitializer
 * Uses cdnjs for MathJax core (faster, globally distributed)
 * Custom files still loaded from S3
 */
export class PluginInitializer {
  static MATHJAX_CDN = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.9";
  static S3_ROOT = "https://provility-lib.s3.amazonaws.com/assets";

  static initialize() {
    this.addMathJaxConfig();
    this.addMathJaxDOM();
    return this.addPluginLibraries();
  }

  static addMathJaxConfig() {
    let mathJaxConfigText = 'MathJax.Hub.Config({\n' +
      '    extensions: ["tex2jax.js"],\n' +
      '    jax: ["input/TeX","output/SVG"],\n' +
      '    showProcessingMessages:true,\n' +
      '    showMathMenu:false,\n' +
      '    messageStyle:\'none\',\n' +
      '    skipStartupTypeset:false,\n' +
      '    tex2jax: {inlineMath: [["$","$"],["\\\\(","\\\\)"]]},\n' +
      '    TeX: {\n' +
      '      extensions: ["bbox.js", "color.js", "cancel.js", "enclose.js"],\n' +
      '      Macros: {\n' +
      '        square: ["\\\\unicode{x25A1}", 0],\n' +
      '        blacksquare: ["\\\\unicode{x25A0}", 0],\n' +
      '        triangle: ["\\\\unicode{x25B3}", 0],\n' +
      '        blacktriangle: ["\\\\unicode{x25B2}", 0],\n' +
      '        triangledown: ["\\\\unicode{x25BD}", 0],\n' +
      '        blacktriangledown: ["\\\\unicode{x25BC}", 0],\n' +
      '        lozenge: ["\\\\unicode{x25CA}", 0],\n' +
      '        diamond: ["\\\\unicode{x25C7}", 0],\n' +
      '        therefore: ["\\\\unicode{x2234}", 0],\n' +
      '        because: ["\\\\unicode{x2235}", 0],\n' +
      '        curvearrowleft: ["\\\\unicode{x21B6}", 0],\n' +
      '        curvearrowright: ["\\\\unicode{x21B7}", 0],\n' +
      '        circlearrowleft: ["\\\\unicode{x21BA}", 0],\n' +
      '        circlearrowright: ["\\\\unicode{x21BB}", 0],\n' +
      '        twoheadleftarrow: ["\\\\unicode{x219E}", 0],\n' +
      '        twoheadrightarrow: ["\\\\unicode{x21A0}", 0],\n' +
      '        leftarrowtail: ["\\\\unicode{x21A2}", 0],\n' +
      '        rightarrowtail: ["\\\\unicode{x21A3}", 0],\n' +
      '        xleftarrow: ["\\\\mathrel{\\\\mathop{\\\\longleftarrow}\\\\limits^{#2}_{#1}}", 2, ""],\n' +
      '        xrightarrow: ["\\\\mathrel{\\\\mathop{\\\\longrightarrow}\\\\limits^{#2}_{#1}}", 2, ""],\n' +
      '        xLeftarrow: ["\\\\mathrel{\\\\mathop{\\\\Longleftarrow}\\\\limits^{#2}_{#1}}", 2, ""],\n' +
      '        xRightarrow: ["\\\\mathrel{\\\\mathop{\\\\Longrightarrow}\\\\limits^{#2}_{#1}}", 2, ""],\n' +
      '        xleftrightarrow: ["\\\\mathrel{\\\\mathop{\\\\longleftrightarrow}\\\\limits^{#2}_{#1}}", 2, ""],\n' +
      '        xLeftrightarrow: ["\\\\mathrel{\\\\mathop{\\\\Longleftrightarrow}\\\\limits^{#2}_{#1}}", 2, ""]\n' +
      '      }\n' +
      '    },\n' +
      '    SVG:{\n' +
      '    useFontCache:false,\n' +
      '    addMMLclasses:true\n' +
      '    }\n' +
      '  });';

    const mathJaxConfigScript = document.createElement("script");
    mathJaxConfigScript.type = "text/x-mathjax-config";
    mathJaxConfigScript.textContent = mathJaxConfigText;
    document.head.appendChild(mathJaxConfigScript);
  }

  static addMathJaxDOM() {
    const jaxContainerDOM = document.createElement('div');
    jaxContainerDOM.id = 'jax-container-dom';
    document.body.appendChild(jaxContainerDOM);

    const mathJaxDOM = `<div id="scratchpad-Frame"></div>
                                      <div id="inputjaxForm"></div>
                                      <div class="box" id="box" style="visibility:hidden">
                                        <div id="MathOutput" class="output"></div>
                                      </div>
                                      <div id="svg-math-annotation"></div>`;
    jaxContainerDOM.innerHTML = mathJaxDOM;

    const mathOutputElem = document.getElementById('MathOutput');
    if (mathOutputElem) {
      mathOutputElem.innerText = "$${}$$";
    }
  }

  static addPluginLibraries() {
    console.log("[CDN] addPluginLibraries called");

    // Load MathJax core from CDN, everything else from S3 - all in parallel
    const mathJaxLibs = [
      {url: `${this.MATHJAX_CDN}/MathJax.js`, critical: true},
      {url: `${this.S3_ROOT}/mathjax/unpacked/app-triggered/mtable-loader.js`, critical: false},
      {url: `${this.S3_ROOT}/mathjax/unpacked/app-triggered/multiline-loader.js`, critical: false},
      {url: `${this.S3_ROOT}/mathjax/unpacked/app-triggered/ms-loader.js`, critical: false},
      {url: `${this.S3_ROOT}/mathjax/unpacked/app-triggered/mmultiscript-loader.js`, critical: false},
      {url: `${this.S3_ROOT}/mathjax/unpacked/app-triggered/menclose-loader.js`, critical: false},
      {url: `${this.S3_ROOT}/mathjax/unpacked/app-triggered/rep-key-list.js`, critical: false},
      {url: `${this.S3_ROOT}/external/BezierPlugin.min.js`, critical: false},
      {url: `${this.S3_ROOT}/external/dom-to-image.js`, critical: false},
      {url: `${this.S3_ROOT}/external/DrawSVGPlugin.min.js`, critical: false},
      {url: `${this.S3_ROOT}/external/MorphSVGPlugin.min.js`, critical: false},
      {url: `${this.S3_ROOT}/external/SplitText.min.js`, critical: false}
    ];

    const libPromises = mathJaxLibs.map(lib => {
      return this.importScriptFromUrl(lib.url, document.head, lib.critical ? 30000 : 15000)
        .catch(err => {
          if (lib.critical) {
            throw err;
          }
          console.warn(`[CDN] Non-critical module failed: ${lib.url}`, err);
          return null;
        });
    });

    const mathJaxLoadedPromise = Promise.all(libPromises).then(() => {
      console.log("[CDN] All libraries loaded successfully");
    }).catch((err) => {
      console.error("[CDN] Error loading libraries", err);
      throw err;
    });

    // Load hook.js which provides UpdateMath function
    const hookLoadedPromise = mathJaxLoadedPromise.then(() => {
      console.log("[CDN] Loading MathJax hook.js...");
      return this.importScriptFromUrl(`${this.S3_ROOT}/mathjax/hook.js`, document.head, 15000);
    }).then(() => {
      console.log("[CDN] MathJax hook.js loaded successfully");
    }).catch((err) => {
      console.error("[CDN] Error loading hook.js:", err);
      throw err;
    });

    const hubPromise = new Promise((resolve, reject) => {
      hookLoadedPromise.then(() => {
        console.log("[CDN] Hook loaded, adding to Hub.Queue");
        console.log("[CDN] MathJax available?", !!window.MathJax);
        console.log("[CDN] MathJax.Hub available?", !!(window.MathJax && window.MathJax.Hub));

        if (!window.MathJax || !window.MathJax.Hub) {
          console.error("[CDN] MathJax.Hub not available!");
          reject(new Error("MathJax.Hub not available"));
          return;
        }

        // First queue: Perform test render to force load all extensions
        window.MathJax.Hub.Queue(function () {
          console.log("[CDN] Performing test render to load all MathJax extensions...");

          // Create a test element with content that triggers extensions and preloads special chars
          const testDiv = document.createElement('div');
          testDiv.id = 'mathjax-init-test';
          testDiv.style.position = 'absolute';
          testDiv.style.left = '-9999px';
          // Include special characters to preload their font definitions
          testDiv.innerHTML = '$$\\displaystyle{x^2 + 2x + 1 \\square \\therefore \\triangle \\mathbb{N}}$$';
          document.body.appendChild(testDiv);

          // Queue the test typeset
          window.MathJax.Hub.Queue(['Typeset', window.MathJax.Hub, testDiv]);
        });

        // Second queue: Initialize font system after test render completes
        window.MathJax.Hub.Queue(function () {
          console.log("[CDN] Test render complete. Initializing font system...");

          // Remove test element
          const testDiv = document.getElementById('mathjax-init-test');
          if (testDiv) {
            testDiv.remove();
          }

          try {
            // Patch: Expose TEXT_TO_ML (the S3 MathJax has this baked in, CDN doesn't)
            // TEXT_TO_ML is the TeX input jax used for translating LaTeX to MathML
            if (window.MathJax.InputJax && window.MathJax.InputJax.TeX) {
              window.TEXT_TO_ML = window.MathJax.InputJax.TeX;
              console.log("[CDN] TEXT_TO_ML patched from MathJax.InputJax.TeX");
            } else {
              console.error("[CDN] MathJax.InputJax.TeX not available for TEXT_TO_ML patch");
            }

            // Ensure SVG output is fully initialized
            if (!window.MathJax.OutputJax || !window.MathJax.OutputJax.SVG) {
              console.error("[CDN] MathJax.OutputJax.SVG not available yet");
              reject(new Error("MathJax.OutputJax.SVG not available"));
              return;
            }

            // Initialize FONTDATA if it doesn't exist
            if (!window.MathJax.OutputJax.SVG.FONTDATA) {
              console.log("[CDN] Initializing FONTDATA structure...");
              window.MathJax.OutputJax.SVG.FONTDATA = {
                FONTS: {},
                VARIANT: {},
                RANGES: [],
                DELIMITERS: {},
                RULECHAR: 0x2212,
                REMAP: {}
              };
            }

            if (!window.MathJax.OutputJax.SVG.FONTDATA.FONTS) {
              window.MathJax.OutputJax.SVG.FONTDATA.FONTS = {};
            }

            // Initialize FontMapService first
            console.log("[CDN] Initializing FontMapService");
            FontMapService.getInstance();

            console.log("[CDN] Loading FontDefs...");
            // FontDefs depends on the module loaders being available
            FontDefs.loadAllDefs();
            console.log("[CDN] FontDefs.loadAllDefs completed");
          } catch(err) {
            console.error("[CDN] Error in Hub.Queue callback:", err);
            reject(err);
          }
        });

        // Third queue: Final verification and resolve
        window.MathJax.Hub.Queue(function () {
          console.log("[CDN] MathJax fully initialized and ready");

          // Verify TEXT_TO_ML is available
          if (!window.TEXT_TO_ML || !window.TEXT_TO_ML.Translate) {
            reject(new Error("TEXT_TO_ML not available after initialization"));
            return;
          }

          console.log("[CDN] ✓ All systems ready");
          resolve(true);
        });
      }).catch(err => {
        console.error("[CDN] Error in hub promise:", err);
        reject(err);
      });
    });
    return hubPromise;
  }

  /**
   * Import script from a full URL
   * @param {string} fullUrl - Complete URL to load
   * @param {HTMLElement} parentContainer - Where to append script
   * @param {number} timeoutMs - Timeout in milliseconds
   */
  static importScriptFromUrl(fullUrl, parentContainer, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.warn("[CDN] Timeout loading:", fullUrl);
        reject(new Error("Timeout loading: " + fullUrl));
      }, timeoutMs);

      let s = document.createElement("script");
      s.onload = () => {
        clearTimeout(timeout);
        console.log("[CDN] Loaded:", fullUrl);
        resolve();
      };
      s.onerror = (e) => {
        clearTimeout(timeout);
        console.error("[CDN] Failed to load:", fullUrl);
        reject(e);
      };
      s.src = fullUrl;
      parentContainer.appendChild(s);
    });
  }
}
