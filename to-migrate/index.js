import * as d3 from 'd3';
import $ from 'jquery';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { TweenMax, Power2, Power3 } from 'gsap/all';
import _ from 'lodash';

// Make GSAP globally available for zoom-utils
window.TweenMax = TweenMax;
window.Power3 = Power3;
import SVG from 'svg.js';
import shortid from 'shortid';
import Emittery from 'emittery';
import calculateSize from 'calculate-size';

// Import migrated modules
import * as PathGenerators from './path-generators/index.js';
import * as ScriptShapes from './script-shapes/index.js';
import * as Effects from './effects/index.js';

// Import new components for mathtext example
export { PluginInitializer } from './plugins/plugin-initializer.js';
export { PenTracerImpl } from './pen/pen-tracer-impl.js';
export { Point } from './geom/Point.js';
export { WriteEffect } from './mathtext/effects/write-effect.js';
export { SequenceStepEffect } from './effects/sequence-step-effect.js';

// Export for easy access
export { PathGenerators, ScriptShapes, Effects };

const emitter = new Emittery();

function initApp() {
    console.log('Pen Sequencer initialized with ES6 modules');
    
    renderMathExample();
    
    createD3Visualization();
    
    setupSVGDrawing();
    
    animateElements();
    
    demonstrateUtilities();
}

function renderMathExample() {
    const mathContainer = document.getElementById('math-output');
    
    const equation = 'E = mc^2';
    const html = katex.renderToString(equation, {
        throwOnError: false
    });
    
    mathContainer.innerHTML = `
        <h2>Math Rendering</h2>
        <div class="equation">${html}</div>
    `;
}

function createD3Visualization() {
    const width = 400;
    const height = 300;
    const data = _.range(10).map(i => ({
        x: i * 40,
        y: Math.random() * height,
        id: shortid.generate()
    }));
    
    const svg = d3.select('#canvas-container')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('border', '1px solid #ccc');
    
    svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 10)
        .attr('fill', (d, i) => d3.schemeCategory10[i % 10])
        .on('click', function(d) {
            emitter.emit('circle-clicked', d);
        });
    
    emitter.on('circle-clicked', (data) => {
        console.log('Circle clicked:', data);
    });
}

function setupSVGDrawing() {
    const draw = SVG('svg-container').size(400, 200);

    const rect = draw.rect(100, 100).fill('#f06');
    const circle = draw.circle(80).fill('#0f9').move(150, 50);
}

function animateElements() {
    const animContainer = document.getElementById('animation-container');
    animContainer.innerHTML = '<div class="animated-box"></div>';
    
    const box = animContainer.querySelector('.animated-box');
    
    TweenMax.to(box, 2, {
        x: 200,
        rotation: 360,
        ease: Power2.easeInOut,
        repeat: -1,
        yoyo: true
    });
}

function demonstrateUtilities() {
    const textSize = calculateSize('Hello World', {
        font: 'Arial',
        fontSize: '16px'
    });
    
    console.log('Text dimensions:', textSize);
    
    
    $('#app').append(`
        <div class="info">
            <h3>Utilities Demo</h3>
            <p>Text size calculation: ${JSON.stringify(textSize)}</p>
        </div>
    `);
}

document.addEventListener('DOMContentLoaded', initApp);