$(document).ready(function(){
	$("#container").jPage({
		axis:'y',
		prevDiv:$('.pre'),
		nextDiv:$('.next'),
		callbacks:function(d){
			
		}
	});
})

function crossPoint(p1,p2,c){
		var x1 = p1.x;
		var y1 = p1.y;
		var x2 = p2.x;
		var y2 = p2.y;
		var cx = c.x;
		var cy = c.y;
		var cr = c.r;
		
		var A = Math.atan2(y2 - y1, x2 - x1);//射线的斜角
		var B = Math.atan2(cy - y1, cx - x1);//射线上的点到圆心的直线的斜角
		var d = Math.sin(A - B)*Math.sqrt((cy - y1)*(cy - y1) + (cx - x1)*(cx - x1));//圆心到射线的距离
		
		//交点1
		var ox1 = Math.sin(A) * d - Math.cos(A) * Math.sqrt(cr * cr - d * d);
		var oy1 = Math.cos(A) * d - Math.sin(A) * Math.sqrt(cr * cr - d * d);
		//交点2
		var ox2 = Math.sin(A) * d + Math.cos(A) * Math.sqrt(cr * cr - d * d);
		var oy2 = Math.cos(A) * d + Math.sin(A) * Math.sqrt(cr * cr - d * d);
		
	}