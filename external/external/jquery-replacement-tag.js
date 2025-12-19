(function (a) {
  a.fn.replaceTagName = function (f) {
    var g = [],
      h = this.length;
    while (h--) {
      var k = document.createElement(f),
        b = this[h],
        d = b.attributes;
      for (var c = d.length - 1; c >= 0; c--) {
        var j = d[c];
        k.setAttribute(j.name, j.value)
      }
      k.innerHTML = b.innerHTML;
      a(b).after(k).remove();
      g[h - 1] = k
    }
    return a(g)
  }
})(window.jQuery);
