/*
	author:	danny.xu
	date:	2010-10-29
	description:	daLoading类脚本文件
*/

(function(win){
var doc=win.document;	

/**daLoading构造函数
* @param {PlainObject} setting 用户参数列表
*/
var daLoading = function( setting ){
	return new daLoading.fnStruct.init( setting );
};

//类属性
daLoading.fnStruct = daLoading.prototype = {
	version: "daLoading 1.0  \n\nauthor: danny.xu\n\ndate: 2010-10-29\n\nThank you!!!",
	dlId: 0,
	dlParent: null,
	dlBody: null,
	dlBox: null,
	dlFlow: null,
	dlText: null,
	

	isFinished: false,
	isRemoved: false,
	
	setting: {
		window: win,
		parent: null,
		
		click: null,
		border: null,						//默认"1px solid #000",
		left: "",
		top: "",
		text: "正在加载..",						
		type: "auto"						//"auto", "percent", "bar", "gif"
	},
	
	
	/**初始化函数
	* @param {PlainObject} setting 用户参数列表
	*/
	init: function( setting ){
		setting = this.setting = da.extend( true, {}, this.setting, setting );
		win = setting.window;
		doc = win.document;
		
		var objParent = setting.parent;
		if("string" == typeof objParent) objParent = doc.getElementById(objParent);
		this.dlParent = objParent || doc.body;
		
		//生成新id
		//while(null!=doc.getElementById("daLoading_"+this.dlId)) this.dlId++;
		this.dlId = da.nowId();
		
		this.create();
			
		this.bindEvent();											//事件绑定
		return this;
	},
	
	//创建HTML对象
	create: function(){
		var dlId = this.dlId;
		var dlBody = doc.createElement("div");
		dlBody.id = "daLoading_"+ dlId;
		dlBody.className = "dl_body";
		if( null !== this.setting.border ) dlBody.style.border = this.setting.border;
		dlBody.title = "温馨提示：点击隐藏";
		
		dlBody.innerHTML = 
		[
      '<div id="dl_text_'+dlId+'" class="dl_text"></div>',
      '<div id="dl_barbox_'+dlId+'"  class="dl_barbox">',
         '<div id="dl_barbg_'+dlId+'" class="dl_barbg"></div>',
         '<div id="dl_barflow_'+dlId+'" class="dl_barflow"></div>',
      '</div>'
		].join("");
		
		this.dlBody = dlBody;
		this.dlParent.insertBefore( dlBody, this.dlParent.firstChild );
		
		this.dlBox = doc.getElementById("dl_barbox_"+dlId);
		this.dlFlow = doc.getElementById("dl_barflow_"+dlId);
		this.dlText = doc.getElementById("dl_text_"+dlId);
		
		
		this.dlBox.style.display = "none";
		switch( this.setting.type ){
			case "auto":
				this.dlText.innerHTML = daLoading.talkArray[ Math.floor( Math.random()*daLoading.talkArray.length ) ];
				break;
			case "gif":
				this.dlBody.style.padding = "0px";
				this.dlText.innerHTML = '<div class="loadingGif" style="float:left;"></div><div style="float:left;padding:0px 5px;height:32px;line-height:32px;">'+ this.setting.text +'</div>';
				break;
			case "percent":
				this.dlText.innerHTML = "0%";
				this.isShowBar = true;
				this.dlBox.style.display = "block";
				this.runto99();
				break;
			case "bar":
				this.dlText.style.display = "none";
				this.isShowBar = true;
				this.dlBox.style.display = "block";
				this.runto99();
				break;
			case "text":
			default:
				this.dlText.innerHTML = this.setting.text;
				break;
		}
		
		if( !this.dlParent.style.position ) this.dlParent.style.position = "relative";
		this.dlBody.style.left = ( this.setting.left ) ? this.setting.left : (this.dlParent.offsetWidth - this.dlBody.offsetWidth)/2 + "px";
		this.dlBody.style.top = ( this.setting.top ) ? this.setting.top : (this.dlParent.offsetHeight - this.dlBody.offsetHeight)/2+ "px";
		
		da(this.dlBody).bgiframe();
	},
	
	//事件绑定
	/*
		fnClick: 点击后回调事件
	*/
	bindEvent: function(){
		var setting = this.setting,
				context = this;
		
		da( this.dlBody ).bind( "click", function(){
			context.dlnum = 100;
			context.isFinished = true;
			context.clear( true );
			
			//点击后回调自定义事件
			if(setting.click) setting.click.call( context );
		
		});
		
	},
	
	
	runto99: function(){
		if(null==this.dlBody) return;
		
		if( 99 <= this.dlnum && this.isFinished ){
			this.clear();
			return;
		}
		
		this.dlnum = this.dlFlow.offsetLeft;
		
		if( 99 > this.dlnum ){
			this.dlFlow.style.left = (++this.dlnum) +"px";
			
		  if( "percent" === this.setting.type )
				this.dlText.innerHTML = this.dlnum + "%";
				
			var context = this;
			setTimeout(function(){
				context.runto99();
			},13);
		}
	},

	finished: function(){
		this.isFinished = true;
		if( 99 <= this.dlnum || !this.isShowBar )
			this.clear();
		
	},
	
	clear: function( isHide ){
		if( !this.isRemoved ){
			if( isHide )
				this.dlBody.style.display = "none";
			else{
				this.dlParent.removeChild( this.dlBody );
				this.isRemoved = true;
			}
		}
	}
};


daLoading.talkArray = [
	"加油！", "Forever", "喜欢它，那么享受它。", "我相信您是最棒的！", "嘿，伙计！", "稍等一下下...", "怎么又是你！？",
	"大怪兽！", "哥们儿，洗把脸吧。", "快快快...", "加速度120", "简单才是硬道理", "再看，就把你吃掉", "哟，今天很性感嘛", 
	"创意无限", "知识就是力量", "亲，懂得珍惜", "是你，是你，还是你", "哭，不能解决问题", "等待是挺烦的"
];

daLoading.talkArray=["加油！","Forever","喜欢它，那么享受它。","我相信您是最棒的！","嘿，伙计！","稍等一下下...","怎么又是你！？","大怪兽！","哥们儿，洗把脸吧。","快快快...","加速度120","简单才是硬道理","再看，就把你吃掉","哟，今天很性感嘛","创意无限","知识就是力量","亲，懂得珍惜","是你，是你，还是你","哭，不能解决问题","等待是挺烦的","用诚心成事，以服务服人","聆听科技脉动，放眼世界改变","集团化、产业化、品牌化","简单做人、务实高效、诚信服务","力求客户满意，建立长期合作关系","用完美的产品打动客户,用周到的服务留住客户","专业专注，全心服务","创新感知互联，引领智慧科技","掌握科技脉搏，志成服务世界","智慧地理，汉默科技","罕见卓越，非你莫属","技术解决之道，汉默智慧创造","汉默地理，智行千里","汉默，借您一双慧眼看世界，助您激越智慧时代","因为有您，所以汉默存在"];


//对象继承类属性
daLoading.fnStruct.init.prototype = daLoading.prototype;

/********** 功能函数 ***********/



//全局属性
win.daLoading = win.dl = daLoading;

})(window);


/**重写全局loading函数
*/
function loading( isShow, title ){
	if( isShow && !window.daLoadingObj ){
		title = title || "正在加载..";
		window.daLoadingObj = daLoading({
			type: "gif",
			text: title
		});
	}
	if( !isShow && window.daLoadingObj ){ 
		window.daLoadingObj.finished();
		window.daLoadingObj=null;
	}
}