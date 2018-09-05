var dragset = dragula({
    isContainer: function(el){
        return el.classList.contains('draggable-container');
    },
    accepts: function(el, target, source, sibling){
    // Any logic can go here that decides what element 'el' can be dropped into what target 'target'.
    // Documentation: https://github.com/bevacqua/dragula
    return true;
    }
});