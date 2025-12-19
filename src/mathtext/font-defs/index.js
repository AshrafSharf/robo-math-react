// Font definitions - modular loaders
import { loadMJMain } from './mj-main-loader.js';
import { loadMJMainI } from './mj-main-i-loader.js';
import { loadMJAMS } from './mj-ams-loader.js';
import { loadSize1 } from './size1-loader.js';
import { loadSize2 } from './size2-loader.js';
import { loadSize3 } from './size3-loader.js';
import { loadSize4 } from './size4-loader.js';

export class FontDefs {

    static dec2hexString(dec) {
        return "0x" + Number(dec).toString(16).toUpperCase()
    }

    static loadAllDefs() {
        // Use window globals
        const MathJax = window.MathJax;
        const M_TABLE_LOADER = window.M_TABLE_LOADER;
        const M_MULTI_LINE_LOADER = window.M_MULTI_LINE_LOADER;
        const M_MULTI_SCRIPT_LOADER = window.M_MULTI_SCRIPT_LOADER;
        const MS_LOADER = window.MS_LOADER;
        const MEN_CLOSE_LOADER = window.MEN_CLOSE_LOADER;

        loadMJMain();
        loadMJMainI();
        loadMJAMS();
        loadSize1();
        loadSize2();
        loadSize3();
        loadSize4();

        // Call loaders if they exist
        if (M_TABLE_LOADER) M_TABLE_LOADER();
        if (M_MULTI_LINE_LOADER) M_MULTI_LINE_LOADER();
        if (M_MULTI_SCRIPT_LOADER) M_MULTI_SCRIPT_LOADER();
        if (MS_LOADER) MS_LOADER();
        if (MEN_CLOSE_LOADER) MEN_CLOSE_LOADER();
    }
}

// Re-export individual loaders for direct access
export {
    loadMJMain,
    loadMJMainI,
    loadMJAMS,
    loadSize1,
    loadSize2,
    loadSize3,
    loadSize4
};
