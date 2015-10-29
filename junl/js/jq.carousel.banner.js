;(function($){
	var defaults = {
		items:	3,
		margin:	0
	},
	dom = {
		el:		null,
		$el:	null
	},
	e = {
		
	},
	state = {
		
	},
	num = {
		
	}
	var Slide = function(element,options){
		this.options = $.extend({}, defaults, options);
		this.dom = $.extend({},dom);
		this.e = $.extend({}, e);
		
		this.dom.el = element;
		this.dom.$el = $(element);
		
		this.init();
	}
	
	Slide.prototype.init = function(){
		console.log(this.dom.$el.css('width'))
	}
	
	$.fn.sCarousel = function(options){
		this.each(function(){
			if (!$(this).data('sCarousel')){
				$(this).data('sCarousel',new Slide(this,options))
			}
		})
	}
})(jQuery)
