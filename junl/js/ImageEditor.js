;
(function() {

	var e = {
		StartEvent: "",
		MoveEvent: "",
		EndEvent: "",

		_onDragStart: null,
		_onDragMove: null,
		_onDragEnd: null,
		_onPinch: null
	}

	var pos = {
		x: 0,
		y: 0
	}
	var rect = {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	}

	var Editor = function(canvas, panel, debug) {
		var c = document.createElement('div');
		c.id = 'image-editor';
		c.style.position = "absolute";
		c.style.left = 0;
		c.style.top = 0;
		if (canvas[0]) {
			c.style.width = "100%";
			c.style.height = "100%";
			canvas.append(c);
		} else {
			canvas.appendChild(c);
		}

		if (debug) {
			var print = document.createElement('p');
			print.id = 'image-debug';
			print.style.position = "absolute";
			print.style.left = 0;
			print.style.top = 0;
			print.style.zIndex = 10;
			print.innerHTML = "</br>&nbsp; debug:"
			c.appendChild(print);
			this.print = print;
		}

		this.ctrl = null;
		this.panel = panel[0];

		this.offsetX = 0;
		this.offsetY = 0;
		this.scale = 1;
		this.rotation = 0;
		this.c = c;
		this.width = c.offsetWidth;
		this.height = c.offsetHeight;

		this.curScale = this.scale;

		this.image = null;
		this.board = null;
		this.rect = rect;

		this.pos = pos;

		this.e = e;
		
		this.fixed = false;
	};
	Editor.prototype.clear = function() {
		this.c.innerHTML = "";
	}
	Editor.prototype.load = function(path, fixed,loadComplete) {
		var board = document.createElement('div');
		board.id = 'image-board';
		board.style.position = "absolute";
		board.style.left = 0;
		board.style.top = 0;
		board.style.width = "100%";
		board.style.height = "100%";
		this.c.appendChild(board);
		var image = new Image();
		image.src = path;
		
		image.onload = function() {
			var imgWidth = image.width;
			var imgHeight = image.height;
			this.width = this.c.offsetWidth;
			this.height = this.c.offsetHeight;

			image.style.position = "absolute";
			image.style.left = "0";
			image.style.top = "0";
			image.style.right = "0";
			image.style.bottom = "0";
			image.style.margin = "auto";

			this.minScale = this.scale = Math.max(this.width / image.width, this.height / image.height);
			this.offsetX = 0;
			this.offsetY = 0;
			this.rotation = 0;

			this.image = image;
			this.board = board;
			this.update();
			if (this.panel)
				this.ctrl = this.panel;
			else
				this.ctrl = this.board;

			if (!fixed) {
				this.eventsCall();
				this.ctrl.addEventListener(this.e.StartEvent, this.e._onDragStart);
			}
			if (loadComplete)
				loadComplete();
		}.bind(this);
		board.appendChild(image);
		
	}
	Editor.prototype.eventsCall = function() {
		//支持触摸式使用相应的事件替代 
		this.e.StartEvent = isTouchSupport() ? 'touchstart' : 'mousedown';
		this.e.MoveEvent = isTouchSupport() ? 'touchmove' : 'mousemove';
		this.e.EndEvent = isTouchSupport() ? 'touchend' : 'mouseup';

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
		this.e._onPinch = function(e) {
			this.onPinch(e);
		}.bind(this);

		//hammer 
		var mc = new Hammer.Manager(this.ctrl);
		//监听
		mc.add(new Hammer.Pan({
			threshold: 0,
			pointers: 0
		}));
		mc.add(new Hammer.Rotate({
			threshold: 0
		})).recognizeWith(mc.get('pan'));
		mc.add(new Hammer.Pinch({
			threshold: 0
		})).recognizeWith([mc.get('pan'), mc.get('rotate')]);
		//mc.on("rotatestart rotatemove", onRotate);
		mc.on("pinchstart pinchmove", this.e._onPinch);
		//hammer 监听旋转
		function onRotate(ev) {
			if (ev.type == 'rotatestart') {

			}
		}
	}
	Editor.prototype.onPinch = function(ev) {

		if (ev.type == 'pinchstart') {
			this.curScale = this.scale;
		} else if (ev.type == 'pinchmove') {
			this.scale = this.curScale * ev.scale;

			if (this.scale < this.minScale) {
				this.scale = this.minScale;
				this.update();
				return
			}
			if (this.scale > 5 * this.minScale) {
				this.scale = 5 * this.minScale;
				this.update();
				return
			}
			this.boundValid();
			this.update();
		} else if (ev.type == 'pinchend') {
			this.update();
		}
	};
	Editor.prototype.onDragStart = function(e) {
		if (this.fixed){
			this.ctrl.style.pointerEvents = "none";
			return;
		} else {
			this.ctrl.style.pointerEvents = "auto";
		}
		
		e.preventDefault();
		
		if (isTouchSupport() && e.touches.length > 1) {
			return;
		}
		var event = isTouchSupport() ? e.touches.item(0) : e;

		this.pos = {
			x: event.clientX,
			y: event.clientY
		};

		this.ctrl.addEventListener(this.e.MoveEvent, this.e._onDragMove);
		this.ctrl.addEventListener(this.e.EndEvent, this.e._onDragEnd);
	}
	Editor.prototype.onDragMove = function(e) {
		var event = isTouchSupport() ? e.touches.item(0) : e;
		this.offsetX += (event.clientX - this.pos.x);
		this.offsetY += (event.clientY - this.pos.y);
		this.boundValid();
		this.update();
		this.pos = {
			x: event.clientX,
			y: event.clientY
		};
	}
	Editor.prototype.onDragEnd = function(e) {
		this.ctrl.removeEventListener(this.e.MoveEvent, this.e._onDragMove);
		this.ctrl.removeEventListener(this.e.EndEvent, this.e._onDragEnd);
	}
	Editor.prototype.update = function() {
		if (this.print)
			this.print.innerHTML = "</br>&nbsp;&nbsp;&nbsp;" + this.scale;
		this.updateRect();
		this.image.style.webkitTransformOrigin = "center";
		//this.image.style.webkitTransform = "scale("+this.scale+")"+"rotate3d(0,0,0,"+this.rotation+")"+"translate("+this.offsetX+"px,"+this.offsetY+"px)";

		$(this.image).css({
			translate: [this.offsetX, this.offsetY]
		}); // 向右下移动 
		$(this.image).css({
			rotate3d: '0,0,0,' + this.rotation
		}); // 顺时针旋转 
		$(this.image).css({
			scale: this.scale
		});
	}
	Editor.prototype.boundValid = function() {
		if (this.offsetX > this.rect.x) this.offsetX = this.rect.x;
		if (this.offsetY > this.rect.y) this.offsetY = this.rect.y;
		if (this.offsetX < this.rect.x - this.rect.width + this.width) this.offsetX = this.rect.x - this.rect.width + this.width;
		if (this.offsetY < this.rect.y - this.rect.height + this.height) this.offsetY = this.rect.y - this.rect.height + this.height;
	}
	Editor.prototype.updateRect = function() {
		this.rect.x = (this.image.width * this.scale - this.width) / 2;
		this.rect.y = (this.image.height * this.scale - this.height) / 2;
		this.rect.width = this.image.width * this.scale;
		this.rect.height = this.image.height * this.scale;
	}

	//检测是否支持触屏
	function isTouchSupport() {
		return 'createTouch' in document;
	}

	window.Editor = Editor;
})();