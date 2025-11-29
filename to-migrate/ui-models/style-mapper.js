import { isUndefined } from 'lodash';

export class StyleMapper {
  static CANVAS = 'canvas';
  
  static fill = 'fill';
  static fillOpacity = 'fill-opacity';
  static strokeWidth = 'stroke-width';
  static stroke = 'stroke';
  static PADDING_PROPS = ['paddingLeft', 'paddingTop', 'paddingRight', 'paddingBottom', 'padding'];
  static BORDER_PROPS = ['borderLeft', 'borderTop', 'borderRight', 'borderBottom', 'border'];
  
  static color = 'color';
  static backgroundColor = 'background-color';
  static opacity = 'opacity';
  static fontSize = 'font-size';
  static labelColor = 'labelColor';
  
  // svg font relatedProps
  static fontFamily = 'family'; // svg.js uses these values
  static fontColor = 'color';
  static size = 'size';
  static letterSpacing = 'letter-spacing';
  static boxShadow = 'boxShadow';
  
  static svgExcludeProps = ['-webkit-filter', '-moz-filter', '-o-filter', '-ms-filter'];
  
  static getCSSPropStyle(styleObj) {
    const newObj = {};
    Object.assign(newObj, styleObj);
    if (styleObj[StyleMapper.stroke]) {
      newObj[StyleMapper.color] = styleObj[StyleMapper.stroke];
    }
    
    if (styleObj[StyleMapper.opacity]) {
      newObj[StyleMapper.opacity] = styleObj[StyleMapper.fillOpacity];
    }
    newObj[StyleMapper.stroke] = undefined;
    newObj[StyleMapper.fillOpacity] = undefined;
    
    this.clearUndefinedProps(newObj);
    return newObj;
  }
  
  static getSVGPropStyle(styleObj) {
    const newObj = {};
    Object.assign(newObj, styleObj);
    this.svgExcludeProps.forEach((excludeProp) => {
      if (newObj[excludeProp]) {
        delete newObj[excludeProp];
      }
    });
    this.clearUndefinedProps(newObj);
    return newObj;
  }
  
  static clearUndefinedProps(newObj) {
    Object.keys(newObj).forEach((prop) => {
      if (isUndefined(newObj[prop])) {
        delete newObj[prop];
      }
    });
  }
}