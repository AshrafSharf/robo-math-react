/**
 * SettingsRecoveryService
 *
 * Stores and recovers command editor settings during import operations.
 * Uses a 3-level matching strategy:
 *   1. Primary: Exact expression string match
 *   2. Secondary: Variable name match (LHS of assignment)
 *   3. Tertiary: Expression type match (FIFO)
 */

import { detectExpressionType } from './expressionTypeDetector.js';

// Settings properties to store/recover
const SETTINGS_KEYS = [
  'color',
  'fillColor',
  'strokeWidth',
  'strokeOpacity',
  'fillOpacity',
  'speed',
  'label',
  'text',
  'offsetX',
  'offsetY',
  'expressionOptions'
];

export class SettingsRecoveryService {
  static instance = null;

  static getInstance() {
    if (SettingsRecoveryService.instance == null) {
      SettingsRecoveryService.instance = new SettingsRecoveryService();
    }
    return SettingsRecoveryService.instance;
  }

  constructor() {
    this._primaryMap = new Map();    // expressionValue -> settings
    this._secondaryMap = new Map();  // variableName -> settings
    this._tertiaryMap = new Map();   // expressionType -> [settings]
    this._hasSnapshot = false;
  }

  /**
   * Store settings from current commands
   * @param {Array} commands - Current commands to snapshot
   */
  storeSettings(commands) {
    this.clearSnapshot();

    if (!commands || commands.length === 0) {
      return;
    }

    commands.forEach(cmd => {
      if (!cmd.expression || cmd.expression.trim() === '') {
        return;
      }

      const { type, label: varName } = detectExpressionType(cmd.expression);
      const expressionValue = cmd.expression.trim();

      // Extract settings from command
      const settings = this._extractSettings(cmd);
      settings._expressionValue = expressionValue;
      settings._variableName = varName;
      settings._expressionType = type;

      // Store in primary map (exact expression)
      this._primaryMap.set(expressionValue, settings);

      // Store in secondary map (variable name)
      if (varName) {
        this._secondaryMap.set(varName, settings);
      }

      // Store in tertiary map (expression type) - as array for duplicates
      if (type) {
        if (!this._tertiaryMap.has(type)) {
          this._tertiaryMap.set(type, []);
        }
        this._tertiaryMap.get(type).push({ ...settings });
      }
    });

    this._hasSnapshot = true;
  }

  /**
   * Extract relevant settings from a command model
   * @param {Object} cmd - Command object
   * @returns {Object} Extracted settings
   */
  _extractSettings(cmd) {
    const settings = {};
    SETTINGS_KEYS.forEach(key => {
      if (cmd[key] !== undefined) {
        // Deep copy expressionOptions
        if (key === 'expressionOptions' && cmd[key]) {
          settings[key] = JSON.parse(JSON.stringify(cmd[key]));
        } else {
          settings[key] = cmd[key];
        }
      }
    });
    return settings;
  }

  /**
   * Recover settings for a command
   * @param {Object} newCommand - New command needing settings recovery
   * @returns {Object} Command with recovered settings merged
   */
  recoverSettings(newCommand) {
    if (!this._hasSnapshot) {
      return newCommand;
    }

    const expressionValue = newCommand.expression?.trim() || '';
    if (!expressionValue) {
      return newCommand;
    }

    const { type, label: varName } = detectExpressionType(expressionValue);

    // Priority 1: Exact expression match
    if (this._primaryMap.has(expressionValue)) {
      return this._mergeSettings(newCommand, this._primaryMap.get(expressionValue));
    }

    // Priority 2: Variable name match
    if (varName && this._secondaryMap.has(varName)) {
      return this._mergeSettings(newCommand, this._secondaryMap.get(varName));
    }

    // Priority 3: Type match (FIFO from array)
    if (type && this._tertiaryMap.has(type)) {
      const typeSettingsList = this._tertiaryMap.get(type);
      if (typeSettingsList.length > 0) {
        const settings = typeSettingsList.shift();
        return this._mergeSettings(newCommand, settings);
      }
    }

    return newCommand;
  }

  /**
   * Merge stored settings into new command
   * @param {Object} newCommand - New command object
   * @param {Object} storedSettings - Stored settings to merge
   * @returns {Object} Merged command
   */
  _mergeSettings(newCommand, storedSettings) {
    const merged = { ...newCommand };

    SETTINGS_KEYS.forEach(key => {
      if (storedSettings[key] !== undefined) {
        if (key === 'expressionOptions' && storedSettings[key]) {
          // Deep copy expressionOptions
          merged[key] = JSON.parse(JSON.stringify(storedSettings[key]));
        } else {
          merged[key] = storedSettings[key];
        }
      }
    });

    return merged;
  }

  /**
   * Recover settings for all commands
   * @param {Array} newCommands - New commands from import
   * @returns {Array} Commands with recovered settings
   */
  recoverAllSettings(newCommands) {
    return newCommands.map(cmd => this.recoverSettings(cmd));
  }

  /**
   * Clear stored snapshot
   */
  clearSnapshot() {
    this._primaryMap.clear();
    this._secondaryMap.clear();
    this._tertiaryMap.clear();
    this._hasSnapshot = false;
  }

  /**
   * Check if snapshot exists
   * @returns {boolean}
   */
  hasSnapshot() {
    return this._hasSnapshot;
  }
}
