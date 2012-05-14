/************* 扩展队列处理函数 ******************/
da.extend({
	/**队列长度标记+1
	* @param {Element} elem 队列目标元素 
	* @param {String} type 队列分类
	*/
	_mark: function( elem, type ) {
		if ( elem ) {
			type = (type || "fx") + "mark";
			da.data( elem, type, (da.data(elem,type,undefined,true) || 0) + 1, true );
		}
	},

	/**队列子项移除，队列长度标记-1
	* @param {Boolean} force 是否清空元素所有队列标记
	* @param {Element} elem 队列目标元素 
	* @param {String} type 队列分类
	*/
	_unmark: function( force, elem, type ) {
		if ( force !== true ) {
			type = elem;
			elem = force;
			force = false;
		}
		if ( elem ) {
			type = type || "fx";
			var key = type + "mark",
				count = force ? 0 : ( (da.data( elem, key, undefined, true) || 1 ) - 1 );
			if ( count ) {
				da.data( elem, key, count, true );
			} 
			else {
				da.undata( elem, key, true );
				handleQueueMarkDefer( elem, type, "mark" );
			}
		}
	},

	/**压入、获取队列缓存区操作
	* @param {Element} elem 队列目标元素 
	* @param {String} type 队列分类
	* @param {Object} data 队列数据对象参数
	*/
	queue: function( elem, type, data ) {
		if ( elem ) {
			type = (type || "fx") + "queue";
			var q = da.data( elem, type, undefined, true );
			// Speed up dequeue by getting out quickly if this is just a lookup
			if ( data ) {
				if ( !q || da.isArray(data) ) {
					q = da.data( elem, type, da.pushArray(data), true );
				} 
				else {
					q.push( data );
				}
			}
			return q || [];
		}
	},

	/**弹出队列操作
	* @param {Element} elem 队列目标元素 
	* @param {String} type 队列分类
	*/
	dequeue: function( elem, type ) {
		type = type || "fx";

		var queue = da.queue( elem, type ),
				fn = queue.shift(),																		//取出队列的第一个缓存
				defer;

		// If the fx queue is dequeued, always remove the progress sentinel
		if ( fn === "inprogress" ) {															//判断是否是"inprogress"标记
			fn = queue.shift(); 																		//取下一个缓存
		}

		if ( fn ) {
			// Add a progress sentinel to prevent the fx queue from being
			// automatically dequeued
			if ( type === "fx" ) {																	//如果是元素动画队列，继续复原首项"inprogress"标记
				queue.unshift("inprogress");
			}

			fn.call(elem, function() {															//执行元素动画自定义函数
				da.dequeue(elem, type);
			});
		}

		if ( !queue.length ) {																		//如果队列长度为0，清除队列缓存区
			da.undata( elem, type + "queue", true );
			handleQueueMarkDefer( elem, type, "queue" );
		}
	}
});

da.fnStruct.extend({
	
	/**压入、获取当前元素队列缓存区操作
	* @param {String} type 队列分类
	* @param {Object} data 队列数据对象参数
	*/
	queue: function( type, data ) {
		if ( "string" !== typeof type ) {													//判断type参数是否是String类型，可能是动画处理函数
			data = type;
			type = "fx";
		}

		if ( undefined === data ) {																//get操作
			return da.queue( this.dom[0], type );
		}
		return this.each(function() {
			var queue = da.queue( this, type, data );

			if ( "fx" === type && "inprogress" !== queue[0] ) {			//动画处理队列，并且不是"inprogress"标记
				da.dequeue( this, type );
			}
		});
	},

	/**弹出当前元素队列操作
	* @param {String} type 队列类型
	*/
	dequeue: function( type ) {
		return this.each(function() {
			da.dequeue( this, type );
		});
	},
	
	/**当前元素队列插入延时操作
	* @param {String|Int} time 延时时长
	* @param {String} type 队列分类
	*/
	delay: function( time, type ) {
		time = daFx ? daFx.speeds[time] || time : time;
		type = type || "fx";

		return this.queue( type, function() {
			var elem = this;
			setTimeout(function() {
				da.dequeue( elem, type );
			}, time );
		});
	},
	
	/**清空当前元素队列
	* @param {String} type 队列分类
	*/
	clearQueue: function( type ) {
		return this.queue( type || "fx", [] );
	},
	
	// Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise: function( type, object ) {
		if ( typeof type !== "string" ) {
			object = type;
			type = undefined;
		}
		type = type || "fx";
		var defer = jQuery.Deferred(),
			elements = this,
			i = elements.length,
			count = 1,
			deferDataKey = type + "defer",
			queueDataKey = type + "queue",
			markDataKey = type + "mark";
		function resolve() {
			if ( !( --count ) ) {
				defer.resolveWith( elements, [ elements ] );
			}
		}
		while( i-- ) {
			if (( tmp = da.data( elements[ i ], deferDataKey, undefined, true ) ||
					( da.data( elements[ i ], queueDataKey, undefined, true ) ||
						da.data( elements[ i ], markDataKey, undefined, true ) ) &&
					da.data( elements[ i ], deferDataKey, jQuery._Deferred(), true ) )) {
				count++;
				tmp.done( resolve );
			}
		}
		resolve();
		return defer.promise();
	}
});

function handleQueueMarkDefer( elem, type, src ) {
var deferDataKey = type + "defer",
		queueDataKey = type + "queue",
		markDataKey = type + "mark",
		defer = da.data( elem, deferDataKey, undefined, true );
		
	if ( defer &&
		( src === "queue" || !da.data( elem, queueDataKey, undefined, true ) ) &&
		( src === "mark" || !da.data( elem, markDataKey, undefined, true ) ) ) {
		// Give room for hard-coded callbacks to fire first
		// and eventually mark/queue something else on the element
		setTimeout( function() {
			if ( !da.data( elem, queueDataKey, undefined, true ) &&
				!da.data( elem, markDataKey, undefined, true ) ) {
				da.undata( elem, deferDataKey, true );
				defer.resolve();
			}
		}, 0 );
	}
}


/**daFx
*JS动画机制核心类
* @author danny.xu
* @version daFx_1.0 2011-9-15 10:33:34
*/
(function( win, undefined ){
var doc = win.document;

var daFx = (function(){
	
	/**daFx类构造函数
	*/
	var daFx = function( elem, options, prop ){
		return new daFx.fnStruct.init( elem, options, prop );
	};

	daFx.fnStruct = daFx.prototype = {
		version: "daFx v1.0 \n author: danny.xu \n date: 2011-9-15 10:34:25",
		
		options: null,												//动画设置参数包括speed, callback等属性
		elem: null,														//被操作对象
		prop: null,														//elem待变化的属性, 比如left, top
		orig: null,														//orig为{}， 用来保存属性的原始值
		
		init: function( elem, options, prop ){
			this.options = options;
			this.elem = elem;			
			this.prop = prop;

			options.orig = options.orig || {};								
			
			return this;
		},
		
		/**设置被操作元素style属性值（逐帧绘制元素）
		*/
		update: function() {
			if ( this.options.step ) {																	//options参数有step 属性, 并且值是一个函数的话,在每一帧动画结束后, 都会执行这个callback函数
				this.options.step.call( this.elem, this.now, this );
			}
	
			(this.options.update || daFx.step[this.prop] || daFx.step._default)( this );				//调用daFx.step绘制元素
		},
	
		/**获取元素当前属性尺寸
		*/
		cur: function() {
			if ( this.elem[this.prop] != null && (!this.elem.style || this.elem.style[this.prop] == null) ) {
				return this.elem[ this.prop ];
			}
	
			var parsed,
					r = da.css( this.elem, this.prop );
			
			return isNaN( parsed = parseFloat( r ) ) ? !r || r === "auto" ? 0 : r : parsed;											//若属性值为""、null、undefined、"auto"均转为0；若属性值为"rotate(1rad)"组合方式均不作改变
		},
	
		/**启动动画，创建定时器
		*/
		custom: function( from, to, unit ) {
			var self = this,
					fx = daFx,
					raf;
	
			this.startTime = fxNow || createFxNow();
			this.start = from;
			this.end = to;
			this.unit = unit || this.unit || ( da.cssNumber[ this.prop ] ? "" : "px" );
			this.now = this.start;
			this.pos = this.state = 0;
	
			function t( gotoEnd ) {																																//一个包裹动画具体执行函数的闭包, 之所以要用闭包包裹起来,  是因为执行动画的动作并不一定是发生在当前.
				return self.step( gotoEnd );
			}
	
			t.elem = this.elem;																																		//保存一个元素的引用。删除和判断is:acted的时候用到,把timer和元素联系起来  
	
			if ( t() && daFx.timers.push(t) && !timerId ) {
				if ( requestAnimationFrame ) {																											//通过requestAnimationFrame替代setInterval，使动画更流畅有效
					timerId = 1;
					raf = function() {
						if ( timerId ) {																																//当timerId为null时，立即停止动画
							requestAnimationFrame( raf );
							fx.tick();
						}
					};
					requestAnimationFrame( raf );
				} 
				else {
					timerId = setInterval( fx.tick, fx.interval );
					
				}
			}
			
		},
	
		// Simple 'show' function
		show: function() {
			// Remember where we started, so that we can go back to it later
			this.options.orig[this.prop] = da.style( this.elem, this.prop );
			this.options.show = true;
	
			// Begin the animation
			// Make sure that we start at a small width/height to avoid any
			// flash of content
			this.custom(this.prop === "width" || this.prop === "height" ? 1 : 0, this.cur());
	
			// Start by showing the element
			da( this.elem ).show();
		},
	
		// Simple 'hide' function
		hide: function() {
			// Remember where we started, so that we can go back to it later
			this.options.orig[this.prop] = da.style( this.elem, this.prop );
			this.options.hide = true;
	
			// Begin the animation
			this.custom(this.cur(), 0);
		},
	
		/**动画帧操作
		* @param {Boolean} gotoEnd 当gotoEnd为true时,直接让元素转到动画完成的状态
		*/
		step: function( gotoEnd ) {
			var t = fxNow || createFxNow(),
					done = true,
					elem = this.elem,
					options = this.options,
					i, n;
		
			if ( gotoEnd || t >= (options.duration + this.startTime) ) {				 //如果gotoEnd为true或者已到了动画完成的时间.  
				this.now = this.end;
				this.pos = this.state = 1;																				 //动画的确切执行时间总是一个指定的number的倍数, 很难刚好等于要求的动画持续时间,所以一般可能会有小小的误差, 修正下动画最后的属性值.
				this.update();																										 //进入uptate，重新绘制元素的最后状态.  
	
				options.animatedProperties[ this.prop ] = true;										 //某个属性的动画已经完成
				
				for ( i in options.animatedProperties ) {													 //只有当该动画涉及的所有属性值都改变完毕，才能算该动画完成（其实可以在开始就将涉及属性个数记录下来，完成一个就减1即可）
					if ( options.animatedProperties[i] !== true ) {
						done = false;
					}
				}
	
				if ( done ) {
					if ( options.overflow != null && !da.support.shrinkWrapBlocks ) {			 //还原元素的overflow
						da.each( [ "", "X", "Y" ], function (index, value) {
							elem.style[ "overflow" + value ] = options.overflow[index];
						});
						
					}
	
					if ( options.hide ) {																									 //动画的最后只是设置width,height等为0。如果要求“hide”, 动画完成后,通过设置display真正隐藏元素。
						da(elem).hide();
						
					}
	
					if ( options.hide || options.show ) {																	 //hide,show操作完成后,通过hide/show动画开始前记录的原始值，还原属性值.   
						for ( var p in options.animatedProperties ) {
							da.style( elem, p, options.orig[p] );
						}
					}
	
					options.complete.call( elem );																				 //执行动画完成回调函数
				}
	
				return false;																														 //动画完成, 返回false
	
			}
			else {																																//动画还未执行完毕
				if ( options.duration == Infinity ) {																//默认的easing动画算法，不能用无穷值
					this.now = t;
				} 
				else {
					n = t - this.startTime;																						//动画已经执行了多少时间
					this.state = n / options.duration;																//已经执行时间占总时间的比例
					
					// Perform the easing function, defaults to swing
					this.pos = daFx.easing[options.animatedProperties[this.prop]](this.state, n, 0, 1, options.duration);			//某个属性如果指定了额外的动画算法，即用自定义算法，默认用"swing"算法
					this.now = this.start + ((this.end - this.start) * this.pos);																							//通过动画算法, 计算属性现在的值
				}
				
				this.update();																											//重新绘制元素在这一帧的状态，并启动下一帧操作
			}
	
			return true;																													//此daFx动画对象还未结束, 返回true
		}
	
	};
	
	daFx.fnStruct.init.prototype = daFx.prototype;			//模块通过原型实现继承属性


	daFx.off = false;																		//daFx总开关
	daFx.timers = [];																		//动画缓存区

	daFx.interval = 13;																	//动画每帧间隔时间
	
	daFx.speeds = {
		slow: 600,
		fast: 200,
		// Default speed
		_default: 400
	};
	
	
	/**把da.fnStruct.act的参数都包装为一个对象. 然后把dequeue加入回调函数
	* @param {String|Int} speed 动画时长
	* @param {String|Function} easing 动画算法
	* @param {Function} fn 动画完成后回调函数
	* @return {PlainObject} opt 包装后参数对象
	*    {
	*      complete: function( noUnmark ){},
	*      old: function(){},
	*      duration: speed,
	*      easing: easing,
	*    }
	*/
	daFx.parseParams = function( speed, easing, fn ) {
		var opt = ( speed && "object" === typeof speed ) ? da.extend({}, speed) : {
			complete: fn || !fn && easing || da.isFunction( speed ) && speed,										//动画完成回调函数
			duration: speed,																																		//动画时长
			easing: fn && easing || easing && !da.isFunction(easing) && easing									//动画算法
		};

		opt.duration = daFx.off ? 0 : "number" === typeof opt.duration ? opt.duration :				//daFx.off为true时,全局禁止执行动画,此时任何da.fnStruct.act的speed都为0
			opt.duration in daFx.speeds ? daFx.speeds[opt.duration] : daFx.speeds._default;			//如果speed为"fast","slow"等, 从daFx.speeds里取值, 分别为600,200. 

		opt.old = opt.complete;																																//缓存原始用户回调函数
		opt.complete = function( noUnmark ) {																									//重写回调函数, 把dequeue操作加入回调函数。让动画按顺序执行  
			if ( false !== opt.queue ) {          																							//前面的da.fnStruct.act方法里已经说过, queue参数为false时, 直接执行此次动画, 不必加入队列.
				da.dequeue( this );
			} 
			else if ( false !== noUnmark ) {
				da._unmark( this );
			}

			if ( da.isFunction( opt.old ) ) {
				opt.old.call( this );
			}
		};

		return opt;															//返回封装后的 参数列表对象
	};


	/**动画执行监听
	*/
	daFx.tick = function() {
		var timers = daFx.timers,							//timer里面包括所有当前所有在执行动画的函数. 
				i = timers.length;
		
		while ( i-- ) {
			if ( !timers[i]() ) {								//timers[i]()就是daFx对象custom函数中的t()闭包函数，也就是daFx().step(gotoEnd)。
				timers.splice(i, 1);							//某动画如果完成了,fx.step(gotoEnd)是返回false的。就在全局的timers缓存区中删除该动画。
			}
		}
		
		if ( !timers.length ) {								//当全部动画完成之后, 清空定时器  
			daFx.stop();
		}
	};
	
	/**清空动画定时器
	*/
	daFx.stop = function() {
		clearInterval( timerId );
		timerId = null;
	};
	
	
	/**动画全局帧操作
	*/
	daFx.step = {
		opacity: function( fx ) {																		//opacity的操作不一样.IE要用filter:alpha，所以拿出来单独处理
			da.style( fx.elem, "opacity", fx.now );
		},

		_default: function( fx ) {
			if ( fx.elem.style && fx.elem.style[ fx.prop ] != null ) {
				fx.elem.style[ fx.prop ] = (fx.prop === "width" || fx.prop === "height" ? Math.max(0, fx.now) : fx.now) + fx.unit;
			} else {
				fx.elem[ fx.prop ] = fx.now;
			}
		}
	};
	
	/**动画算法函数
	*/
	daFx.easing = {
		/**线性曲线
		* params {float} p 已执行时长占总时长比例
		* params {int} n 已执行时长
		* params {int} firstNum 初始值0
		* params {int} diff 目标值1
		* return {float} 小数/分数/百分比
		*/
		linear: function( p, n, firstNum, diff ) {
			return firstNum + diff * p;
		},
		
		
		/**
		*/
		swing: function( p, n, firstNum, diff ) {
			return ((-Math.cos(p*Math.PI)/2) + 0.5) * diff + firstNum;
		}
	};

	return daFx;
})();


win.daFx = daFx;

})(window);




/*************************** 扩展部分默认特效函数 *****************************/
var elemdisplay = {},
		iframe, 
		iframeDoc,
		daRe_fxtypes = /^(?:toggle|show|hide)$/,
		daRe_fxnum = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,
		
		fxAttrs = [																																					//特殊的动画操作时， 元素涉及改变的属性
			[ "height", "marginTop", "marginBottom", "paddingTop", "paddingBottom" ],					//动画与height相关属性 
			[ "width", "marginLeft", "marginRight", "paddingLeft", "paddingRight" ],					//动画与width相关属性
			[ "opacity" ]																																			//动画与opacity相关属性
		],
		fxNow, timerId,
		requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame;


// Animations created synchronously will run synchronously
function createFxNow() {
	setTimeout( clearFxNow, 0 );
	return ( fxNow = da.nowId() );
}

function clearFxNow() {
	fxNow = undefined;
}


/**获得特殊的动画操作时， 元素涉及改变的属性
*/
function genFx( type, num ) {
	var obj = {};

	da.each( fxAttrs.concat.apply([], fxAttrs.slice(0,num)), function() {
		obj[ this ] = type;
	});
	
	return obj;
}

// Generate shortcuts for custom animations
da.each({
	slideDown: genFx("show", 1),
	slideUp: genFx("hide", 1),
	slideToggle: genFx("toggle", 1),
	fadeIn: { opacity: "show" },
	fadeOut: { opacity: "hide" },
	fadeToggle: { opacity: "toggle" }
}, 
function( name, props ) {
	da.fnStruct[ name ] = function( speed, easing, callback ) {
		return this.act( props, speed, easing, callback );
	};
});


/**扩展sizzle选择器元素 判断是否执行动画完毕
*/
if ( da.expr && da.expr.filters ) {
	da.expr.filters.acted = function( elem ) {
		return da.grep(daFx.timers, function( fn ) {
			return elem === fn.elem;
		}).length;
	};
}


/**根据不同的元素类型，恢复display属性值
*/
function defaultDisplay( nodeName ) {

	if ( !elemdisplay[ nodeName ] ) {

		var elem = da( "<" + nodeName + ">" ).appendTo( "body" ),
				display = elem.css( "display" );

		elem.remove();

		// If the simple way fails,
		// get element's real default display by attaching it to a temp iframe
		if ( display === "none" || display === "" ) {
			// No iframe to use yet, so create it
			if ( !iframe ) {
				iframe = document.createElement( "iframe" );
				iframe.frameBorder = iframe.width = iframe.height = 0;
			}

			document.body.appendChild( iframe );

			// Create a cacheable copy of the iframe document on first call.
			// IE and Opera will allow us to reuse the iframeDoc without re-writing the fake html
			// document to it, Webkit & Firefox won't allow reusing the iframe document
			if ( !iframeDoc || !iframe.createElement ) {
				iframeDoc = ( iframe.contentWindow || iframe.contentDocument ).document;
				iframeDoc.write( "<!doctype><html><body></body></html>" );
			}

			elem = iframeDoc.createElement( nodeName );

			iframeDoc.body.appendChild( elem );

			display = da.css( elem, "display" );

			document.body.removeChild( iframe );
		}

		// Store the correct default display
		elemdisplay[ nodeName ] = display;
	}

	return elemdisplay[ nodeName ];
}


da.fnStruct.extend({
	show: function( speed, easing, callback ) {
		var elem, display;

		if ( speed || speed === 0 ) {
			return this.act( genFx("show", 3), speed, easing, callback);

		} 
		else {
			for ( var i = 0, j = this.dom.length; i < j; i++ ) {
				elem = this.dom[i];

				if ( elem.style ) {
					display = elem.style.display;

					// Reset the inline display of this element to learn if it is
					// being hidden by cascaded rules or not
					if ( !da.data(elem, "olddisplay") && display === "none" ) {
						display = elem.style.display = "";
					}

					// Set elements which have been overridden with display: none
					// in a stylesheet to whatever the default browser style is
					// for such an element
					if ( display === "" && da.css( elem, "display" ) === "none" ) {
						da.data(elem, "olddisplay", defaultDisplay(elem.nodeName));
					}
				}
			}

			// Set the display of most of the elements in a second loop
			// to avoid the constant reflow
			for ( i = 0; i < j; i++ ) {
				elem = this.dom[i];

				if ( elem.style ) {
					display = elem.style.display;

					if ( display === "" || display === "none" ) {
						elem.style.display = da.data(elem, "olddisplay") || "";
					}
				}
			}

			return this;
		}
	},

	hide: function( speed, easing, callback ) {
		if ( speed || speed === 0 ) {
			return this.act( genFx("hide", 3), speed, easing, callback);

		} 
		else {
			for ( var i = 0, j = this.dom.length; i < j; i++ ) {
				if ( this.dom[i].style ) {
					var display = da.css( this.dom[i], "display" );

					if ( display !== "none" && !da.data( this.dom[i], "olddisplay" ) ) {
						da.data( this.dom[i], "olddisplay", display );
					}
				}
			}

			// Set the display of the elements in a second loop
			// to avoid the constant reflow
			for ( i = 0; i < j; i++ ) {
				if ( this.dom[i].style ) {
					this.dom[i].style.display = "none";
				}
			}

			return this;
		}
	},

	// Save the old toggle function
	_toggle: da.fnStruct.toggle,

	toggle: function( fn, fn2, callback ) {
		var bool = typeof fn === "boolean";

		if ( da.isFunction(fn) && da.isFunction(fn2) ) {
			this._toggle.apply( this, arguments );

		}
		else if ( fn == null || bool ) {
			this.each(function() {
				var state = bool ? fn : da(this).is(":hidden");
				da(this)[ state ? "show" : "hide" ]();
			});

		} else {
			this.act(genFx("toggle", 3), fn, fn2, callback);
		}

		return this;
	},

	fadeTo: function( speed, to, easing, callback ) {
		return this.filter(":hidden").css("opacity", 0).show().end()
					.act({opacity: to}, speed, easing, callback);
	},

	/**修正动画参数, 把参数传递给daFx类去实现动画
	*@param {PlainObject} prop 动画DOM对象属性键值对，以{"left":"100px", "paddingLeft": "show"}这种形式传进来, 在show, hide等方法里, 是由genfx 函数转化而来。
	*@param {Int|PlainObject} speed 动画时间或参数列表
	*@param {String|Function} easing 动画算法函数
	*@param {Function} 动画完成回调函数
	*/
	act: function( prop, speed, easing, callback ) {
		var optall = daFx.parseParams( speed, easing, callback );								//修正参数并缓存。(参数包装成一个对象方便以后调用)
 
		if ( da.isEmptyObj( prop ) ) {																					//prop 是个空对象。不需要执行动画，直接调用回调函数。
			return this.each( optall.complete, [ false ] );
		}

		return this[ false === optall.queue ? "each" : "queue" ](function() {		//如果speed参数列表里指定了queue 为false, 单独执行这次动画, 而不是默认的加入队列
			if ( false === optall.queue ) {
				da._mark( this );
			}

			var opt = da.extend({}, optall),																			//复制一份optall对象。
				isElement = this.nodeType === 1,																		//是否是有效dom对象。
				hidden = isElement && da(this).is(":hidden"),												//元素的可见性。
				name, val, p,
				display, e,
				parts, start, end, unit;

			// will store per property easing and be used to determine when an animation is complete
			opt.animatedProperties = {};

			for ( p in prop ) {																										//遍历需要执行动画的属性
				name = da.camelCase( p );																						//把margin-left之类的属性转换成marginLeft驼峰格式
				if ( p !== name ) {																									
					prop[ name ] = prop[ p ];																					//把值复制给camelCase转化后的属性
					delete prop[ p ];																									//删除不标准的冗余属性
				}

				val = prop[name];

				if ( "hide" === val && hidden || "show" === val && !hidden ) {			//元素在hidden状态下再隐藏或者show状态下再显示，无效操作直接调用回调函数。
					return opt.complete.call( this );
				}

				if ( isElement && ( name === "height" || name === "width" ) ) {															//如果是改变元素的height或者width
					opt.overflow = [ this.style.overflow, this.style.overflowX, this.style.overflowY ];				//获取元素的3个overflow属性，因为当overflowX和overflowY设置为相同值时，IE不能自动修改设置overflow

					if ( da.css( this, "display" ) === "inline" &&
							da.css( this, "float" ) === "none" ) {																								//对于不支持inline-block的浏览器,可以加上zoom:1 来hack
						if ( !da.support.inlineBlockNeedsLayout ) {
							this.style.display = "inline-block";

						}
						else {
							display = defaultDisplay(this.nodeName);

							if ( display === "inline" ) {																													//inline元素可以设置为inline-block，但是block元素需要通过layout方式实现inline-block;
								this.style.display = "inline-block";
							} 
							else {
								this.style.display = "inline";
								this.style.zoom = 1;
							}
							
						}
					}
				}
				
				// easing resolution: per property > opt.specialEasing > opt.easing > 'swing' (default)
				opt.animatedProperties[name] = da.isArray( val ) ?																					//可以给某个属性单独定制动画算法。 如：$("#div1").animate({"left":["+=100px", "swing"], 1000}
					val[1] : opt.specialEasing && opt.specialEasing[name] || opt.easing || 'swing';
					
					
			}

			if ( opt.overflow != null ) {																							//动画改变元素大小时, overflow设置为hidden, 避免滚动条也跟着不停改变
				this.style.overflow = "hidden";
			}

			for ( p in prop ) {																												//遍历需要执行动画的属性
				e = daFx( this, opt, p );																								//daFx是个动画辅助工具类。为每个元素、每个属性的动画操作都生成一个daFx对象。

				val = prop[p];

				if ( daRe_fxtypes.test(val) ) {
					e[ val === "toggle" ? hidden ? "show" : "hide" : val ]();							//动画方式进行show. hide和toggle。这里进入是daFx对象的show、hide方法 并不是da对象的show、hide方法

				} 
				else {
					parts = daRe_fxnum.exec(val);																					//是否为偏移方式，如:"+=100px"。
					start = e.cur();																											//修正开始的位置,无效属性值修正为0。

					if ( parts ) {																												//偏移方式值。
						end = parseFloat( parts[2] );
						unit = parts[3] || ( da.cssNumber[ name ] ? "" : "px" );				//修正单位

						// We need to compute starting value
						if ( unit !== "px" ) {
							da.style( this, p, (end || 1) + unit);
							start = ((end || 1) / e.cur()) * start;
							da.style( this, p, start + unit);																	//修正开始的位置,unit可能为%. 
						}

						if ( parts[1] ) {																										//做相对变化时, 计算结束的位置, 比如  {"left":"+=100px"}， 表示元素右移100个像素 
							end = ((parts[1] === "-=" ? -1 : 1) * end) + start;
						}

						e.custom( start, end, unit );																				//调用daFx对象的custom方法, 真正开始动画

					}
					else {
						e.custom( start, val, "" );
						
					}
					
				}
			}

			// For JS strict compliance
			return true;
		});
	},

	/**终止目标元素的动画
	* @param {Boolean} clearQueue 是否清空元素对应的队列缓存
	* @param {Boolean} gotoEnd 是否直接设置为动画完成状态
	*/
	stop: function( clearQueue, gotoEnd ) {
		if ( clearQueue ) {
			this.queue([]);
		}

		this.each(function() {
			var timers = daFx.timers,
					i = timers.length;
			// clear marker counters if we know they won't be
			if ( !gotoEnd ) {
				da._unmark( true, this );
			}
			// go in reverse order so anything added to the queue during the loop is ignored
			while ( i-- ) {
				if ( timers[i].elem === this ) {									//找到daFx.timers中的跟这个元素对应的 动画执行闭包函数, 可能有多个
					if (gotoEnd) {																	//调用一次daFx.step(true),转到动画执完成的状态
						timers[i](true);
						
					}

					timers.splice(i, 1);														//timers数组里删掉这个对应的 动画执行闭包函数
				}
			}
			
		});

		// start the next in the queue if the last step wasn't forced
		if ( !gotoEnd ) {
			this.dequeue();
		}

		return this;
	}


});




/**扩展部分默认动画算法函数
http://www.cnblogs.com/cloudgamer/archive/2009/01/06/Tween.html

Linear：无缓动效果；
Quadratic：二次方的缓动（t^2）；
Cubic：三次方的缓动（t^3）；
Quartic：四次方的缓动（t^4）；
Quintic：五次方的缓动（t^5）；
Sinusoidal：正弦曲线的缓动（sin(t)）；
Exponential：指数曲线的缓动（2^t）；
Circular：圆形曲线的缓动（sqrt(1-t^2)）；
Elastic：指数衰减的正弦曲线缓动；
Back：超过范围的三次方缓动（(s+1)*t^3 - s*t^2）；
Bounce：指数衰减的反弹缓动。

每个效果都分三个缓动方式（方法），分别是：
easeIn：从0开始加速的缓动；
easeOut：减速到0的缓动；
easeInOut：前半段从0开始加速，后半段减速到0的缓动。
其中Linear是无缓动效果，没有以上效果。

*/

// t: , b: , c: , d: 
daFx.easing['jswing'] = daFx.easing['swing'];
da.extend( daFx.easing,
{
	def: 'easeOutQuad',
	/**
	* params {float} x 已执行时长占总时长比例
	* params {int} t 已执行时长 current time
	* params {int} b 初始值0 begInnIng value
	* params {int} c 目标值1 change In value
	* params {int} d 总时长 duration
	
	* return {float} 小数/分数/百分比
	*/
	swing: function (x, t, b, c, d) {
		//alert(da.easing.default);
		return daFx.easing[daFx.easing.def](x, t, b, c, d);
	},
	easeInQuad: function (x, t, b, c, d) {
		return c*x*x + b;
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeInOutQuad: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInCubic: function (x, t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	easeOutCubic: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	easeInOutCubic: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	easeInQuart: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	easeOutQuart: function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeInOutQuart: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	easeInQuint: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	easeOutQuint: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	easeInOutQuint: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	easeInSine: function (x, t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	easeOutSine: function (x, t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	easeInOutSine: function (x, t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	easeInExpo: function (x, t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeInCirc: function (x, t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	easeOutCirc: function (x, t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	easeInOutCirc: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	easeInElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	easeOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	easeInOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	easeInBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	easeOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	easeInOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	easeInBounce: function (x, t, b, c, d) {
		return c - daFx.easing.easeOutBounce (x, d-t, 0, c, d) + b;
	},
	easeOutBounce: function (x, t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	},
	easeInOutBounce: function (x, t, b, c, d) {
		if (t < d/2) return daFx.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
		return daFx.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
	}
});







/**daGif
*逐帧动画类
* @author danny.xu
* @version daGif_1.0 2011-10-28 22:32:25
*/
(function( win, undefined ){
var doc = win.document;

/********* 为了让da.fnStruct.act()支持backgroundPosition属性需要修补一些东东 ************/
if(!document.defaultView || !document.defaultView.getComputedStyle){ 												//兼容backgroundPositionX
	var oldCurCSS = da.curCSS;
	da.curCSS = function(elem, name, force){
		if(name === 'background-position'){
			name = 'backgroundPosition';
		}
		if(name !== 'backgroundPosition' || !elem.currentStyle || elem.currentStyle[ name ]){
			return oldCurCSS.apply(this, arguments);
		}
		var style = elem.style;
		if ( !force && style && style[ name ] ){
			return style[ name ];
		}
		return oldCurCSS(elem, 'backgroundPositionX', force) +' '+ oldCurCSS(elem, 'backgroundPositionY', force);
	};
}
/***  修补da.fnStruct.act()  ***/
var oldAct = da.fnStruct.act;
da.fnStruct.act = function(prop){
	if('background-position' in prop){
		prop.backgroundPosition = prop['background-position'];
		delete prop['background-position'];
	}
	if('backgroundPosition' in prop){
		prop.backgroundPosition = '('+ prop.backgroundPosition;
	}
	return oldAct.apply(this, arguments);
};

/**将backgroundPosition字符串值转为数组格式
*/
function _BgPositionToArray( strg ){
	strg = strg.replace(/left|top/g,'0px');
	strg = strg.replace(/right|bottom/g,'100%');
	strg = strg.replace(/([0-9\.]+)(\s|\)|$)/g,"$1px$2");
	var res = strg.match(/(-?[0-9\.]+)(px|\%|em|pt)\s(-?[0-9\.]+)(px|\%|em|pt)/);
	return [parseFloat(res[1],10),res[2],parseFloat(res[3],10),res[4]];
}

/**给daFx类静态成员step()函数添加backgroundPosition特殊属性处理函数
*/
daFx.step.backgroundPosition = function( daFxObj ) {da.out(1)
	if (!daFxObj.bgPosReady) {
		var start = da.curCSS(daFxObj.elem,'backgroundPosition');
		if(!start){//FF2 no inline-style fallback
			start = '0px 0px';
		}
		
		start = _BgPositionToArray(start);
		daFxObj.start = [start[0],start[2]];
		
		var end = _BgPositionToArray(daFxObj.end);
		daFxObj.end = [end[0],end[2]];
		
		daFxObj.unit = [end[1],end[3]];
		daFxObj.bgPosReady = true;
	}
	//return;
	var nowPosX = [];
	nowPosX[0] = ((daFxObj.end[0] - daFxObj.start[0]) * daFxObj.pos) + daFxObj.start[0];
	nowPosX[1] = ((daFxObj.end[1] - daFxObj.start[1]) * daFxObj.pos) + daFxObj.start[1];
	
	daFxObj.elem.style.backgroundPosition = nowPosX[0] + daFxObj.unit[0] + ' ' + nowPosX[1] + daFxObj.unit[1];

};

/**
* params {float} x 已执行时长占总时长比例
* params {int} t 已执行时长 current time
* params {int} b 初始值0 begInnIng value
* params {int} c 目标值1 change In value
* params {int} d 总时长 duration
*/
daFx.easing['daGif'] = function (x, t, b, c, d) {
//	if(  ){
//		
//	}
//	else return 
};

var daGif = (function(){
	
	/**daPopMenu类构造函数
	*/
	var daGif = function( gifSetting ){
		return new daGif.fnStruct.init( gifSetting );
	};

	daGif.fnStruct = daGif.prototype = {
		version: "daGif v1.0 \nauthor: danny.xu \ndate: 2011-10-28 22:32:28",
		
		daObj: null,

		gifTime: 0,															//一次完整播放总时间
		gifNowStep: 0,													//当前播放到第几帧
		
		gifSetting: {
			target: null,													//动画对象
			src: "", 															//被播放图片的路径
			width: 10, 														//每一帧的宽度
			height: 10, 													//每一帧的高度
			top: 0, 															//竖直方向的背景图位置
			all: 0,										 						//总共有多少帧
			first: 1,													 		//起始帧数
			speed: 25,											 			//每秒播放的帧速fps
			isAuto: true, 												//是否立即播放
			isBack: false, 												//是否按倒序播放
			isLoop: false													//是否循环播放
		},
		
		/**初始化函数
		*/
		init: function( gifSetting ){
			gifSetting = this.gifSetting = da.extend( {}, this.gifSetting, gifSetting );
			
			if( !gifSetting.src ){ alert("daGif温馨提示：您传入的动画图片地址有误。"); return false; }
			if( !gifSetting.all ){ alert("daGif温馨提示：您未传入动画总帧数。"); return false; }
			
			this.daObj = da( gifSetting.target );
			if( 0 >= this.daObj.dom.length ){ alert("daGif温馨提示：没有找到您需要播放逐帧动画的对象。"); return false; }
			
			this.create();
		},
		
		create: function(){
			var gifSetting = this.gifSetting,
					tOneStep = 1000/gifSetting.speed,												//一帧时间
					fromLeft = 0,
					toLeft = ( gifSetting.all - 1 )*gifSetting.width;
			
			if( gifSetting.isBack ){
				var tmp = fromLeft;
				fromLeft = toLeft;
				toLeft = tmp;
			}
			
			this.gifTime = gifSetting.all * tOneStep;										//一次播放总时间
			
			this.daObj.dom[0].style.width = gifSetting.width +"px";
			this.daObj.dom[0].style.height = gifSetting.height +"px";
			this.daObj.dom[0].style.background = " url("+ gifSetting.src +") "+ fromLeft +"px "+ gifSetting.top +"px no-repeat";
			
			var context = this;
			this.daObj.act({
				backgroundPosition: (-toLeft + "px " + gifSetting.top+"px ")
			},{
				duration: this.gifTime,
				step: function( nowVal, daFxObj ){
				},
				update: function( daFxObj ){
					if (!daFxObj.bgPosReady) {
						var start = da.curCSS(daFxObj.elem,'backgroundPosition');
						if(!start){																									//FF2 no inline-style fallback
							start = '0px 0px';
						}
						
						start = _BgPositionToArray(start);
						daFxObj.start = [start[0],start[2]];
						
						var end = _BgPositionToArray(daFxObj.end);
						daFxObj.end = [end[0],end[2]];
						
						daFxObj.unit = [end[1],end[3]];
						daFxObj.bgPosReady = true;
					}
					//return;
					var nowPosX = [];
					nowPosX[0] = ((daFxObj.end[0] - daFxObj.start[0]) * daFxObj.pos) + daFxObj.start[0];
					nowPosX[1] = ((daFxObj.end[1] - daFxObj.start[1]) * daFxObj.pos) + daFxObj.start[1];
					
					context.gifNowStep = parseInt( nowPosX[0]/gifSetting.width );
					nowPosX[0] = context.gifNowStep * gifSetting.width;
					
					daFxObj.elem.style.backgroundPosition = nowPosX[0] + daFxObj.unit[0] + ' ' + nowPosX[1] + daFxObj.unit[1];
				},
				complete: function(){
					if( gifSetting.isLoop )
						context.create();
					
				}
				
			});
			
			
			
		},
		
		stop: function(){
			this.daObj.stop();

		}
		
		
		
	};

	daGif.fnStruct.init.prototype = daGif.prototype;			//模块通过原型实现继承属性

	//TODO: 静态成员
	
	
	
	return daGif;
})();


win.daGif = daGif;

})(window);


