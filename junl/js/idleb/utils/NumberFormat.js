(function() {
	window.NumberFormat = {};
	
	/**
	 * 数字转欧美计数格式 (10,000,000)
	 * 
	 * @param {Object} count 数字
	 */
	NumberFormat.US = function(count) {
		var value = "";
		var a = count;
		var arr = [];

		while (a > 0) {
			var b = a % 1000
			if (a / 1000 > 1)
				arr.unshift(this.Zero(b, 3));
			else
				arr.unshift(b);
			a = Math.floor(a / 1000);
		}
		value = arr.toString();
		return value;
	}
	
	/**
	 * 数字省略加中文单位 (10亿,1000万)
	 * 
	 * @param {Object} count 数字
	 */
	NumberFormat.CN = function(count) {
		var value = "";
		if (count)
			if (count.toString().length > 8) {
				value = Math.round(count / 10000000) / 10 + "亿";
			} else if (count.toString().length > 4) {
			value = Math.round(count / 1000) / 10 + "万";
		} else {
			value = count;
		}
		return value;
	}
	
	/**
	 * 数字转字符串并向前补0
	 * 
	 * @param {Number} n 数字
	 * @param {Number} l 字符串长度
	 */
	NumberFormat.Zero = function(n, l) {
		var s, r;
		for (var i = 0; i < l; i++) {
			s = s + "0";
		}
		s = s + n;
		return s.substr(s.length - l);
	}
	
	/**
	 * 时间戳格式化
	 *
	 * @param  {Number}  fdate       时间戳 
	 * @params {String}  formatStr   格式化样式 (y-m-d h:i:s)
	 * @param  {Boolean} hasTimezone 减去时差
	 */
	NumberFormat.Date = function(fdate, formatStr, hasTimezone) {
		var fTime, fStr = 'ymdhis';
		if (!formatStr)
			formatStr = "y-m-d h:i:s";
		if (fdate)
			fTime = new Date(fdate);
		else
			fTime = new Date();
		var timezoneOffset = hasTimezone?fTime.getTimezoneOffset():0;
		var formatArr = [
			fTime.getFullYear().toString(), (fTime.getMonth() + 1).toString(),
			fTime.getDate().toString(),
			fTime.getHours() < 10 ? '0' + (fTime.getHours() + timezoneOffset / 60).toString() : (fTime.getHours() + timezoneOffset / 60).toString(),
			fTime.getMinutes() < 10 ? '0' + fTime.getMinutes().toString() : fTime.getMinutes().toString(),
			fTime.getSeconds() < 10 ? '0' + fTime.getSeconds().toString() : fTime.getSeconds().toString()
		]
		for (var i = 0; i < formatArr.length; i++) {
			formatStr = formatStr.replace(fStr.charAt(i), formatArr[i]);
		}
		return formatStr;
	}

})();