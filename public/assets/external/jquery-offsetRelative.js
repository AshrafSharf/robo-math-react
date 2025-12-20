(function($){
  $.fn.offsetRelative = function(top){
    var $this = $(this);
    var $parent = $this.offsetParent();
    var offset = $this.position();
    if(!top) return offset; // Didn't pass a 'top' element
    else if($parent.get(0).tagName == "BODY") return offset; // Reached top of document
    else if($(top,$parent).length) return offset; // Parent element contains the 'top' element we want the offset to be relative to
    else if($parent[0] == $(top)[0]) return offset; // Reached the 'top' element we want the offset to be relative to
    else { // Get parent's relative offset
      var parent_offset = $parent.offsetRelative(top);
      offset.top += parent_offset.top;
      offset.left += parent_offset.left;
      return offset;
    }
  };
  $.fn.positionRelative = function(top){
    return $(this).offsetRelative(top);
  };
}(window.jQuery));
