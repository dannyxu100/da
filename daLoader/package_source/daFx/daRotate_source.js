/**daRotate
*鼠标滚轮事件处理类
* @author danny.xu
* @version daRotate_1.0 2011-8-14 9:10:25
*/

(function( win, undefined ){
var doc = win.document;


/**给daFx类静态成员step()函数添加whirl特殊属性处理函数
*/
daFx.step.whirl = function( daFxObj ) {
	da.out("whirl");
	
};

var daRotate = (function(){
	
	/**daRotate类构造函数
	*/
	var daRotate = function( rSetting ){
		return new daRotate.fnStruct.init( rSetting );
	};

	daRotate.fnStruct = daRotate.prototype = {
		version: "daRotate v1.0 \n author: danny.xu \n date: 2011-8-14 9:10:54",
		
		daObj: null,
		
		rSetting: {
			target: null,
			angle: 0
		},
		
		init: function( rSetting ){
			rSetting = this.rSetting = da.extend( {}, this.rSetting, rSetting );
			
			this.daObj = da( rSetting.target );
			if( 0 >= this.daObj.dom.length ){ alert("daRotate温馨提示：没有找到您需要旋转的对象。"); return false; }
		
			this.rotate( rSetting.angle );	
			
		},
		
		rotate: function( angle,whence ){
			var rObj = this.daObj.dom[0];
		
			// we store the angle inside the image tag for persistence
			if ( !whence ) {
				rObj.angle = (( rObj.angle==undefined ? 0 : rObj.angle ) + angle) % 360;
			} 
			else {
				rObj.angle = angle;
			}
		
			if (rObj.angle >= 0) {
				var rotation = Math.PI * rObj.angle / 180;
			} 
			else {
				var rotation = Math.PI * (360+rObj.angle) / 180;
			}
			var costheta = Math.cos(rotation);
			var sintheta = Math.sin(rotation);
		
			if ( da.browser.ie ) {
				var canvas = document.createElement('img');
		
				canvas.src = rObj.src;
				canvas.height = rObj.height;
				canvas.width = rObj.width;
				canvas.style.cssText = rObj.style.cssText;
		
				canvas.style.filter = "progid:DXImageTransform.Microsoft.Matrix(M11="+costheta+",M12="+(-sintheta)+",M21="+sintheta+",M22="+costheta+",SizingMethod='auto expand')";
			} 
			else {
				var canvas = document.createElement('canvas');
				if ( !rObj.oImage ) {
					canvas.oImage = new Image();
					canvas.oImage.src = rObj.src;
				} 
				else {
					canvas.oImage = rObj.oImage;
				}
		
				canvas.style.cssText = rObj.style.cssText;
				canvas.style.width = canvas.width = Math.abs(costheta*canvas.oImage.width) + Math.abs(sintheta*canvas.oImage.height);
				canvas.style.height = canvas.height = Math.abs(costheta*canvas.oImage.height) + Math.abs(sintheta*canvas.oImage.width);
		
				var context = canvas.getContext('2d');
				context.save();
				if (rotation <= Math.PI/2) {
					context.translate(sintheta*canvas.oImage.height,0);
				} 
				else if (rotation <= Math.PI) {
					context.translate(canvas.width,-costheta*canvas.oImage.height);
				} 
				else if (rotation <= 1.5*Math.PI) {
					context.translate(-costheta*canvas.oImage.width,canvas.height);
				} 
				else {
					context.translate(0,-sintheta*canvas.oImage.width);
				}
				context.rotate(rotation);
				context.drawImage(canvas.oImage, 0, 0, canvas.oImage.width, canvas.oImage.height);
				context.restore();
			}
			canvas.id = rObj.id;
			canvas.angle = rObj.angle;

			rObj.parentNode.replaceChild(canvas, rObj);
		
		}
		
	};

	daRotate.fnStruct.init.prototype = daRotate.prototype;			//模块通过原型实现继承属性

	//TODO: 静态成员
	
	
	
	return daRotate;
})();




win.daRotate = daRotate;

})(window);