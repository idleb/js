;(function($){
	var defaults = {
		items:			3,			//景深图片数量
		width:			0,			//容器宽
		height:			0,			//容器高
		maxItemWidth:	0,			//前景图片宽
		maxItemHeight:	0,			//前景图片高
		minItemWidth:	0,			//远景图片宽
		minItemHeight:	0,			//远景图片高
		speed:			500,		//过渡速度(毫秒)
		hAlign:			"middle",	//垂直对其方式("top","middle","bottom",0-1浮点数)
		autoPlay:		false,		//自动轮播
		autoPlayDelay:	1000		//自动播放延迟
	},
	dom = {
		$el:		null,
		$items:		null,
		$firstItem:	null,
		$lastItem:	null,
		$ul:		null,
		$nav:		null,
		$navPrev:	null,
		$navNext:	null
	},
	num = {
		items:			0
	},
	state = {
		isFlag:			true
	}
	
	var Owl = function(element,options){
		
		this.options = 		$.extend({}, defaults, options);
		this.dom = 			$.extend({}, dom);
		this.num = 			$.extend({}, num);
		this.state =		$.extend({}, state);
		
		this.dom.$el =		$(element);
		this.dom.$nav = 	this.dom.$el.find(".nav");
		this.dom.$navPrev = this.dom.$el.find(".nav_prev");
		this.dom.$navNext = this.dom.$el.find(".nav_next");
		
		this.dom.$items = this.dom.$el.find("ul li");
		this.num.items = this.dom.$items.length;
		this.dom.$firstItem = this.dom.$items.first();
		this.dom.$lastItem = this.dom.$items.last();
		
		if (this.num.items < this.options.items*2-1)
			this.options.items = Math.ceil(this.num.items/2);
		
		this.init();
	}
	
	Owl.prototype.init = function(){
		
		this.options.width = parseFloat(this.dom.$el.css("width"));
		this.options.height = parseFloat(this.dom.$el.css("height"));
		
		var ratio = parseFloat(this.dom.$firstItem.css("width"))/parseFloat(this.dom.$firstItem.css("height"));
		
		this.options.maxItemWidth = this.options.height*ratio;
		this.options.maxItemHeight = this.options.height;
		
		this.options.minItemHeight = this.options.minItemHeight||this.options.maxItemHeight*0.8;
		this.options.minItemWidth = this.options.minItemHeight*ratio;
		
		this.initNavigation();
		
		this.initItems();
		
		if (this.options.autoPlay){
			setInterval(function(){
				this.rotate("left");
			}.bind(this),this.options.autoPlayDelay);
		}
	}
	
	Owl.prototype.initNavigation = function(){
		this.dom.$nav.css({
			"width":(this.options.width-this.options.maxItemWidth)/2,
			"height":this.options.height,
			"z-index":this.options.items+1
		});
		this.dom.$navPrev.click(function(){
			this.rotate("right");
		}.bind(this));
		this.dom.$navNext.click(function(){
			this.rotate("left");
		}.bind(this));
	}
	
	Owl.prototype.rotate = function(dir){
		if (!this.state.isFlag) return;
		this.state.isFlag = false;
		var zIndexArr = [];
		if (dir === "left"){
			this.dom.$items.each(function(i,e){
				var self = $(e),
					prev = self.prev().get(0)?self.prev():this.dom.$lastItem,
					width = prev.width(),
					height = prev.height(),
					zIndex = prev.css("z-index"),
					opacity = prev.css("opacity"),
					left = prev.css("left"),
					top = prev.css("top");
				zIndexArr.push(zIndex);
				self.animate({
					width:width,
					height:height,
					opacity:opacity,
					left:left,
					top:top
				},this.options.speed,
				function(){
					this.state.isFlag = true;
				}.bind(this));
			}.bind(this));
			this.dom.$items.each(function(i){
				$(this).css("z-index",zIndexArr[i]);
			})
		}else if (dir == "right"){
			this.dom.$items.each(function(i,e){
				var self = $(e),
					next = self.next().get(0)?self.next():this.dom.$firstItem,
					width = next.width(),
					height = next.height(),
					zIndex = next.css("z-index"),
					opacity = next.css("opacity"),
					left = next.css("left"),
					top = next.css("top");
				zIndexArr.push(zIndex);
				self.animate({
					width:width,
					height:height,
					opacity:opacity,
					left:left,
					top:top
				},this.options.speed,
				function(){
					this.state.isFlag = true;
				}.bind(this));
			}.bind(this));
			this.dom.$items.each(function(i){
				$(this).css("z-index",zIndexArr[i]);
			})
		}
	}
	
	Owl.prototype.initItems = function(){
		var leftIndex = this.num.items
		this.dom.$items.each(function(i,e){
			if (i < this.options.items){
				var curWidth = this.options.maxItemWidth-(this.options.maxItemWidth-this.options.minItemWidth)*i/(this.options.items-1),
					curTop = this.resizeTop(curWidth);
				$(e).css({
					"width":curWidth,
					"left":(this.options.width-this.options.maxItemWidth)/2+(this.options.width-this.options.maxItemWidth)*i/(2*(this.options.items-1))+this.options.maxItemWidth-curWidth,
					"top":curTop,
					"opacity":(this.options.items-i)/this.options.items,
					"z-index":this.options.items-i
				});
			}else if(i >= this.num.items-this.options.items+1){
				var curWidth = this.options.minItemWidth+(this.options.maxItemWidth-this.options.minItemWidth)*(i-(this.num.items-this.options.items+1))/(this.options.items-1),
					curTop = this.resizeTop(curWidth);
				$(e).css({
					"width":curWidth,
					"left":(this.options.width-this.options.maxItemWidth)*(i-(this.num.items-this.options.items+1))/(2*(this.options.items-1)),
					"top":curTop,
					"opacity":(i-(this.num.items-this.options.items+1)+1)/this.options.items,
					"z-index":(i-(this.num.items-this.options.items+1)+1)
				});
			}else{
				var curWidth = this.options.minItemWidth-(this.options.maxItemWidth-this.options.minItemWidth)/(this.options.items),
					curTop = this.resizeTop(curWidth);
				$(e).css({
					"width":curWidth,
					"left":(this.options.width-curWidth)/2,
					"top":curTop,
					"opacity":0,
					"z-index":(i-this.options.items)
				});
			}
		}.bind(this));
	}
	
	Owl.prototype.resizeTop = function(curWidth){
		var curTop;
		if (this.options.hAlign === "top"){
			curTop = 0;
		}else if (this.options.hAlign === "middle"){
			curTop = this.options.maxItemHeight*(this.options.maxItemWidth-curWidth)/(this.options.maxItemWidth*2);
		}else if (this.options.hAlign === "bottom"){
			curTop = this.options.maxItemHeight*(this.options.maxItemWidth-curWidth)/(this.options.maxItemWidth);
		}else if (typeof this.options.hAlign == "number"){
			curTop = this.options.hAlign*this.options.maxItemHeight*(this.options.maxItemWidth-curWidth)/(this.options.maxItemWidth);
		}
		return curTop;
	}
	
	$.fn.fCarousel = function(options){
		this.each(function(){
			if (!$(this).data('fCarousel')) {
				$(this).data( 'fCarousel',
				new Owl( this, options ));
			}
		})
	}
})(jQuery);
