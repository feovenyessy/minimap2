var myScroll;
var minimap_minimized = false;
var current_object;
var origw;
var origh;

// init minimap at document load with object from xml file
function minimap_init() {
	var p = window.location.search;
	var res = p.substring(1, p.length); 
	eval('var obj=' + res);
	current_object = obj;
	minimap_start();
}

function minimap_start() {
	var url = current_object.src;
	window.scrollTo(0,0);
	$('body').css('overflow','hidden');
	$('#kep').attr('src',url);
	$('#container').css('display','block');	
	$('#kep').load(function () {
		origw = $("#kep").width();
		origh = $('#kep').height();
		$("#kep").css("width", '100%');
		$("#kep").css("height", '100%');
		myScroll = new IScroll('#wrapper', {
			zoom: true,
			scrollX: true,
			scrollY: true,
			mouseWheel: true,
			wheelAction: 'zoom'
		});
		myScroll.on('scrollEnd', function(e){update_minimap('scroll')});
		myScroll.on('zoomEnd', function(e){update_minimap('zoom')});
		init_minimap();
		// /
		var ikon = '<img id="ikonka" class="ikon" src="img/tooltip.png" />';
		$('#wrapper').append(ikon);
		$('#ikonka').css('left','100px');
		$('#ikonka').css('top','100px');
		// /
	});
}



function init_minimap() {
	if (!minimap_minimized) {
		$('#thumb_container').empty();
		$('#thumb_container').append('<div id="mask"></div>');
		$('#thumb_container').append('<div id="resize2small"><img src="img/resize-to-small.png" /></div>');
		var thumb = '<img id="thumb" src="'+current_object.src+'" />';
		$('#thumb_container').append(thumb);
		$("#thumb").load(function(){
			$('#thumb_container').show();
			$('#thumb_container').height($("#thumb").height());
			$('#thumb_container').css('top',($(window).height()-$('#thumb_container').height()));
			$('#thumb_container').css('left',($(window).width()-$('#thumb_container').width()));
			
			$('#resize2small').unbind();
			$('#resize2small').click(function (){
				$(this).remove();
				$('#thumb_container').hide();
				update_resize_icon();		
				_minimap_minimized = true;
			});
		});
		//update_map(_self.matrix_cache);
	} else {
		update_resize_icon();
	}
	
}


function update_resize_icon() {
	var top = $(window).height() - $("#resize2large").height();
	var left = $(window).width() - $("#resize2large").width();
	$("#resize2large").css('top',top);
	$("#resize2large").css('left',left);	
	$("#resize2large").css('display','block');	
}



/* Frissíti a térképet panning vagy zoom esetén */
function update_minimap(etype) {
	

	

	console.log('myScroll wid:' + myScroll.scrollerWidth + ', height: ' + myScroll.scrollerHeight );
	console.log('kep wid:' + origw + ', height: ' + origh );
	
	
	// mask meret frissitese
	$('#mask').width(parseInt($('#thumb_container').width() / (myScroll.scrollerWidth/$(window).width() ))) ;
	$('#mask').height(parseInt($('#thumb_container').height() / (myScroll.scrollerHeight/$(window).height() ))) ;

	console.log('thumb container: ' + $('#thumb_container').width() + ';' + $('#thumb_container').height());
	console.log('mask wid:' + $('#mask').width() + ', height: ' + $('#mask').height() );
	

	
	
	
	
	//var zoomfactor = parseFloat(matrix[0]);
	//var kep = document.getElementById('kep').getBoundingClientRect();
	
	// mask meret frissitese
	//$('#mask').width(parseInt($('#thumb_container').width() / zoomfactor)) ;
	//$('#mask').height(parseInt($('#mask').width() * parseFloat($('#container').height()/$('#container').width())));
	
	
	/*
	// mask pozicio középre helyezése (mátrix origója a kép közepe)
	var kozepX = parseInt($('#thumb_container').width()/2-$('#mask').width()/2);
	var kozepY = 0;
	
	// mask eltolása
	var offsetX = parseInt(($('#thumb_container').width()*matrix[1])/kep.width);
	var nagyut = parseInt(kep.top);
	var kismax = parseInt($('#thumb_container').height()-$('#mask').height());
	var nagymax = parseInt(kep.height-$('#container').height());
	var offsetY = parseInt(nagyut*kismax/nagymax);
	
	$('#mask').css('left',kozepX - offsetX);
	$('#mask').css('top',kozepY - offsetY);

	$(document).trigger( "imageUpdateEvent");
	*/
	
	/*
	var str = 'mask x: ' + $('#mask').css('left') + '<br>mask y: ' + $('#mask').css('top') + '<br>mask width: ' + $('#mask').width() + '<br>mask height: ' +  $('#mask').height() + '<br>';
	str += 'kep x: ' + parseInt(kep.left) + '<br>kep y: ' + parseInt(kep.top) + '<br>kep width: ' + parseInt(kep.width) + '<br>kep height:' +  parseInt(kep.height) + '<br>';
	str += 'container width: ' + $('#container').width() + '<br>container height: ' + $('#container').height() + '<br>thumb container width: ' + $('#thumb_container').width() + '<br>thumb container height: ' + $('#thumb_container').height() + '<br>';
	str += 'matrix: '+matrix+'<br>offsety:'+offsetY+'nagymax: ' + nagymax + '<br>kismax: '+kismax+'<br>nagyut: '+nagyut+ '<br>';
	
	$('#debug').html(str);
	*/
}






















 // old minimap 
 
function init(object,mode) {
	
	if (mode!='main') {
		$('#close img').attr('src','img/back.png');
		$('#close img').unbind();
		$('#close img').click(function(){
			destroy();
			init(_self.main_object,'main');
		});
		_self.is_main = false;
	} else {
		_self.main_object = object;
		$('#close img').attr('src','img/close.png');
		$('#close img').unbind();
		$('#close img').click(function(){
			destroy();
			document.location='index.html';
		});
		_self.is_main = true;
	}
	
	$('#container').width($(window).width());
	$('#container').height($(window).height());
	
	$('#close img').load(function(){
		update_close_btn();
	});
	
	$("#kep").panzoom("reset");	
	
	// kép hozzáadása
	load_image(object.src);
	
	// only proceed if image is loaded
	$("#kepbmp").load(function(){
		
		// start panzoom
		var panzoom = $("#kep").panzoom({contain: 'invert', minScale: 1, maxScale: 5});	
	
		// mousewheel zoom support for desktops
		$("#container").on("mousewheel",function(e){
			e.preventDefault();
			if (parseInt(e.deltaY)==1) {
				$("#kep").panzoom("zoom");
			} else {
				$("#kep").panzoom("zoom",true);
			}
		});
		
		$('#container').css('display','block');	
		
		// start panzoom update listener
		//panzoom.on('panzoomchange', function(e, panzoom, matrix, changed) {
			//update_map([matrix[3],matrix[4],matrix[5]]);	
		//});
		
		panzoom.on("panzoomchange", function( e, panzoom, matrix ) {
			update_map([matrix[3],matrix[4],matrix[5]]);
		});
		
		panzoom.on("panzoomend", function( e, panzoom, matrix ) {
			_self.matrix_cache = matrix;
			refresh_image_hack();
		});
		
		if (_self.is_main) update_icons();
		update_minimap();
		update_map([1,0,0]);
		update_close_btn();
		
		$("#resize2large").unbind();
		$("#resize2large").click(function() {
			$(this).css('display','none');	
			_self.minimap_minimized = false;
			update_minimap();					
		});	
	 });
	
	
	window.addEventListener("orientationchange", function() {

	}, false);
	
	window.addEventListener("resize", function() {
		reorient()
	}, false);

}



function update_close_btn() {
	$('#close').css('left',$(window).width()-$('#close').width());
}



function reorient() {
	$('#container').width($(window).width());
	$('#container').height($(window).height());
	$("#kep").panzoom("resetDimensions");
	$("#kep").panzoom("reset");	
	_self.matrix_cache = [0,0,0];
	update_minimap();
	update_close_btn();
	load_image(_self.current_src);
	if (_self.is_main) {
		update_icons();
	} 
}


function load_image(src) {
	_self.current_src = src;
		$('#kep').empty();
	var kep = '<img id="kepbmp" src="'+src+'" />'
	$('#kep').append(kep);
	$("#kepbmp").load(function(){
		if (_self.is_main) update_icons();
	});
}





function refresh_image_hack() {
	// --- hack for refresh image ----
	$('#kep').hide();
	$('#kep').get(0).offsetHeight; 
	$('#kep').show();
	$('.ikon').qtip('hide');
	// --- hack for refresh image ----		
}








/* ikonok frissítése */
function update_icons() {
	var object = _self.main_object;
	if (object.icons) {
		var arr = object.icons;
		var len = arr.length;
		var kepbmp = document.getElementById('kepbmp');
		var kep = document.getElementById('kep').getBoundingClientRect();
		
		for (var i=0;i<len;i++){
			
			// ikon hozzaadasa
			var id='popup_icon_'+(i+1)+'';
			
			var ikon = '<img id="'+id+'" class="ikon" src="img/tooltip.png" />';
			$('#kep').append(ikon);
			
			switch (arr[i].type) {
				case 'tooltip': 
					$('#'+id).attr('src',"img/tooltip.png");
					
					$('#'+id).qtip({
						content: {
							text: arr[i].txt
						},
						show: {event: 'mouseenter click touchstart'},
						hide: {event: 'mouseleave imageUpdateEvent'}
					});
					
					break;
				case 'popup': 
					$('#'+id).attr('src',"img/popup.png");
					if (arr[i].link) {
						$('#'+id).on('click touchstart',arr[i].link, function(e){
							init(e.data,'sub');
						});
						
					}
					break;
				default:
					break;
			}
			
			
			// ikon pozicio szamitasa
			var new_x = parseInt((arr[i].x * $('#kep').width())/_self.main_object.orig_width);
			var new_y = parseInt((arr[i].y * $('#kep').height())/_self.main_object.orig_height);
			
			$('#'+id).css('left',new_x);
			$('#'+id).css('top',new_y);
			
			$('#'+id).css('width','16px');
			$('#'+id).css('height','16px');
			
		}
	}
}


function destroy() {
	$("#kep").empty();
	$("#kep").panzoom('reset');
	$("#debug").empty();
	$("#thumb_container").empty();
	$('#container').css('display','none');
}