import { FontDefs } from '../mathtext/font-defs.js';
import { FontMapService } from '../mathtext/services/font-map.service.js';

export class PluginInitializer {
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
      '      extensions: ["bbox.js", "color.js"]\n' +
      '    },\n' +
      '    SVG:{\n' +
      '    useFontCache:false\n' +
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
    console.log("addPluginLibraries called");

    // Load MathJax core and required modules
    const mathJaxLibs = [
      {url: "mathjax/unpacked/MathJax.js", parent: document.head},
      {url: "mathjax/unpacked/app-triggered/mtable-loader.js", parent: document.head},
      {url: "mathjax/unpacked/app-triggered/multiline-loader.js", parent: document.head},
      {url: "mathjax/unpacked/app-triggered/ms-loader.js", parent: document.head},
      {url: "mathjax/unpacked/app-triggered/mmultiscript-loader.js", parent: document.head},
      {url: "mathjax/unpacked/app-triggered/menclose-loader.js", parent: document.head},
      {url: "mathjax/unpacked/app-triggered/rep-key-list.js", parent: document.head},
      {url: "external/BezierPlugin.min.js", parent: document.head},
      {url: "external/dom-to-image.js", parent: document.head},
      {url: "external/DrawSVGPlugin.min.js", parent: document.head},
      {url: "external/MorphSVGPlugin.min.js", parent: document.head},
      {url: "external/SplitText.min.js", parent: document.head}
    ];

    const libPromises = mathJaxLibs.map((libPath => {
      return this.importScript(libPath.url, libPath.parent);
    }));

    const mathJaxLoadedPromise = Promise.all(libPromises).then(() => {
      console.log("MATHJAX Libraries added successfully");
    }).catch((err) => {
      console.error("Error occurred while loading MATHJAX Libraries", err);
    });

    // Load hook.js which provides TEXT_TO_ML translator
    const hookLoadedPromise = mathJaxLoadedPromise.then(() => {
      console.log("Loading MathJax hook.js...");
      return this.importScript("mathjax/hook.js", document.head);
    }).then(() => {
      console.log("MathJax hook.js loaded successfully");
    }).catch((err) => {
      console.error("Error loading hook.js:", err);
      throw err;
    });

    const hubPromise = new Promise((resolve, reject) => {
      hookLoadedPromise.then(() => {
        console.log("Hook loaded, adding to Hub.Queue");
        console.log("MathJax available?", !!window.MathJax);
        console.log("MathJax.Hub available?", !!(window.MathJax && window.MathJax.Hub));

        if (!window.MathJax || !window.MathJax.Hub) {
          console.error("MathJax.Hub not available!");
          reject(new Error("MathJax.Hub not available"));
          return;
        }

        window.MathJax.Hub.Queue(function () {
          console.log("Inside Hub.Queue callback");
          try {
            // Ensure SVG output is fully initialized
            if (!window.MathJax.OutputJax || !window.MathJax.OutputJax.SVG) {
              console.error("MathJax.OutputJax.SVG not available yet");
              reject(new Error("MathJax.OutputJax.SVG not available"));
              return;
            }

            // Initialize FONTDATA if it doesn't exist
            if (!window.MathJax.OutputJax.SVG.FONTDATA) {
              console.log("Initializing FONTDATA structure...");
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
            console.log("Initializing FontMapService");
            FontMapService.getInstance();

            console.log("Loading FontDefs...");
            // FontDefs depends on the module loaders being available
            FontDefs.loadAllDefs();
            console.log("FontDefs.loadAllDefs completed");
            resolve(true);
          } catch(err) {
            console.error("Error in Hub.Queue callback:", err);
            reject(err);
          }
        });
      }).catch(err => {
        console.error("Error in hub promise:", err);
        reject(err);
      });
    });
    return hubPromise;
  }

  static importScript(url, parentContainer) {
    const rootPath = "https://provility-lib.s3.amazonaws.com/assets";
    const fullPath = rootPath + "/" + url;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.warn("Timeout loading:", fullPath);
        if (url.startsWith('external/') || url.startsWith('mathjax/unpacked/app-triggered/')) {
          resolve(); // Non-critical, continue
        } else {
          reject(new Error("Timeout loading: " + fullPath));
        }
      }, 10000); // 10 second timeout

      let s = document.createElement("script");
      s.onload = () => {
        clearTimeout(timeout);
        console.log("Loaded:", fullPath);
        resolve();
      };
      s.onerror = (e) => {
        clearTimeout(timeout);
        console.error("Failed to load:", fullPath);
        // Don't reject for external plugins that might not be critical
        if (url.startsWith('external/') || url.startsWith('mathjax/unpacked/app-triggered/')) {
          console.warn("Non-critical plugin failed, continuing:", url);
          resolve();
        } else {
          reject(e);
        }
      };
      s.src = fullPath;
      parentContainer.appendChild(s);
    });
  }
}