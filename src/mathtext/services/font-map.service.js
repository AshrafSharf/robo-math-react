import { MainFontMap } from "../processor/main-font-map.js";
import { Size2FontMap } from "../processor/size2-font-map.js";
import { Size3FontMap } from "../processor/size3-font-map.js";
import { Size4FontMap } from "../processor/size4-font-map.js";
import { MainSymbolsFontMap } from "../processor/main-symbols-font-map.js";
import { SymbolCharactersMap } from "../processor/symbol-characters-map.js";
import { SymbolItalicCharactersMap } from "../processor/symbol-italic-characters-map.js";
import { MainSymbolsItalicFontMap } from "../processor/main-symbols-italic-font-map.js";

export class FontMapService {

    allFontMaps = {};

    static instance = null;
    
    static getInstance() {
        if (FontMapService.instance == null) {
            FontMapService.instance = new FontMapService();
        }
        return FontMapService.instance;
    }

    constructor() {
        this.loadAllFontMaps();
    }

    loadAllFontMaps() {
        const mainFontMap = MainFontMap.mainFontMapValues;
        const size2Map = Size2FontMap.getMapValues();
        const size3Map = Size3FontMap.getMapValues();
        const size4Map = Size4FontMap.getMapValues();
        const mainSymbolsMap = MainSymbolsFontMap.getMapValues();
        const mainSymbolsItalicMap = MainSymbolsItalicFontMap.getMapValues();
        const symbolCharactersMap = SymbolCharactersMap.getMapValues();
        const symbolItalicCharactersMap = SymbolItalicCharactersMap.getMapValues();
        this.allFontMaps = {
            ...mainFontMap, ...size2Map, ...size3Map,
            ...size4Map, ...mainSymbolsMap, ...symbolCharactersMap, ...symbolItalicCharactersMap, ...mainSymbolsItalicMap
        };
    }

    getPathList(pathId) {
        if (this.allFontMaps[pathId]) {
            return this.allFontMaps[pathId];
        }
        return [];
    }
}