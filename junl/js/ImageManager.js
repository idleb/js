/**
 * 图片资源管理器
 */
if (typeof Object.create !== "function") {
    Object.create = function (obj) {
        function F() {}
        F.prototype = obj;
        return new F();
    };
}
(function() {
var ImageManager={
        /**
         * @private
         */
        __loadList : {},
        /**
         * @private
         */
        __loadImage : function(item, callback) {
            var image = new Image();
            image.onload = function() {
                this.__loadList[item.id] = image;
                callback();
            }.bind(this)
            image.src = item.src;
        },
        /**
         * 加载图片资源
         * @param {Array} images @format {id: '', src: ''}
         * @param {Function} statechange
         */
        load : function(images, __index) {
            __index = __index || 0;
            if(images[__index]) {
                this.__loadImage(images[__index], function() {
                    this.load(images,  __index + 1);
                }.bind(this));
            }
            else{
            	this.trigger('complete',{images:images});
            };
        },
        /**
         * 获取已加载的Image对象
         * @param {String} id
         */
        get : function(id) {
            return this.__loadList[id];
        },
        obj : {},
        addEventListener : function(key,eventfn){
        	var stack,_ref;
        	stack = (_ref = this.obj[key]) != null ? ref : this.obj[key] = [];
        	return stack.push(eventfn);
        },
        removeEventListener : function( key ) {
 
             var _ref;
 
             return ( _ref = this.obj[key] ) != null ? _ref.length = 0 : void 0;
 
        },
        trigger : function(){
        	var fn,stack,_i,_len,_ref,key;
        	key = Array.prototype.shift.call(arguments);
        	stack = (_ref = this.obj[key]) != null ? _ref : this.obj[key] = [];
        	for (_i = 0,_len = stack.length; _i < _len; _i++){
        		fn = stack[_i];
        		if (fn.apply(this, arguments) === false){
        			return false;
        		}
        	}
        	return ;
        }
    }
    window.AssetManager = function(){
    	return Object.create(ImageManager)
    }
    
})();
