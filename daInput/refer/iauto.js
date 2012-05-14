
jQuery.iAuto = {
	format : "" ,
	validfunc : "" ,
	multi : false ,
	helper : null,
	pick : false ,
	content : null,
	iframe: null,
	timer : null,
	lastValue: null,
	currentValue: null,
	subject: null,
	selectedItem : null,
	items: null,
	noautofixed : false ,
	reccount : 500 ,
	fixedsrc : "" ,
	
	empty : function()
	{
		jQuery.iAuto.content.empty();
		if (jQuery.iAuto.iframe) {
			jQuery.iAuto.iframe.hide();
		}
	},

	clear : function()
	{
		$(jQuery.iAuto.subject).removeClass("dropdown") ;
		jQuery.iAuto.items = null;
		jQuery.iAuto.selectedItem = null;
		try {jQuery.iAuto.lastValue = jQuery.iAuto.subject.value;} catch (e) {} finally {} ;
		if(jQuery.iAuto.helper.css('display') == 'block') {
			jQuery.iAuto.helper.hide();
			jQuery.iAuto.iframe.hide();
			if (jQuery.iAuto.subject.autoCFG.onHide)
				jQuery.iAuto.subject.autoCFG.onHide.apply(jQuery.iAuto.subject, [jQuery.iAuto.helper, jQuery.iAuto.iframe]);
		} else {
			jQuery.iAuto.empty();
		}
		window.clearTimeout(jQuery.iAuto.timer);
	},

	getFieldValues : function(field)
	{
		var fieldData = {
			value: field.value,
			pre: '',
			post: '',
			item: '',
			yes: ''
		};
		
		if(field.autoCFG.multiple) {
			currvalue1 = field.value ;
			msp1 = field.autoCFG.multipleSeparator ;
			if (msp1=="") msp1 = "," ;
			mspi1 = currvalue1.lastIndexOf(msp1) ;
			if (mspi1<0) 
			{
				cleft1 = "" ;
				cright1 = "" ;
				citm1 = currvalue1.trim() ;
		  } else
			{
				cleft1 = currvalue1.substr(0,mspi1+1);
				cright1 = "" ;
				citm1 = currvalue1.substr(mspi1+1).trim() ;
			};
			
			fieldData.pre = cleft1 ;
			fieldData.post = cright1 ;
			fieldData.item = citm1 ;
			//alert("c="+selectionStart+",pre="+cleft1+" , item="+citm1+",post="+cright1+",sp=|"+msp1+"|") ;
		} else {
			fieldData.item = fieldData.value;
		}
		return fieldData;
	},
	update : function ()
	{
		var subject = jQuery.iAuto.subject;
	
		var subjectValue = jQuery.iAuto.getFieldValues(subject);
		//var selectionStart = jQuery.iAuto.getSelectionStart(subject);

		if ((subject) && (subjectValue.item.length >= subject.autoCFG.minchars)) {

			jQuery.iAuto.lastValue = subjectValue.item;
			jQuery.iAuto.currentValue = subjectValue.item;
      //alert(subjectValue.item) ;
      
      mysoure = tostr(isnull(jQuery(subject).attr("source"),"")) ;
      
      var troj1 = jQuery(subject).parents("tr:first") ;
      var prdid11 = 0 ;
      if (troj1.length>0) 
      {
      	var tdoj1 = jQuery("td[prdid]",troj1) ;
      	if (tdoj1.length>0) prdid11 = tdoj1.attr("prdid") ;
      } ;
      try {mysoure = mysoure.replace("{prdid}",prdid) ;} catch (e) {} finally { };
      try {mysoure = mysoure.replace("<prdid>",prdid) ;} catch (e) {} finally { };
      
      try {mysoure = mysoure.replace("{ccid}",ccid) ;} catch (e) {} finally { };
		  mysoure = mysoure.replace("{ccid}","0") ;
		  try {mysoure = mysoure.replace("<ccid>",ccid) ;} catch (e) {} finally { };
		  mysoure = mysoure.replace("<ccid>","0") ;
		  
		  mysoure = mysoure.trim() ;

 
			if ((mysoure.substr(mysoure.length-1,1)==")") && (mysoure.substr(0,1)!='$'))  // 是函
			{
				try
			  {
			     eval("mysoure="+mysoure) ;
			  }  catch (e) {} finally {};
			}  ;
			
			if (mysoure.substr(0,1)=='$') 
			{

				mysoure = mysoure.substr(2,mysoure.length-3) ;
				if (mysoure.substr(0,1)=="'") mysoure = mysoure.substr(1,mysoure.length-2) ;
				if (mysoure.substr(0,1)=='"') mysoure = mysoure.substr(1,mysoure.length-2) ;
				var $obj01 = $(mysoure) ;
				if ($obj01.length>0) 
				{
					var vals12 = [] ;
					$obj01.each(
					function()
					{
					  vals12.push($get(this)) ;
					}) ;
					if (vals12.length==1) mysoure = vals12[0]+"|" ;
					else mysoure = vals12.join("|") ;
				} else mysoure = "" ;
			} ;
			
			ispick = isnull(jQuery(subject).attr("pick"), "") ;
			if (ispick!="") 
			{
				mysoure = "" ;
				jQuery.iAuto.pick =true ;
			} else
			{
				jQuery.iAuto.pick = false ;
			} ;	
      
		  
		  var i = 0 ;
			var paramobj1 = mysoure ;
			
			while (paramobj1!="") 
			{
				i = paramobj1.indexOf("<") ;
				if (i>=0) 
				{
					paramobj1 = paramobj1.substr(i+1) ;
					i = paramobj1.indexOf(">") ;
					if (i>=0) 
					{
						mysoure = mysoure.replace("<"+paramobj1.substr(0,i)+">",tohex($get(paramobj1.substr(0,i)))) ;
						paramobj1 = paramobj1.substr(i+1) ;
					} else paramobj1 = "" ;
				} else paramobj1 = "" ;
			} ;
		  
		  jQuery.iAuto.fixedsrc = mysoure ;
		  jQuery.iAuto.noautofixed = false ;
		  
			if ((mysoure==undefined) || (mysoure==null) || (mysoure=="")) 
			  mysoure = subject.autoCFG.source ;
			
			if ((mysoure==undefined) || (mysoure==null) || (mysoure==""))   mysoure="" ;
			
			if (mysoure=="") return  false ;
			
			if (mysoure.indexOf("|")>0) // source="fkjds|fldsfd|fklsfkds|fkldskfd|fdsklfd" ;
			{
				var toWrite = '';
				toWrite += "<table cellSpacing=0 cellPadding=3  border=0>" ;
				var ci1 = 0 ;
				var nri = -1 ;
				var ss11 = "" ;
				var ss22 = "" ;
				var valueToAdd = "" ;
				while (mysoure!="") 
				{
					ci1 = mysoure.indexOf("|") ;
					if (ci1>=0) 
					{
						ss11 = mysoure.substr(0,ci1) ;
						mysoure = mysoure.substr(ci1+1) ;
					} else 
					{
						ss11 = mysoure ;
						mysoure = "" ;
					} ;
					ss11 = ss11.trim() ;
					if (ss11!="") 
					{
						ci1 = ss11.indexOf("=") ;
						if (ci1>0) 
						{
							ss22 = ss11.substr(ci1+1) ;
							ss11 = ss11.substr(0,ci1) ;
						} else
						{
							ss22 = ss11 ;
						} ;
						nri ++ ;
						if (nri==0) valueToAdd = ss22 ;
						toWrite += "<tr dir="+nri+" rel='"+ss22+"'><td nowrap style='border-left:1px solid #eeeeee'>"+ss11+"</td></tr>" ;
					} ;
				} ;
				toWrite += "</table>" ;
				if (subject.autoCFG.autofill) 
				{
					jQuery.iAuto.selection(
							subject, 
							subjectValue.item.length != valueToAdd.length ? (subjectValue.pre.length + subjectValue.item.length) : valueToAdd.length,
							subjectValue.item.length != valueToAdd.length ? (subjectValue.pre.length + valueToAdd.length) : valueToAdd.length
					);
				} ;
				jQuery.iAuto.writeItems(subject, toWrite , "",false);
				return false ;
			} ;
			if ((mysoure.indexOf("&key=")>=0) && (mysoure.indexOf("|")<0))
			  mysoure = mysoure.replace('&key=' , '&key='+tohex(subjectValue.item)) ;
			
			var cacheident = mysoure ;
			
	 		if (mysoure.toLowerCase().indexOf(".asp")<0) 
			{
	  		mysoure = "/sys/aspx/execsql.aspx?sqlname="+mysoure ;
	  		mysoure = mysoure +"&xml=1&id03_="+ident() ;  
   		} else 
   		{
     		if (mysoure.indexOf('?') > 0) mysoure = mysoure + '&xml=1&noidd=' + ident() ;
     		else mysoure = mysoure + '?xml=1&noidd=' + ident() ;
   		} ; 
   		
   		reccount1 = jQuery(subject).attr('dropdowncount') ;
   		if ((reccount1==undefined) || (reccount1==null) || (reccount1=="")) reccount1 = "500" ;
   		jQuery.iAuto.reccount = reccount1 ;
   		reccount1 = (parseInt(reccount1)+1) ;
   		mysoure = mysoure + '&reccount=' + reccount1 ;
   		reccount1 = (parseInt(reccount1)-1) ;
   		
   		var cachei1 = _pobj2.dropdowncache.indexOf(cacheident) ;
      if (cachei1>=0) 
      {
      	jQuery.iAuto.writeItems(subject, _pobj2.dropdowncache[cachei1+1] , cacheident ,true);
		    return  false ;
      } ;
   		
   	//	debug(mysoure) ;
   		
			$.ajax(
				{
					type: 'GET',
					dataType : 'xml' , 
					success: function(xml)
					{
						subject.autoCFG.lastSuggestion = jQuery('ds1',xml);
						size = subject.autoCFG.lastSuggestion.size();
						if (size > 0) {
							var toWrite = '';
							var childi = 0 ;
							toWrite += "<table cellSpacing=0 cellPadding=3  border=0>" ;
							subject.autoCFG.lastSuggestion.each(
							  function(nr)
							  {
							  	if (nr>=reccount1)
							  	{
							  		if (nr==reccount1)
							  		  toWrite += "<tr dir="+nr+" rel=''><td nowrap>&nbsp;</td><td nowrap colspan=100 class=fontfaint>更多项已省略...</td></tr>"  ;
							  	} else 
							  	{
							  	  childi = 0 ;
							  	  toWrite += "<tr dir="+nr+"" ;
							  	  $(this).children().each(function()
							  	  {
							  		  childi ++ ;
							  		  text001 = isnull(this.text,"") ;
							  		  if (childi>1) 
							  	  	{
							  			  toWrite += "<td nowrap name=\""+this.nodeName+"\" value=\""+tohex(text001)+"\" style=\"border-left:1px solid #eeeeee\">"+isnull(text001,"&nbsp;")+"</td>"  ;
							  		  }	else toWrite += " rel=\""+tohex(text001)+"\"><td name=\""+this.nodeName+"\" value=\""+tohex(text001)+"\" nowrap>"+(nr+1)+"</td>" ;
							  	  }) ;
							  	  toWrite += "</tr>" ;
							  	} ;  
							  }
							);
							toWrite += "</table>" ;
							
							if (subject.autoCFG.autofill) {
								
								var valueToAdd = $(subject.autoCFG.lastSuggestion.eq(0)).children().eq(1).text();
								//subject.value = subjectValue.pre + valueToAdd + subject.autoCFG.multipleSeparator + subjectValue.post;
								jQuery.iAuto.selection(
									subject, 
									subjectValue.item.length != valueToAdd.length ? (subjectValue.pre.length + subjectValue.item.length) : valueToAdd.length,
									subjectValue.item.length != valueToAdd.length ? (subjectValue.pre.length + valueToAdd.length) : valueToAdd.length
								);
							}
							
							if (size > 0) {
								jQuery.iAuto.writeItems(subject, toWrite , cacheident,false);
							} else {
								jQuery.iAuto.clear();
							}
						} else {
							jQuery.iAuto.clear();
						}
					},
					url : mysoure 
				}
			);
		} 
	},
	
	writeItems : function(subject, toWrite, cachekeyname ,cacheed)
	{
		jQuery.iAuto.content.html(toWrite);
		jQuery.iAuto.items = jQuery('tr', jQuery.iAuto.content.get(0));
		jQuery.iAuto.items
			.mouseover(jQuery.iAuto.hoverItem)
		  .bind('click', jQuery.iAuto.clickItem);
		var position = jQuery.iUtil.getPosition(subject);
		var size = jQuery.iUtil.getSize(subject);
		jQuery.iAuto.helper
			.css('top', position.y + size.hb + 'px')
			.css('left', position.x +  'px')
			.css('overflow-x','hidden')
			.css('overflow-y','auto')
			.addClass(subject.autoCFG.helperClass);
		if (jQuery.iAuto.iframe) {
			jQuery.iAuto.iframe
				.css('display', 'block')
				.css('top', position.y + size.hb + 'px')
				.css('left', position.x +  'px')
				.css('width', jQuery.iAuto.helper.css('width'))
				.css('height', jQuery.iAuto.helper.css('height'));
		}
		jQuery.iAuto.selectedItem = 0;
		if (jQuery.iAuto.items.length>0) 
		  jQuery.iAuto.items.get(0).className = subject.autoCFG.selectClass;
		
		if (jQuery.iAuto.helper.css('display') == 'none') {

				var borders = jQuery.iUtil.getPadding(subject, true);
				var paddings = jQuery.iUtil.getBorder(subject, true);
				helpwidth = subject.offsetWidth - (jQuery.boxModel ? (borders.l + borders.r + paddings.l + paddings.r) : 0 ) ;
				if (helpwidth<subject.offsetWidth) helpwidth = subject.offsetWidth ;
				else helpwidth = subject.offsetWidth + 26;
				//jQuery.iAuto.helper.css('width', helpwidth + 'px');
				
			if (jQuery.iAuto.items.length>10) jQuery.iAuto.helper.css("height","200px") ;
			else jQuery.iAuto.helper.css("height","") ;
			jQuery.iAuto.helper.show();
			autoht() ;
			if (jQuery.iAuto.subject.autoCFG.onShow)
				jQuery.iAuto.subject.autoCFG.onShow.apply(jQuery.iAuto.subject, [jQuery.iAuto.helper, jQuery.iAuto.iframe]);
			
			if ((!cacheed) && (cachekeyname!="")) 
			{	
				var cachei0 = _pobj2.dropdowncache.indexOf(cachekeyname) ;
				if (cachei0<0) 
				{
					_pobj2.dropdowncache.push(cachekeyname) ;
					_pobj2.dropdowncache.push(jQuery.iAuto.helper.html()) ;
				} else
				{
					_pobj2.dropdowncache[cachei0+1] = jQuery.iAuto.helper.html() ;
				} ;
			};
		}	;
		$(subject).addClass("dropdown") ;
	},
	
	selection : function(field, start, end)
	{
		//return ;
		try
		{
		if (field.createTextRange) {
			var selRange = field.createTextRange();
			selRange.collapse(true);
			selRange.moveStart("character", start);
			selRange.moveEnd("character", - end + start);
			selRange.select();
		} else if (field.setSelectionRange) {
			field.setSelectionRange(start, end);
		} else {
			if (field.selectionStart) {
				field.selectionStart = start;
				field.selectionEnd = end;
			}
		}
		field.focus();
	} catch (e) {} finally { };
	},
	
	getSelectionStart : function(field)
	{
		if (field.selectionStart)
			return field.selectionStart;
		else if(field.createTextRange) {
			var selRange = document.selection.createRange();
			var selRange2 = selRange.duplicate();
			aint = 0 - selRange2.moveStart('character', -100000);
			if (aint>11) aint = aint - 11 ;
			return aint;
		}
	},
	
	dblclickauto:function(e)
	{
		if (!jQuery.iAuto.items) 
		{
			var mysoure1 = tostr(isnull(jQuery(jQuery.iAuto.subject).attr("source"),"")) ;
			
			var troj1 = jQuery(jQuery.iAuto.subject).parents("tr:first") ;
      var prdid11 = 0 ;
      if (troj1.length>0) 
      {
      	var tdoj1 = jQuery("td[prdid]",troj1) ;
      	if (tdoj1.length>0) prdid11 = tdoj1.attr("prdid") ;
      } ;
      try {mysoure1 = mysoure1.replace("{prdid}",prdid) ;} catch (e) {} finally { };
      try {mysoure1 = mysoure1.replace("<prdid>",prdid) ;} catch (e) {} finally { };
      
			try {mysoure1 = mysoure1.replaceAll("{ccid}",ccid) ;} catch (e) {} finally { };
		  mysoure1 = mysoure1.replaceAll("{ccid}","0") ;
		  try {mysoure1 = mysoure1.replaceAll("<ccid>",ccid) ;} catch (e) {} finally { };
		  mysoure1 = mysoure1.replaceAll("<ccid>","0") ;
		  
		  mysoure1 = mysoure1.trim() ;
		  
		  if ((mysoure1.substr(mysoure1.length-1,1)==")") && (mysoure1.substr(0,1)!='$'))  // 是函
			{
				try
			  {
			     eval("mysoure1="+mysoure1) ;
			  }  catch (e) {} finally {};
			}  ;
			

			var ispick = isnull(jQuery(jQuery.iAuto.subject).attr("pick"), "") ;  
			if (ispick!="") 
			{
			  var onvalid1 = isnull($(jQuery.iAuto.subject).attr("onvalid"),"").trim() ;
			  if (onvalid1!="") 
			  {
			  	try { _pobj2._autocompletedblclick = true ;}  catch (e) {} finally {};
			  	try
			  	{
			  		onvalid1 = onvalid1.replace("(this","(jQuery.iAuto.subject") ;
			  		eval(onvalid1) ;
			  	} catch(E){
			  	} finally {} ;
			  	try { _pobj2._autocompletedblclick = false ;}  catch (e) {} finally {};
			  } ;
			  return false ;
			} else 
			{
				jQuery.iAuto.timer = window.setTimeout(jQuery.iAuto.update,10) ;	
			  return false ;
		  } ;  
		} ;
		
	},
	clickauto:function(e)
	{
		jQuery.iAuto.noautofixed = false ;
		if (needautoclick) 
		{
			jQuery.iAuto.dblclickauto(e) ;
		} ;
	},
	assignfields:function($trobj1)
	{
		var subject = jQuery.iAuto.subject;
		if (!(subject)) return  false ;
		if ((!$trobj1) || ($trobj1.length<=0)) return  false ;
		var tdv1 = [] ;
		var i12 = 0 ; 
		$("td[name]",$trobj1).each(
		function()
		{
			tdv1.push($(this).attr("name")) ;
			tdv1.push(tostr($(this).attr("value"))) ;
		}) ;
		if (subject.id=="my_cell_edit") // istdcell
		{
			var tdobj12 = null ;
			var trobj12 = $("#ord2id_"+$(subject).attr("ord2id")) ;
		  if (trobj12.length<=0) trobj12 = $(subject).parents("tr:first") ;
		  if (trobj12.length>0)
			for (i12 = 0 ; i12 < tdv1.length ; i12 +=2)
		  {
			  tdobj12 = $("td[comefrom="+tdv1[i12]+"],td[name="+tdv1[i12]+"]",trobj12) ;
			  if (tdobj12.length>0) 
			    tdobj12.html(isnull(tdv1[i12+1],"&nbsp;"))
			    .attr("value",tohex(isnull(tdv1[i12+1],""))).addClass("tbupdatedtr").attr("ident",ident()) ;
			} ;
		} else 
		{
			for (i12 = 0 ; i12 < tdv1.length ; i12 +=2)
			{
				$value2($("#"+tdv1[i12]+",*[comefrom="+tdv1[i12]+"]"), tdv1[i12+1],"0");
			} ;  
		} ;
	},
	changeauto : function(e)
	{
		var subject = jQuery.iAuto.subject;
		if (!(subject)) return  false ;
		if (!(subject.value)) return  false ;
		
		detailssrc = tostr(isnull($(subject).attr("detailssource"),"").trim()) ;
		autosrc = tostr(isnull($(subject).attr("source"),"").trim()) ;
		
		var troj1 = jQuery(subject).parents("tr:first") ;
    var prdid11 = 0 ;
    if (troj1.length>0) 
    {
    	var tdoj1 = jQuery("td[prdid]",troj1) ;
    	if (tdoj1.length>0) prdid11 = tdoj1.attr("prdid") ;
    } ;
    try {autosrc = autosrc.replace("{prdid}",prdid) ;} catch (e) {} finally { };
    try {autosrc = autosrc.replace("<prdid>",prdid) ;} catch (e) {} finally { };
      
		try {autosrc = autosrc.replaceAll("{ccid}",ccid) ;} catch (e) {} finally { };
		autosrc = autosrc.replaceAll("{ccid}","0") ;
		try {autosrc = autosrc.replaceAll("<ccid>",ccid) ;} catch (e) {} finally { };
		autosrc = autosrc.replaceAll("<ccid>","0") ;
		
		autosrc = autosrc.trim() ;
			
		if ((autosrc.substr(autosrc.length-1,1)==")") && (autosrc.substr(0,1)!='$'))  // 是函
		{
				try
			  {
			     eval("autosrc="+autosrc) ;
			  }  catch (e) {} finally {};
		}  ;
			
		ispick = isnull($(subject).attr("pick"), "") ;
		if (ispick!="") 
		{
			autosrc = "" ;
			if (subject.id=="my_cell_edit") return  ;
		} ;
		
		
		var i = 0 ;
		var paramobj1 = autosrc ;
		
		while (paramobj1!="") 
		{
			i = paramobj1.indexOf("<") ;
			if (i>=0) 
			{
				paramobj1 = paramobj1.substr(i+1) ;
				i = paramobj1.indexOf(">") ;
				if (i>=0) 
				{
					autosrc = autosrc.replace("<"+paramobj1.substr(0,i)+">",tohex($get(paramobj1.substr(0,i)))) ;
					paramobj1 = paramobj1.substr(i+1) ;
				} else paramobj1 = "" ;
			} else paramobj1 = "" ;
		} ;
	   
		detailsid = isnull($(subject).attr("details"),"").trim() ;
		onvalid = isnull($(subject).attr("onvalid"),"").trim() ;
		invalid = isnull($(subject).attr("invalid"),"").trim() ;
		subvalue = subject.value.trim() ; 
		
		if (autosrc.indexOf("&key=")>=0) 
		  autosrc = autosrc.replace("&key=","&key="+tohex(subvalue)) ;
		  
		cachekeyname = autosrc ;
		
		$(subject).attr("validresult","0");
		if (detailsid!="")
		{
			
			if (detailssrc=="") detailssrc = autosrc ;
			if (detailssrc!="") 
			{
				if (subvalue=="") $("#"+detailsid+" *[name]").html("&nbsp;") ; else 
				{
					url111 = detailssrc ;
	        if (url111.toLowerCase().indexOf(".asp")<0) 
	        {
	          url111 = "/sys/aspx/execsql.aspx?reccount=2&sqlname="+url111+"&xml=1" ;
	          url111 = url111 +"&id03_="+ident() ;  
          } else 
          {	
            if (url111.indexOf('?') > 0) url111 = url111 + '&reccount=2&xml=1&noidd=' + ident() ;
            else url111 = url111 + '?xml=1&reccount=2&noidd=' + ident() ;
          } ;
   		    
   		    $("#"+detailsid+" *[name]").html("&nbsp;") ;
   		    
   		    if (cachekeyname!="")
   		    {
   		    	_cachev1_ = null ;
   		    	var cachei0 = _pobj2.dropdowncache.indexOf(cachekeyname+"_dataset") ;
   		    	if (cachei0>=0) _cachev1_ = _pobj2.dropdowncache[cachei0+1] ;
   			    
   			    if ((_cachev1_) && ($("NewDataSet ds1",_cachev1_).length==1)) 
   			    {
   			    	jQuery.iAuto.noautofixed = true ;
          	  $("NewDataSet ds1",_cachev1_).children().each(function()
          	  {
          		  fldvalue1 = isnull($(this).text(),"&nbsp;") ;
          		  $("#"+detailsid+" *[name="+this.nodeName+"]").html(fldvalue1) ;
          	  });
          	  return  false ;
          	} ;  
   		    };  
   		
          $.get(url111,function(xmldata)
          {
          	if ($("NewDataSet ds1",xmldata).length==1) 
          	{
          		jQuery.iAuto.noautofixed = true ;
            	$("NewDataSet ds1",xmldata).children().each(function()
          	  {
          		  fldvalue1 = isnull($(this).text(),"&nbsp;") ;
          		  $("#"+detailsid+" *[name="+this.nodeName+"]").html(fldvalue1) ;
          	  });
          	  if (cachekeyname!="") 
          	  {
          	  	var cachei0 = _pobj2.dropdowncache.indexOf(cachekeyname+"_dataset") ;
   		    	    if (cachei0<0) 
   		    	    {
   		    	    	_pobj2.dropdowncache.push(cachekeyname+"_dataset") ;
   		    	    	_pobj2.dropdowncache.push(xmldata) ;
	   		    	  } else 
	   		    	  {
	   		    	  	_pobj2.dropdowncache[cachei0+1] = xmldata  ;
	   		    	  } ;
          	  } ;	
          	} ;  
          }) ;
				}
			};
		} ;
		var mayfixed = true ;
		
		if (onvalid!="") 
		{
			valid001 = true;
			validfunc = "valid001="+onvalid ;
			if (!this) 
			{
	   	  try {eval(validfunc)}  catch (e)  { } finally {} ;
	   	  if (!valid001)
	   	  {
	   	  	 $(subject).attr("validresult","1") ;
	   	  	 if (invalid!="") 
	   	  	 {
	   	  		 	 try { subject.focus() ;}  catch (e)  { } finally {} ;
	   	  		 	 try { subject.style.backgroundColor = v15; }  catch (e)  { } finally {} ;
	   	  		 	 showfloattooltip(subject) ;
	   	  	 } ;
	   	  	 mayfixed = false ;
			  }  ;
			} ; 
		}  ;
		//alert(mayfixed+" = "+jQuery.iAuto.noautofixed+" = "+jQuery.iAuto.fixedsrc) ;
		if ((mayfixed) && (jQuery.iAuto.noautofixed==false) && (jQuery.iAuto.fixedsrc.length>10) && 
		 ($(subject).val().trim()!="") && 
		 (jQuery.iAuto.fixedsrc.indexOf("ccid=0")<0)) 
		{
			//debug("http://localhist/sys/aspx/execsql.aspx?sqlname="+
			// jQuery.iAuto.fixedsrc.replace("_autofixed","_autofixed_ins")+
			// "&extvalue="+tohex($(subject).val().trim())+"&reccount="+jQuery.iAuto.reccount) ;
			runsql(jQuery.iAuto.fixedsrc.replace("_autofixed","_autofixed_ins"),
			"extvalue="+tohex($(subject).val().trim())+"&reccount="+jQuery.iAuto.reccount) ;
		} ;
	},
	autocomplete : function(e)
	{
	
		var pressedKey = e.charCode || e.keyCode || -1;

		if (!jQuery.iAuto.items) 
		{
				if ((pressedKey==45) || (pressedKey==34) || (pressedKey==40)) 
				{
					if ((pressedKey==40))
					{
						var a1 = ""+jQuery.iAuto.subject.value ; a1 = a1.trim() ;
						
						if ((tohex(a1)=="~h`a000") || (a1=="") || (a1==selectedtext(jQuery.iAuto.subject)))
						{
							jQuery.iAuto.dblclickauto(e) ;
							//jQuery.iAuto.timer = window.setTimeout(jQuery.iAuto.update,10) ;	
					    return false ;
					  } ;
					} else 
					{
						jQuery.iAuto.dblclickauto(e) ;
					  //jQuery.iAuto.timer = window.setTimeout(jQuery.iAuto.update,10) ;	
					  return false ;
					} ;  
				} ;	
		} ;
		
		var subject = jQuery.iAuto.getFieldValues(this);
	  
	  jQuery.iAuto.noautofixed = false ;
	  
		if (/13|27|35|36|38|40|9|8|37|39|45|46|33|34/.test(pressedKey) && jQuery.iAuto.items) {
			if (window.event) {
				window.event.cancelBubble = true;
				window.event.returnValue = false;
			} else {
				e.preventDefault();
				e.stopPropagation();
			}
			if (jQuery.iAuto.selectedItem != null) 
				jQuery.iAuto.items.get(jQuery.iAuto.selectedItem||0).className = '';
			else
				jQuery.iAuto.selectedItem = -1;
			if ((pressedKey==8) || (pressedKey==37) || (pressedKey==39) || (pressedKey==46)) pressedKey = 27 ;	
		
			switch(pressedKey) {
				//enter
				case 9:
				case 13:
					if (jQuery.iAuto.selectedItem == -1)
						jQuery.iAuto.selectedItem = 0;
					var selectedItem = jQuery.iAuto.items.get(jQuery.iAuto.selectedItem||0);
					var valueToAdd = tostr(selectedItem.getAttribute('rel'));
					var trobj1 = $(selectedItem)  ;
					
					$(this).attr("modified","0") ;
					this.value = subject.pre + valueToAdd ;//+ this.autoCFG.multipleSeparator + subject.post;
					
					jQuery.iAuto.lastValue = subject.item;
					jQuery.iAuto.selection(
						this, 
						subject.pre.length + valueToAdd.length + this.autoCFG.multipleSeparator.length, 
						subject.pre.length + valueToAdd.length + this.autoCFG.multipleSeparator.length
					);
					jQuery.iAuto.assignfields(trobj1) ;
					
					jQuery.iAuto.clear();
					//if (this.scrollIntoView)
					//	this.scrollIntoView(false);
					jQuery.iAuto.noautofixed = true ;
					jQuery.iAuto.changeauto(this) ;	
					
					$(jQuery.iAuto.subject).change() ;
					return pressedKey != 13;
					break;
				//escape
				case 27:
				  $(this).attr("modified","0") ;
					this.value = subject.pre + jQuery.iAuto.lastValue ;//+ this.autoCFG.multipleSeparator + subject.post;
					this.autoCFG.lastSuggestion = null;
					jQuery.iAuto.clear();
					jQuery.iAuto.noautofixed = true ;
					//if (this.scrollIntoView)
					//	this.scrollIntoView(false);
					
					return false;
					break;
				case 33: // page up
					jQuery.iAuto.selectedItem = jQuery.iAuto.selectedItem - 10;
					if (jQuery.iAuto.selectedItem<=0) jQuery.iAuto.selectedItem = 0 ;
					
					break;
				//page down
				case 34:
					jQuery.iAuto.selectedItem = jQuery.iAuto.selectedItem + 10;
					if (jQuery.iAuto.selectedItem>=jQuery.iAuto.items.size()) 
					jQuery.iAuto.selectedItem = jQuery.iAuto.items.size() - 1;
					
					break;
				//up	
				//end
				case 35:
					jQuery.iAuto.selectedItem = jQuery.iAuto.items.size() - 1;
					
					break;
				//home
				case 36:
					jQuery.iAuto.selectedItem = 0;
					
					break;
				//up
				case 38:
					jQuery.iAuto.selectedItem --;
					if (jQuery.iAuto.selectedItem < 0)
						jQuery.iAuto.selectedItem = jQuery.iAuto.items.size() - 1;
						
					break;
				case 40:
					jQuery.iAuto.selectedItem ++;
					if (jQuery.iAuto.selectedItem == jQuery.iAuto.items.size())
						jQuery.iAuto.selectedItem = 0;
						
					break;
			}
			jQuery.iAuto.items.get(jQuery.iAuto.selectedItem||0).className = this.autoCFG.selectClass;
			if (jQuery.iAuto.items.get(jQuery.iAuto.selectedItem||0).scrollIntoView)
				jQuery.iAuto.items.get(jQuery.iAuto.selectedItem||0).scrollIntoView(false);
			if(this.autoCFG.autofill) {
				var valToAdd = tostr(jQuery.iAuto.items.get(jQuery.iAuto.selectedItem||0).getAttribute('rel'));
				//this.value = subject.pre + valToAdd + this.autoCFG.multipleSeparator + subject.post;
				if(jQuery.iAuto.lastValue.length != valToAdd.length)
					jQuery.iAuto.selection(
						this, 
						subject.pre.length + jQuery.iAuto.lastValue.length, 
						subject.pre.length + valToAdd.length
					);
			}
			return false;
		}
		return true;
	},

	
	hoverItem : function(e)
	{
		if (jQuery.iAuto.items) {
			if (jQuery.iAuto.selectedItem != null) 
				jQuery.iAuto.items.get(jQuery.iAuto.selectedItem||0).className = '';
			jQuery.iAuto.items.get(jQuery.iAuto.selectedItem||0).className = '';
			jQuery.iAuto.selectedItem = parseInt(this.getAttribute('dir'))||0;
			jQuery.iAuto.items.get(jQuery.iAuto.selectedItem||0).className = jQuery.iAuto.subject.autoCFG.selectClass;
		}
	},
  clearonblurtimer:function(event)
  {
  	window.clearTimeout(jQuery.iAuto.timer) ;
  },
  restoreonblurtimer:function(event)
  {
  	jQuery.iAuto.timer = window.setTimeout(jQuery.iAuto.clear, 500);
  },
	clickItem : function(event)
	{	
		window.clearTimeout(jQuery.iAuto.timer);
		
		event = event || jQuery.event.fix( window.event );
		event.preventDefault();
		event.stopPropagation();
		var subject = jQuery.iAuto.getFieldValues(jQuery.iAuto.subject);
		var valueToAdd = tostr(this.getAttribute('rel'));
		$(jQuery.iAuto.subject).attr("modified","0") ;
		jQuery.iAuto.noautofixed = true ;
		if (jQuery.iAuto.multi) 
		{
			var str1 = jQuery.iAuto.subject.value ;
			var str1s = str1.split(",") ;
			var i012 = str1s.indexOf(valueToAdd) ;// str2.indexOf(","+valueToAdd+",") ;
			if (i012<0) 
			{
				str1s.push(valueToAdd) ;
			} else 
			{
				str1s.splice(i012,1) ;
			} ;
			jQuery.iAuto.subject.value = str1s.join(",");
			return false ;
		} ;
		jQuery.iAuto.subject.value = subject.pre + valueToAdd ;//+ jQuery.iAuto.subject.autoCFG.multipleSeparator + subject.post;
		
		jQuery.iAuto.assignfields($(this)) ;
    
		jQuery.iAuto.lastValue = tostr(this.getAttribute('rel'));
		jQuery.iAuto.selection(
			jQuery.iAuto.subject,jQuery.iAuto.subject.value.length,jQuery.iAuto.subject.value.length) ;
		jQuery.iAuto.clear();
			
		jQuery.iAuto.changeauto(jQuery.iAuto.subject) ;
		try
         {
            jQuery.iAuto.subject.focus() ;
         }
         catch (e)
         {
         }
         finally
         {
         }
         ;
    jQuery.iAuto.noautofixed = true ;     
		$(jQuery.iAuto.subject).change() ;	
			//if (jQuery.iAuto.subject.scrollIntoView)
			//			jQuery.iAuto.subject.scrollIntoView(false);

		//danny.xu 2010-11-26 获取选项编号
			try{
					if(dropDownItem){
						var tmpfld = jQuery.iAuto.subject.id;
						var tmpArrData = [];
						$(this.children).each(function(){
							tmpArrData.push(this.value);
						});
						dropDownItem(tmpfld,tmpArrData);			//回调
						
					}
			}catch(e){};
		
		
		
		return false;
	},
  
	protect : function(e)
	{
		defaultkeypress(e,jQuery.iAuto.format) ;
		pressedKey = e.charCode || e.keyCode || -1;
		if (/13|27|35|36|38|40/.test(pressedKey) && jQuery.iAuto.items) {
		  if (window.event) {
				  window.event.cancelBubble = true;
				  window.event.returnValue = false;
		  } else {
				  e.preventDefault();
				  e.stopPropagation();
		  }
			return false;
		}
	},

	build : function(options)
	{
		if (!jQuery.iAuto.helper) {
			if (jQuery.browser.msie) {
				jQuery('body', document).append('<iframe style="display:none;position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);" id="autocompleteIframe" src="javascript:false;" frameborder="0" scrolling="no" ></iframe>');
				jQuery.iAuto.iframe = jQuery('#autocompleteIframe');
			}
			jQuery('body', document).append('<div id="autocompleteHelper" style="position: absolute; top: 0; left: 0; z-index: 800019; display: none;overflow-y:auto;padding-right:20px;"><span>&nbsp;</span></div>');
			jQuery.iAuto.helper = jQuery('#autocompleteHelper');
			jQuery.iAuto.helper.mouseover(jQuery.iAuto.clearonblurtimer).mouseout(jQuery.iAuto.restoreonblurtimer)
			.mousemove(jQuery.iAuto.clearonblurtimer).scroll(jQuery.iAuto.clearonblurtimer) ;
			jQuery.iAuto.content = jQuery('span', jQuery.iAuto.helper);
		}

		return this.each(
			function()
			{
				if (!this) return  false ;
				if (this==undefined) return  false ;
				if (!(this.tagName)) return  false ;
				if (this.tagName != 'INPUT' && this.getAttribute('type') != 'text' && this.tagName!='TEXTAREA')
					return  false;
				this.autoCFG = {};
				this.autoCFG.source = options.source;
				this.autoCFG.minchars = Math.abs(parseInt(options.minchars)||0);
				this.autoCFG.helperClass = options.helperClass ? options.helperClass : '';
				this.autoCFG.selectClass = options.selectClass ? options.selectClass : '';
				this.autoCFG.onSelect = options.onSelect && options.onSelect.constructor == Function ? options.onSelect : null;
				this.autoCFG.onShow = options.onShow && options.onShow.constructor == Function ? options.onShow : null;
				this.autoCFG.onHide = options.onHide && options.onHide.constructor == Function ? options.onHide : null;
				this.autoCFG.onHighlight = options.onHighlight && options.onHighlight.constructor == Function ? options.onHighlight : null;
				this.autoCFG.inputWidth = options.inputWidth||false;
				this.autoCFG.multiple = options.multiple||false;
				this.autoCFG.multipleSeparator = this.autoCFG.multiple ? (options.multipleSeparator||','):'';
				this.autoCFG.autofill = true ;//options.autofill ? true : false;
				this.autoCFG.delay = 1000;
				this.autoCFG.lastSuggestion = null;
				this.autoCFG.inCache = false;
				jQuery(this)
					.attr('autocomplete', 'off')
					.focus(
						function()
						{
							jQuery.iAuto.subject = this;
							jQuery.iAuto.lastValue = this.value;
							jQuery.iAuto.format = isnull($(this).attr("format"),"") ;
							jQuery.iAuto.multi = isnull($(this).attr("multi"),"1")=="0" ;
						}
					)
					.keypress(jQuery.iAuto.protect)
					.keydown(jQuery.iAuto.autocomplete)
					.click(jQuery.iAuto.clickauto)
					.dblclick(jQuery.iAuto.dblclickauto)
					.change(jQuery.iAuto.changeauto)
					.blur(
						function()
						{
							jQuery.iAuto.timer = window.setTimeout(jQuery.iAuto.clear, 200);
						}
					);
			}
		);
	}
};

jQuery.fn.Autocomplete = jQuery.iAuto.build;