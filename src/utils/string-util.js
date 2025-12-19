import { format } from 'd3-format';

export class StringUtil {
  static EMPTY = '';
  static INDEX_NOT_FOUND = -1;
  static PAUSABLE_CHARACTER_SET = ".=~{}()!@#%^&*()_+|:<>?\"";

  static remove(input, remove) {
    return StringUtil.replace(input, remove, "");
  }

  static replace(input, replace, replaceWith) {
    return input.split(replace).join(replaceWith);
  }

  static contains(source, val) {
    var result = source.indexOf(val);
    if (result != -1) {
      return true;
    }
    return false;
  }

  static format(d) {
    var floatTickLabel = format(",.2n");
    var IntegerTickLabel = format(",.0d");

    function isInt(n) {
      return Number(n) === n && n % 1 === 0;
    }

    function isFloat(n) {
      return Number(n) === n && n % 1 !== 0;
    }

    if (isInt(d)) {
      return IntegerTickLabel(d);
    }
    return floatTickLabel(d);
  }

  /**
   * characters that can be typed without pause
   * @param ch
   */
  static nonContinuableCharacter(ch) {
    if (ch == '\n' || ch == '\r' || ch == " ") {
      return true;
    }
    return (this.PAUSABLE_CHARACTER_SET.indexOf(ch) >= 0);
  }
}