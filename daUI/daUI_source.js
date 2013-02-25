/**daUI皮肤装套函数
*/
daUI = function(){
	da("input,textarea,select,button").each(function(){
		if( "INPUT" === this.tagName && ("checkbox" === this.type || "radio" === this.type) ){								//daOption皮肤
			daOption.convert( this );
		}
		else if( "SELECT" === this.tagName ){																																	//daSelect皮肤
			daSelect.convert( this );
		}
		else if( "INPUT" === this.tagName && this.getAttribute( "list" ) ){
			daSelect.convert( this );
		}
		else if( "BUTTON" === this.tagName ){																																	//daButton皮肤
			daButton.convert( this );
		}
		else if( "INPUT" === this.tagName && ("button" === this.type || "submit" === this.type) ){
			daButton.convert( this );
		}
		else if( "TEXTAREA" === this.tagName ){																																//daInput皮肤
			daInput.convert( this );
		}
		else if( "INPUT" === this.tagName && "text" === this.type ){
			daInput.convert( this );
		}
			
	});
	
	/**右键菜单
	*/
	if( "undefined" !== typeof daPopMenu ){
		daPopMenu({
			target: document.body,
			list: [
				'<span class="daIco2 refresh"></span>&nbsp;&nbsp;刷新',
				'<span class="daIco2 dleft"></span>&nbsp;&nbsp;返回',
				'<span class="daIco2 dright"></span>&nbsp;&nbsp;前进',
				'<span class="daIco2 search2"></span>&nbsp;&nbsp;查看代码',
				"-",
				'<div style="width:200px;font-size:10px;white-space:normal; word-break:break-all;">'+window.location.href+'</div>',
				'汉默地理资讯'
			],
			click: function( dom, idx, html, menuObj ){
				switch( idx ){
					case 0:
						iframeRefresh();
						break;
					case 1:
						iframeBack();
						break;
					case 2:
						iframeForward();
						break;
					case 3:
						info('<textarea style="width:900px; height:500px;">'+ document.documentElement.innerHTML +'</textarea>');
						break;
					case 5:
						info('<div style="width:300px;height:89px;background:url( /images/HANMOLOGO.png ) center no-repeat;"></div><div style="font-size:16px;padding:5px;">成都汉默地理资讯科技有限公司</div><div style="font-size:14px;padding:5px;">地　　址：温哥华大厦19楼CD座</div><div style="font-size:14px;padding:5px;">商务热线：<span style="font-weight:bold;"/>400-028-0700<span></div>');
						break;
					default:
						break;
				}
				
			}
		});
	}
	
	/**快捷键
	*/
	if( "undefined" !== typeof daKey ){
		daKey({
			keydown: function( key, ctrl, alt, shift ){
				if( "Esc" === key && da.getRootWin().closeSys )	da.getRootWin().closeSys();
			}
		});
	}
};