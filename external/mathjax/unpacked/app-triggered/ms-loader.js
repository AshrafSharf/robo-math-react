function msload() {
  var VERSION = "2.7.5";
  var MML = MathJax.ElementJax.mml,
    SVG = MathJax.OutputJax.SVG;

  MML.ms.Augment({
    toSVG: function () {
      this.SVGgetStyles();
      var svg = this.SVG();
      this.SVGhandleSpace(svg);
      var values = this.getValues("lquote", "rquote", "mathvariant");
      if (!this.hasValue("lquote") || values.lquote === '"') values.lquote = "\u201C";
      if (!this.hasValue("rquote") || values.rquote === '"') values.rquote = "\u201D";
      if (values.lquote === "\u201C" && values.mathvariant === "monospace") values.lquote = '"';
      if (values.rquote === "\u201D" && values.mathvariant === "monospace") values.rquote = '"';
      var variant = this.SVGgetVariant(), scale = this.SVGgetScale();
      var text = values.lquote + this.data.join("") + values.rquote;  // FIXME:  handle mglyph?
      svg.Add(this.SVGhandleVariant(variant, scale, text));
      svg.Clean();
      this.SVGhandleColor(svg);
      this.SVGsaveData(svg);
      return svg;
    }
  });
}


(function () {
  window.MS_LOADER = msload;
}());
