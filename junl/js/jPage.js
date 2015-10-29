/**
 * @name jPage
 * @author JunL
 * @date 2014.12.3
 */

/*
 * html 三层结构
 * 	<div>							//el
		<div class="">				//content
			<div class="page1">		//item
			</div>
			<div class="page2">		//item
			</div>
			<div class="page3">		//item
			</div>
		</div>
	</div>
 */
(function($, window, document, undefined) {
	var defaults = {
		items:				3,
		minValue: 			15,
		maxValue: 			50,
		
		axis:				'x', //滑动方向, x 横向, y 纵向
		
		prevDiv:			null,//向前翻页控制div
		nextDiv:			null,//向后翻页控制div
		tagsDiv:			null,//页号标签div

		baseClass: 			'paper-container',
		contentClass: 		'paper-content',
		itemClass: 			'paper-page',
		navClass:			['paper-prev','paper-next'],
		tagClass: 			'paper-tag',
		tagsClass:			'paper-tags',

		callbacks: 			null
	};
	
	var page = {
		curPage: 			0,
		contentSize: 		0,
		itemSize: 			0
	}

	// States
	var state = {
		touchable: 			true,
		isTouch: 			false,
		isScrolling: 		false
	};

	var dom = {
		el: 				null, // main element 
		$el: 				null, // jQuery main element 
		$content: 			null,
		$prev:				null,
		$next:				null
	};

	var e = {
		StartEvent: 		'', //支持触摸式使用相应的事件替代 
		MoveEvent: 			'',
		EndEvent: 			'',

		_onDragStart: 		null,
		_onDragMove: 		null,
		_onDragEnd: 		null,
		_transitionEnd: 	null,
		_prevHandler: 		null,
		_nextHandler: 		null
	};

	function jPage(element, options) {
		element.jPage = {
			'name': 'jPage',
			'author': 'junl'
		};

		// Attach variables to object
		// Only for development process

		this.options = 	$.extend({}, defaults, options);
		this.page = 	$.extend({}, page);
		this.state = 	$.extend({}, state);
		this.dom = 		$.extend({}, dom);
		this.e = 		$.extend({}, e);

		this.dom.el = 		element;
		this.dom.$el = 		$(element);
		this.dom.$content = this.dom.$el.children();

		this.init();
	};

	jPage.prototype.init = function() {

		//支持触摸式使用相应的事件替代 
		this.e.StartEvent 	= isTouchSupport() ? 'touchstart' : 'mousedown';
		this.e.MoveEvent 	= isTouchSupport() ? 'touchmove' : 'mousemove';
		this.e.EndEvent 	= isTouchSupport() ? 'touchend' : 'mouseup';

		//Add base class
		if (!this.dom.$el.hasClass(this.options.baseClass)) {
			this.dom.$el.addClass(this.options.baseClass);
		}
		//Add content class
		if (!this.dom.$content.hasClass(this.options.contentClass)) {
			this.dom.$content.addClass(this.options.contentClass);
		}
		//Add item class
		if (!this.dom.$content.children().hasClass(this.options.itemClass)) {
			this.dom.$content.children().addClass(this.options.itemClass);
		}
		
		this.options.items = this.dom.$content.children().length;
		
		this.browserSupport();
		
		this.eventsCall();

		this.createTheme();
		
		this.bunleNav();
		
		this.positionInit();

		this.dom.$el.on(this.e.StartEvent, this.e._onDragStart);

	};

	/**
 	* 滑动类型
	* @method createTheme
 	* @for jPage
 	*/
	jPage.prototype.createTheme = function() {
		this.dom.$el.css({
			'width': 	'100%',
			'overflow': 'hidden'
		})
		if(this.options.axis == 'x'){
			this.dom.$content.css({
				'width': this.options.items + '00%',
				'height': this.dom.$el.css('height')
			})
			$('.'+this.options.itemClass).css({
				'width': 100/this.options.items + '%',
				'height': this.dom.$el.css('height')
			})
			this.page.itemSize = parseInt(this.dom.$el.css('width'));
			this.page.contentSize = parseInt(this.dom.$content.css('width'));
		}else if(this.options.axis == 'y'){
			this.dom.$content.css({
				'width': '100%',
				'height': parseFloat(this.dom.$el.css('height')) * this.options.items
			})
			$('.'+this.options.itemClass).css({
				'width': '100%',
				'height': this.dom.$el.css('height')
			})
			this.page.itemSize = parseInt(this.dom.$el.css('height'));
			this.page.contentSize = parseInt(this.dom.$content.css('height'));
		}
		
		
	}
	
	//为 Nav 绑定事件
	jPage.prototype.bunleNav = function() {
		if(this.options.prevDiv){
			this.dom.$prev = this.options.prevDiv;
			if (!this.dom.$prev.hasClass(this.options.navClass[0])) {
				this.dom.$prev.addClass(this.options.navClass[0]);
			}
			this.dom.$prev.on('click',this.e._prevHandler);
		}
		if(this.options.nextDiv){
			this.dom.$next = this.options.nextDiv;
			if (!this.dom.$next.hasClass(this.options.navClass[1])) {
				this.dom.$next.addClass(this.options.navClass[1]);
			}
			this.dom.$next.on('click',this.e._nextHandler);
		}
	}
	
	/**
 	* 位置初始化
	* @method positionInit
 	* @for jPage
 	*/
	jPage.prototype.positionInit = function(){
		if(!this.startPos)this.startPos = 0;
		if(!this.movePos)this.movePos = 0;
		if(!this.curPos)this.curPos = 0;
		this.dragDis = 0;
	}
	
	/**
 	* 点击(触摸)位置
	* @method calculateTouchPos
 	* @for jPage
 	* @param {event} ev 点击(触摸)事件
 	*/
	jPage.prototype.calculateTouchPos = function(ev) {
		var tempPos;

		if (this.e.istouch) {
			if (ev.originalEvent.touches.length == 1){
				tempPos = { 'x' : ev.originalEvent.touches[0].pageX, 'y' : ev.originalEvent.touches[0].pageY };
			}
		} else {
			tempPos = { 'x' : ev.screenX, 'y' : ev.screenY };
		}
		
		return tempPos;
	}

	/**
 	* 保存事件方法对象,并绑定this对象
	* @method eventsCall
 	* @for jPage
 	*/
	jPage.prototype.eventsCall = function() {
		// Save events references 
		this.e._onDragStart = function(e) {
			this.onDragStart(e);
		}.bind(this);
		this.e._onDragMove = function(e) {
			this.onDragMove(e);
		}.bind(this);
		this.e._onDragEnd = function(e) {
			this.onDragEnd(e);
		}.bind(this);
		this.e._transitionEnd = function(e) {
			this.transitionEnd(e);
		}.bind(this);
		this.e._prevHandler = function(e) {
			this.prevHandler(e);
		}.bind(this);
		this.e._nextHandler = function(e) {
			this.nextHandler(e);
		}.bind(this);
	}

	jPage.prototype.transitionEnd = function(event) {
		if (typeof this.options.callbacks === 'function') {
			this.state.isScrolling = false;
			this.options.callbacks.call(this, this.state);
		}
	}

	jPage.prototype.onDragStart = function(event) {
		if (this.state.touchable) {
			event.preventDefault();
			
			this.dragDis = 0;
			
			this.startPos = this.movePos = this.calculateTouchPos(event)[this.options.axis];
			this.dom.$el.on(this.e.MoveEvent, this.e._onDragMove);
			this.dom.$el.on(this.e.EndEvent, this.e._onDragEnd);


			if (typeof this.options.callbacks === 'function') {
				this.state.isTouch = true;
				this.options.callbacks.call(this, this.state);
			}
		}
	}

	jPage.prototype.onDragEnd = function(event) {
		if (this.state.touchable) {
			event.preventDefault();

			this.startPos = this.movePos = 0;
			if (this.dragDis < -this.options.maxValue) {
				this.curPos -= this.page.itemSize;
			} else if (this.dragDis > this.options.maxValue) {
				this.curPos += this.page.itemSize;
			}
			
			this.page.curPage = -parseInt(this.curPos / this.page.itemSize);
			
			this.dom.$content.css(this.vendorName + 'transition', '0.3s');
			if(this.options.axis == 'x')this.dom.$content.css(this.vendorName + 'transform', 'translate3d(' + (this.curPos) + 'px, 0px, 0px)');
			else if(this.options.axis == 'y')this.dom.$content.css(this.vendorName + 'transform', 'translate3d(0px, ' + (this.curPos) + 'px, 0px)');

			this.dom.$el.off(this.e.MoveEvent, this.e._onDragMove);
			this.dom.$el.off(this.e.EndEvent, this.e._onDragEnd);

			this.dom.$el.on(this.transitionEndVendor , this.e._transitionEnd);

			if (typeof this.options.callbacks === 'function') {
				this.state.isTouch = false;
				this.state.isScrolling = false;
				this.options.callbacks.call(this, this.state);
			}
		}
	}

	jPage.prototype.onDragMove = function(event) {
		event.preventDefault();
		this.movePos = this.calculateTouchPos(event)[this.options.axis];
		
		this.dragDis = this.movePos - this.startPos;

		if ((this.dragDis > 0 && this.curPos == 0) || (this.dragDis < 0 && this.curPos <= -this.page.contentSize + this.page.itemSize)) return this.dragDis = 0;

		if (this.dragDis < -this.options.minValue) {
			this.sum = this.curPos + this.dragDis + this.options.minValue;
		} else if (this.dragDis > this.options.minValue) {
			this.sum = this.curPos + this.dragDis - this.options.minValue;
		} else {
			return
		}

		this.dom.$content.css(this.vendorName + 'transition', '0s');
		if(this.options.axis == 'x')this.dom.$content.css(this.vendorName + 'transform', 'translate3d(' + (this.sum) + 'px, 0px, 0px)');
		else if(this.options.axis == 'y')this.dom.$content.css(this.vendorName + 'transform', 'translate3d(0px, ' + (this.sum) + 'px, 0px)');

		if (typeof this.options.callbacks === 'function') {
			this.state.isScrolling = true;
			this.options.callbacks.call(this, this.state);
		}
		
	}
	
	/**
 	* 禁止页面拖动
	* @method pauseDrag
 	* @for jPage
 	*/
	jPage.prototype.pauseDrag = function() {
		this.dom.$el.off(this.e.StartEvent, this.e._onDragStart);
		this.state.touchable = false;
	}
	
	/**
 	* 启用页面拖动
	* @method startDrag
 	* @for jPage
 	*/
	jPage.prototype.startDrag = function() {
		if (!this.state.touchable)
			this.dom.$el.on(this.e.StartEvent, this.e._onDragStart);
		this.state.touchable = true;
	}
	
	/**
 	* 首页
	* @method home
 	* @for jPage
 	*/
	jPage.prototype.home = function() {
		this.curPos = 0;
		this.dom.$content.css(this.vendorName + 'transition', '0s');
		this.dom.$content.css(this.vendorName + 'transform', 'translate3d(0px, 0px, 0px)');
	}

	/**
 	* 页面跳转
	* @method goto
 	* @for jPage
 	* @param {int} i 页号,首页引索0
 	*/
	jPage.prototype.goto = function(i) {
		this.page.curPage = i;
		this.curPos =  -i * this.page.itemSize;
		this.dom.$content.css(this.vendorName + 'transition', '0.3s');
		if(this.options.axis == 'x')this.dom.$content.css(this.vendorName + 'transform', 'translate3d(' + (-i * this.page.itemSize) + 'px, 0px, 0px)');
		if(this.options.axis == 'y')this.dom.$content.css(this.vendorName + 'transform', 'translate3d(0px, ' + (-i * this.page.itemSize) + 'px, 0px)');
		
		this.dom.$el.on(this.transitionEndVendor , this.e._transitionEnd);
	}
	
	/**
 	* 页面跳转,上一页
	* @method prevHandler
 	* @for jPage
 	*/
	jPage.prototype.prevHandler = function(event) {
		if(this.page.curPage != 0)
		this.goto(this.page.curPage - 1);
	}
	
	/**
 	* 页面跳转,下一页
	* @method nextHandler
 	* @for jPage
 	*/
	jPage.prototype.nextHandler = function(event) {
		if(this.page.curPage != this.options.items-1)
		this.goto(this.page.curPage + 1);
	}
	
	/**
 	* 当前浏览器
	* @method browserSupport
 	* @for jPage
 	*/
	jPage.prototype.browserSupport = function(){
		this.support3d = isPerspective();

		if(this.support3d){
			this.transformVendor = isTransform();

			// transitionend 事件名
			var endVendors = ['transitionend','webkitTransitionEnd','transitionend','oTransitionEnd'];
			this.transitionEndVendor = endVendors[isTransition()];

			// 浏览器内核前缀
			this.vendorName = this.transformVendor.replace(/Transform/i,'');
			this.vendorName = this.vendorName !== '' ? '-'+this.vendorName.toLowerCase()+'-' : '';
			
		}

		
	};
	
	// 私有方法

	// CSS 支持检测;
	function isStyleSupported(array){
		var p,s,fake = document.createElement('div'),list = array;
		for(p in list){
			s = list[p]; 
			if(typeof fake.style[s] !== 'undefined'){
				fake = null;
				return [s,p];
			}
		}
		return [false];
	}

	function isTransition() {
		return isStyleSupported(['transition', 'WebkitTransition', 'MozTransition', 'OTransition'])[1];
	}

	function isTransform() {
		return isStyleSupported(['', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform'])[0];
	}
	
	//通过 perspective 属性,检测是否支持3D
	function isPerspective() {
		return isStyleSupported(['perspective', 'webkitPerspective', 'MozPerspective', 'OPerspective', 'MsPerspective'])[0];
	}
	
	//检测是否支持触屏
	function isTouchSupport() {
		return 'createTouch' in document;
	}
	
	//检测是否是视网膜屏
	function isRetina() {
		return window.devicePixelRatio > 1;
	}

	$.fn.jPage = function(options) {
		return this.each(function() {
			if (!$(this).data('jPage')) {
				$(this).data('jPage',
					new jPage(this, options));
			}
		});

	};
})(window.Zepto || window.jQuery, window, document);