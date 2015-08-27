var myScroll;
var minimap_minimized = false;
var current_object;
var main_object;
var origw;
var origh;
this.is_main = true;

var _self = this;

// init minimap at document load with object from xml file
function minimap_init() {
	var p = window.location.search;
	var res = p.substring(1, p.length); 
	eval('var obj=' + res);
	current_object = obj;
	main_object = obj;
	minimap_start('first');
}

function minimap_start(mode) {
	
	if (!_self.is_main) {
		$('#close img').attr('src','img/back.png');
		$('#close img').unbind();
		$('#close img').click(function(){
			_self.is_main = true;
			myScroll.destroy();
			myScroll = null;
			minimap_start('second');
		});
		$('.ikon').remove();
	} else {
		current_object = main_object;
		$('#close img').attr('src','img/close.png');
		$('#close img').unbind();
		$('#close img').click(function(){
			document.location='index.html';
		});
		create_icons(); 
	}
	
	var url = current_object.src;
	window.scrollTo(0,0);
	$('body').css('overflow','hidden');
	$('#kep').attr('src',url);
	$('#container').css('display','block');	
	$('#kep').load(mode,function () {
		if (mode=='first') {
			origw = $("#kep").width();
			origh = $('#kep').height();			
		}
		
		if (origw>=origh) {
			$("#kep").css("width", '100%');	
			
		} else {
			$("#kep").css("height", '100%');	
		}
		
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
		myScroll.on('scrollStart', function(){scroll_start()});
		myScroll.on('zoomStart', function(){zoom_start()});
		myScroll.on('scrollEnd', function(){scroll_end()});
		myScroll.on('zoomEnd', function(){zoom_end()});
		
		init_minimap();
		
		window.addEventListener("resize", function() {reorient()}, false);

	});
}



function init_minimap() {
	update_close_btn();
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
				minimap_minimized = true;
			});
		});
		scroll_end();
		zoom_end();
	} else {
		update_resize_icon();
	}
	if(_self.is_main) update_icons();
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

/* Frissíti a térképet panning esetén */
function scroll_end() {
	$('#mask').css('left',-(parseInt($('#mask').width()*myScroll.x/$(window).width())) + 'px');
	$('#mask').css('top',-(parseInt($('#mask').height()*myScroll.y/$(window).height())) + 'px');
	if (_self.is_main) update_icons();
}

/* Frissíti a térképet zoom esetén */
function zoom_end() {
	$('#mask').width(parseInt($('#thumb_container').width() / (myScroll.scrollerWidth/$(window).width() ))) ;
	$('#mask').height(parseInt($('#thumb_container').height() / (myScroll.scrollerHeight/$(window).height() ))) ;
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
	init_minimap();
	if (_self.is_main) update_icons(); 
}

/* Bezáró/visszalépő gomb újrapozícionálása */
function update_close_btn() {
	$('#close').css('left',parseInt($(window).width()-$('#close').width()) + 'px');
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
							minimap_start('second');
						});
						
					}
					break;
				default:
					break;
			}
			
		}
	}
	
}

/* ikon pozíciók frissítése */
function update_icons() {
	if (current_object.icons) {
		var arr = current_object.icons;
		var len = arr.length;
		
		var kep = document.getElementById('kep').getBoundingClientRect();
		console.log('kep width:' + kep.width + ', kep height:' + kep.height);
		console.log('origw:' + origw + ', origh:' + origh);
		
		for (var i=0;i<len;i++){
			
			var id='icon_'+(i+1);
			
			var new_x = parseInt(arr[i].x * kep.width/origw) + myScroll.x;
			var new_y = parseInt(arr[i].y * kep.height/origh) + myScroll.y;
			
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
	$('.ikon').css('display','none');
}
