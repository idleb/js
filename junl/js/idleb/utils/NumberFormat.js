(function() {
	window.NumberFormat = {};
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
	NumberFormat.Zero = function(n, l) {
		var s, r;
		for (var i = 0; i < l; i++) {
			s = s + "0";
		}
		s = s + n;
		return s.substr(s.length - l);
	}

})();