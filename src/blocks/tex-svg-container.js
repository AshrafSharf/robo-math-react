import { TexSVGComponent } from './components/tex-svg-component.js';
import { ComponentState } from './component-state.js';
import { IdUtil } from './shared/utils/id-util.js';

export class TexSVGContainer {
  constructor(options = {}) {
    // Set defaults with clear names
    this.defaultFontSize = options.fontSize || 22;
    this.defaultStroke = options.stroke || '#000000';
    
    // Create container directly under body
    this.containerDOM = document.createElement('div');
    this.containerDOM.id = `tex-svg-container-${IdUtil.getID()}`;
    this.containerDOM.style.position = 'relative';
    this.containerDOM.style.width = '100%';
    this.containerDOM.style.height = '100%';
    document.body.appendChild(this.containerDOM);
  }

  texToSvg(content, options = {}) {
    const componentState = Object.assign(new ComponentState(), {
      componentId: `tex-svg-item_${IdUtil.getID()}`,
      content: content
    });

    // Merge container defaults with specific options
    const mergedOptions = {
      fontSize: this.defaultFontSize,
      stroke: this.defaultStroke,
      ...options  // Override with any specific options
    };

    // Create the tex svg component (auto-inits and renders)
    const texSvgComponent = new TexSVGComponent(componentState, this.containerDOM, mergedOptions);

    // Apply any custom CSS styles after creation
    if (options.style) {
      texSvgComponent.style(options.style);
    }

    return texSvgComponent;
  }


  clear() {
    // Clear container content
    this.containerDOM.innerHTML = '';
  }

  destroy() {
    // Remove container from DOM
    if (this.containerDOM && this.containerDOM.parentNode) {
      this.containerDOM.parentNode.removeChild(this.containerDOM);
    }
  }

  getContainer() {
    return this.containerDOM;
  }
}