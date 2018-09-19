var dragset = dragula({
    isContainer: function(el){
        return el.classList.contains('draggable-container');
    },
    accepts: function(el, target, source, sibling){

    	//if(!target.hasChildNodes()){

    		if($(el).attr('id') == 'draggable1'){
    			return target.classList.contains('group1');
    		} else if($(el).attr('id') == 'draggable2'){
    			return target.classList.contains('group2');
    		} else {
    			return false
    		}
    	
    	//}
    // Any logic can go here that decides what element 'el' can be dropped into what target 'target'.
    // Documentation: https://github.com/bevacqua/dragula
    }
});

var scrollable = true;

// This function is triggered when an element 'el' from source 'source' is dragged
dragset.on('drag', function(el, source){

	if($(el).attr('id') == 'draggable1'){
		$('.group1').css("border-color","#19FF79");
    } else if($(el).attr('id') == 'draggable2'){
    	$('.group2').css("border-color","#19FF79");
    } 

    scrollable = false;

});

// This function is triggered when an element 'el' is dropped
dragset.on('dragend', function(el){

	$('.draggable-container').css("border-color","#666");

    scrollable = true;

});


var listener = function(e) {
    if (! scrollable) {
        e.preventDefault();
    }
}

document.addEventListener('touchmove', listener, { passive:false });

