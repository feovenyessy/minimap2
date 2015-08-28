var myScroll;
var minimap_minimized = false;
var current_object;
var main_object;
var origw;
var origh;
this.is_main = true;

var _self = this;

// init minimap at document load with object from xml file
function app_init() {
	var p = window.location.search;
	var res = p.substring(1, p.length); 
	eval('var obj=' + res);
	current_object = obj;
	main_object = obj;
	app_start('first');
}

function app_start(mode) {
	
	if (!_self.is_main) {
		$('#close img').attr('src','img/back.png');
		$('#close img').unbind();
		$('#close img').click(function(){
			_self.is_main = true;
			myScroll.destroy();
			myScroll = null;
			app_start('second');
		});
		$('.ikon').remove();
	} else {
		current_object = main_object;
		$('#close img').attr('src','img/close.png');
		$('#close img').unbind();
		$('#close img').click(function(){
			document.location='index.html';
		});
	}
	
	var url = current_object.src;

	window.scrollTo(0,0);
	$('body').css('overflow','hidden');
	$('#container').css('display','block');	
	
	//$('#kep').load(mode,function () {
	$("#kep").one("load", function() {

		if (mode=='first') {
			main_origw = $("#kep").width();
			main_origh = $('#kep').height();						
		}
	
		origw = $("#kep").width();
		origh = $('#kep').height();			
		
		align_image();
		
		myScroll = new IScroll('#wrapper', {
			zoom: true,
			scrollX: true,
			scrollY: true,
			mouseWheel: true,
			wheelAction: 'zoom',
			bounce: false,
			freeScroll: true,
			momentum: false
		});
		myScroll.on('scrollStart', update_minimap);
		myScroll.on('zoomStart', update_minimap);
		myScroll.on('scrollEnd', update_minimap);
		myScroll.on('zoomEnd', update_minimap);
		
		if (_self.is_main) create_icons();
		init_minimap();
		
		window.addEventListener("resize", function() {reorient()}, false);

	}).attr("src", url);
}



function init_minimap() {
	update_close_btn();
	if (!minimap_minimized) {
		$('#thumb_container').empty();
		$('#thumb_container').append('<div id="mask"></div>');
		$('#thumb_container').append('<div id="resize2small"><img src="img/resize-to-small.png" /></div>');
		var thumb = '<img id="thumb" src="'+current_object.src+'" />';
		$('#thumb_container').append(thumb);
		$("#thumb").one("load",function(){
			$('#thumb_container').show();
			$('#thumb_container').height($("#thumb").height());
			$('#thumb_container').css('top',($(window).height()-$('#thumb_container').height()));
			$('#thumb_container').css('left',($(window).width()-$('#thumb_container').width()));
			
			$('#resize2small').unbind();
			$('#resize2small').click(function (){
				$(this).remove();
				$('#thumb_container').hide();
				update_resize_icon();		
				minimap_minimized = true;
			});
			update_minimap();	
		});
		
	} else {
		update_resize_icon();
		update_minimap();
	}
}

function align_image() {
	if (origw>=origh) {
		$("#kep").css("width", '100%');	
		$("#kep").css("height", 'auto');	
		if ($("#kep").height()>=$(window).height()) {
			$("#kep").css('height',$(window).height());
			$("#kep").css("width", 'auto');		
		}
	} else {
		$("#kep").css("height", '100%');	
		$("#kep").css("width", 'auto');	
		if ($("#kep").width()>=$(window).width()) {
			$("#kep").css('width',$(window).width());
			$("#kep").css("height", 'auto');	
		}
	}
}

function update_resize_icon() {
	var top = $(window).height() - $("#resize2large").height();
	var left = $(window).width() - $("#resize2large").width();
	$("#resize2large").css('top',top);
	$("#resize2large").css('left',left);	
	$("#resize2large").css('display','block');	
	$("#resize2large").unbind();
	$("#resize2large").click(function() {
		$(this).css('display','none');	
		minimap_minimized = false;
		init_minimap();					
	});	
}



function zoom_start() {
	hide_icons();
}


function scroll_start() {
	hide_icons();
}


/* Frissíti a térképet panning vagy zoom esetén */
function update_minimap() {
	var left = -(parseInt($('#mask').width()*myScroll.x/$(window).width()));
	var top = -(parseInt($('#mask').height()*myScroll.y/$(window).height()));
	var width = parseInt($('#thumb_container').width() / (myScroll.scrollerWidth/$(window).width() ));
	var height = parseInt($('#thumb_container').height() / (myScroll.scrollerHeight/$(window).height() ));
	
	console.log('update to (L,T,W,H): ' + left + ',' + top + ',' + width + ',' + height);
	
	$('#mask').css('left', left + 'px');
	$('#mask').css('top', top + 'px');
	$('#mask').width(width) ;
	$('#mask').height(height) ;
	if (_self.is_main) update_icons();
}

/* Kép középre rendezése */
function center_image() {
	var left = parseInt(($(window).width()-$('#kep').width())/2);
	var top = parseInt(($(window).height()-$('#kep').height())/2);
	$('#kep').css('left',left + 'px');
	$('#kep').css('top',top + 'px');
}


/* Elforgatás/átméretezés esetén */
function reorient() {
	$('#container').width($(window).width());
	$('#container').height($(window).height());
	align_image();
	if (_self.is_main) update_icons();
	update_close_btn();
	init_minimap();
	//myScroll.scrollTo(0,0);
}

/* Bezáró/visszalépő gomb újrapozícionálása */
function update_close_btn() {
	$('#close').css('display','none');
	$('#close').css('left',parseInt($(window).width()-$('#close').width()) + 'px');
	$('#close').css('display','block');
}



/* ikonok létrehozása */
function create_icons() {
	console.log('CREATE ICONS');
	if (current_object.icons) {
		var arr = current_object.icons;
		var len = arr.length;
		
		for (var i=0;i<len;i++){
			
			// ikon hozzaadasa
			var id='icon_'+(i+1)+'';
			
			var ikon = '<img id="'+id+'" class="ikon" src="img/tooltip.png" />';
			$('#wrapper').append(ikon);
			
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
							myScroll.destroy();
							myScroll = null;
							current_object = e.data;
							_self.is_main = false;
							app_start('second');
						});
						
					}
					break;
				default:
					break;
			}
			
		}
		if (_self.is_main) update_icons();
	}
	
}

/* ikon pozíciók frissítése */
function update_icons() {
	if (current_object.icons) {
		var arr = current_object.icons;
		var len = arr.length;
		
		var kep = document.getElementById('kep').getBoundingClientRect();
		
		for (var i=0;i<len;i++){
			
			var id='icon_'+(i+1);
			
			var new_x = parseInt(arr[i].x * kep.width/main_origw) + myScroll.x;
			var new_y = parseInt(arr[i].y * kep.height/main_origh) + myScroll.y;
			
			$('#'+id).css('left',new_x + 'px');
			$('#'+id).css('top',new_y + 'px');
			
			$('#'+id).css('width','24px');
			$('#'+id).css('height','24px');
			
		}
		show_icons();	
	} 	
}

function show_icons() {
	$('.ikon').css('display','block');
}

function hide_icons() {
	//$('.ikon').css('display','none');
}
