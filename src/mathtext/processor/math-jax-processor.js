import { JaxOutputProcessor } from "./jax-output-processor.js";
import { StringUtil } from "../../shared/utils/string-util.js";

export class MathJaxProcessor {

  static SCRATCH_PAD_ID = 'scratchpad-Frame';

  // Debug flag - set to true to log MathJax SVG structure
  static DEBUG_SVG_STRUCTURE = false;

  static renderToString(inputMathText, textSizeInEx) {
    let latex;

    if (this.isLatex(inputMathText)) {
      latex = StringUtil.replace(inputMathText, "$", '');
    } else {
      latex = this.toLatex(inputMathText);
    }
    return this.renderLatex(latex, textSizeInEx);
  }
  
  static toLatex(inputMathText) {
    // For now, just return input as LaTeX since we don't have ASCII math parser
    // TODO: Implement ASCII math parser if needed
    return inputMathText;
  }

  static renderLatex(latex, textSizeInEx) {
    console.log('renderLatex called with:', latex);

    // Verify TEXT_TO_ML is available
    if (!window['TEXT_TO_ML']) {
      console.error('TEXT_TO_ML not available!');
      throw new Error('TEXT_TO_ML translator not loaded. Ensure PluginInitializer.initialize() completed successfully.');
    }

    let mathText = "\\displaystyle{" + latex + "}";
    console.log('Full mathText:', mathText);

    let scriptTag = {
      text: mathText,
      type: ''
    };

    console.log('Calling TEXT_TO_ML.Translate...');
    let parsedObj = window['TEXT_TO_ML'].Translate(scriptTag);
    console.log('parsedObj:', parsedObj);
    console.log('parsedObj.root:', parsedObj.root);

    parsedObj['display'] = 'block';
    parsedObj['inputID'] = 'scratchpad';

    let scriptEL = document.getElementById("inputjaxForm");
    scriptEL.MathJax = {
      elementJax: {
        root: parsedObj.root,
        originalText: mathText,
        inputID: 'scratchpad',
        SVG: {
          isHidden: true,
          cwidth: 70966.4,
          em: 16.6,
          ex: 7.18,
          lineWidth: 10000000,
        },
        outputJax: "SVG",
        inputJax: 'TeX'
      },
      state: 4,
      checked: 1,
      newID: 100
    };
    var lightState = {};
    document.getElementById('scratchpad-Frame').innerHTML = '';
    let svgProcessed;
    let convertToSVG = () => {
      console.log('Converting to SVG...');
      window['MathJax'].OutputJax['SVG'].Process(scriptEL, lightState);
      let svg = document.getElementById(MathJaxProcessor.SCRATCH_PAD_ID).innerHTML;
      console.log('SVG output length:', svg.length);
      console.log('SVG output (first 200 chars):', svg.substring(0, 200));
      const jaxOutputProcessor = new JaxOutputProcessor();
      svgProcessed = jaxOutputProcessor.process(svg, textSizeInEx);
      console.log('Processed SVG length:', svgProcessed ? svgProcessed.length : 0);
    };
    try {
      convertToSVG();
      return svgProcessed;
    } catch (e) {
      console.error('First attempt failed:', e);
      try {
        convertToSVG();
        return svgProcessed;
      } catch (e) {
        console.error('Second attempt also failed:', e);
        throw e;
      }
    }
  }

  static isLatex(inputMathText) {
    if (inputMathText.startsWith('$$')) {
      return true;
    }
    if (inputMathText.match(/\\\w+/)) {
      return true;
    }

    if (inputMathText.match(/\\begin(.+?)/)) {
      return true;
    }

    return false;
  }

  /**
   * DEBUG: Render LaTeX and log the SVG structure to discover MathJax patterns
   * Call from console: MathJaxProcessor.debugRenderLatex("\\frac{2}{3}", 0.07)
   * @param {string} latex - LaTeX string to render
   * @param {number} textSizeInEx - Text size (default 0.07)
   */
  static debugRenderLatex(latex, textSizeInEx = 0.07) {
    console.log('\n========== DEBUG RENDER ==========');
    console.log('Input LaTeX:', latex);

    if (!window['TEXT_TO_ML']) {
      console.error('TEXT_TO_ML not available!');
      return;
    }

    let mathText = "\\displaystyle{" + latex + "}";
    let scriptTag = { text: mathText, type: '' };
    let parsedObj = window['TEXT_TO_ML'].Translate(scriptTag);

    parsedObj['display'] = 'block';
    parsedObj['inputID'] = 'scratchpad';

    let scriptEL = document.getElementById("inputjaxForm");
    scriptEL.MathJax = {
      elementJax: {
        root: parsedObj.root,
        originalText: mathText,
        inputID: 'scratchpad',
        SVG: { isHidden: true, cwidth: 70966.4, em: 16.6, ex: 7.18, lineWidth: 10000000 },
        outputJax: "SVG",
        inputJax: 'TeX'
      },
      state: 4, checked: 1, newID: 100
    };

    document.getElementById('scratchpad-Frame').innerHTML = '';
    window['MathJax'].OutputJax['SVG'].Process(scriptEL, {});

    let svg = document.getElementById(MathJaxProcessor.SCRATCH_PAD_ID).innerHTML;
    console.log('\nRaw SVG output:\n', svg);

    // Use debug processor
    const jaxOutputProcessor = new JaxOutputProcessor();
    jaxOutputProcessor.processWithDebug(svg, textSizeInEx);

    console.log('========== END DEBUG RENDER ==========\n');
    return svg;
  }
}