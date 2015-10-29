var myMinimap;
var minimap_minimized = false;
var current_minimap_object;
var main_minimap_object;
var origw;
var origh;
var iconsize=36;
this.is_main = true;
var _minimap = this;
var base = '';
var storedir = 'data/';

var base_html = '<div id="close"><img src="'+base+'img/close.png" /></div>';
base_html += '<div id="thumb_container"></div>';
base_html += '<div id="minimap-wrapper">';
base_html += '<img id="kep" src="'+base+'img/ajax-loader.gif" />';
base_html += '</div>';
base_html += '<div id="resize2large"><img src="'+base+'img/resize-to-large.png" /></div>';
$('#minimap-container').html(base_html);

function show_minimap(obj) {
	var obj = get_xml_object(obj);	
}

function get_xml_object(object_id) {
	$.get(storedir + "minimap-data.xml",function(data){
		parseData(object_id,data)
	});
}

function parseData(object_id,data) {

	var return_object = {identifier: object_id};
	$(data).find('object').each(function() {
		if ($(this).attr("identifier")==object_id) {
			return_object.src = $(this).attr("src");
			var icons = [];
			
			// tooltipek
			$(this).children().find("tooltip").each(function() {
				var tooltip = {}
				tooltip.x = $(this).attr('x');
				tooltip.y = $(this).attr('y');
				tooltip.txt = $(this).attr('txt');
				tooltip.type = "tooltip";
				icons.push(tooltip);
			});
			
			// popupok
			$(this).children().find("popup").each(function() {
				var popup = {}
				popup.x = $(this).attr('x');
				popup.y = $(this).attr('y');
				popup.src = $(this).attr('src');
				popup.type = "popup";
				popup.icons = []; // lol. még jó, hogy nem kérték... :)))
				
				// tooltipek a popupban
				$(this).children().find("subtip").each(function() {
					var tooltip = {};
					tooltip.x = $(this).attr('x');
					tooltip.y = $(this).attr('y');
					tooltip.txt = $(this).attr('txt');
					tooltip.type = "tooltip";
					popup.icons.push(tooltip);
				});
				
				icons.push(popup);
			});
			
			return_object.icons = icons;
			
			current_minimap_object = return_object;
			main_minimap_object = return_object;
			
			app_start('first');
		} 		
	});

}




function app_start(mode) {
	$('#minimap-container').html(base_html);
	if (!_minimap.is_main) {
		$('#close img').attr('src',base+'img/back.png');
		$('#close img').unbind();
		$('#close img').click(function(){
			_minimap.is_main = true;
			myMinimap.destroy();
			myMinimap = null;
			app_start('second');
		});
	} else {
		current_minimap_object = main_minimap_object;
		$('#close img').attr('src',base+'img/close.png');
		$('#close img').unbind();
		$('#close img').click(function(){
			_minimap.is_main = true;
			myMinimap.destroy();
			myMinimap = null;
			$('#minimap-container').html('');
			$('#minimap-container').css('display','none');	
			$('body').css('overflow','auto');
		});
	}

	window.scrollTo(0,0);
	$('body').css('overflow','hidden');
	$('#minimap-container').css('display','block');
	
	var kit = current_minimap_object.src.replace(/^[^\.]*?\./gi,'');
	var file = current_minimap_object.src.replace(/\.[^\.]*?$/gi,'');
	var url = storedir + file + '_big.' + kit;
	
	$("#kep").hide().one("load", function() {
		window.addEventListener("resize", function() {reorient()}, false);
	}).attr("src", url).show();

	// only call init_minimap, when the image is really loaded!
	// and get the correct original image size as well
	$(document).on("image_is_really_loaded",function(ev,data) {

		origw = $("#kep").width();
		origh = $('#kep').height();				
		main_origw = data.orig_width;
		main_origh = data.orig_height;
		
		align_image();
		adjustImg();
		
		myMinimap = new IScroll('#minimap-wrapper', {
			zoom: true,
			zoomMax: 3,
			scrollX: true,
			scrollY: true,
			bounce: false,
			freeScroll: true,
			momentum: false,
			useTransition:true
		});
		create_icons();
		
		myMinimap.on('scrollStart', adjustImg);
		myMinimap.on('zoomStart', adjustImg);
		myMinimap.on('scrollEnd', update_minimap);
		myMinimap.on('zoomEnd', update_minimap);
		
		init_minimap();
		
	});
	
	get_real_orig_size(url); // this will trigger 'image_is_really_loaded' event with real sizes
}


function adjustImg() {
	hide_icons();
	left_offset();
}

function left_offset() {
	var wrapper_left = 0;
	var kep = document.getElementById('kep').getBoundingClientRect();
	if ($(window).width()>=kep.width) {
		wrapper_left = parseInt($(window).width()/2-kep.width/2);
	}
	$('#kep').css('margin-left',wrapper_left + 'px');
	return wrapper_left;
}

function init_minimap() {
	update_close_btn();
	if (!minimap_minimized) {
		$('#thumb_container').empty();
		$('#thumb_container').append('<div id="mask"></div>');
		$('#thumb_container').append('<div id="resize2small"><img src="'+base+'img/resize-to-small.png" /></div>');
		var thumb = '<img id="thumb" src="'+storedir+current_minimap_object.src+'" />';
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



/* Frissíti a térképet panning vagy zoom esetén */
function update_minimap() {
	hide_icons();
	var left = -(parseInt($('#mask').width()*myMinimap.x/$(window).width()));
	var top = -(parseInt($('#mask').height()*myMinimap.y/$(window).height()));
	var width = parseInt($('#thumb_container').width() / (myMinimap.scrollerWidth/$(window).width() ));
	var height = parseInt($('#thumb_container').height() / (myMinimap.scrollerHeight/$(window).height() ));
	$('#mask').css('left', left + 'px');
	$('#mask').css('top', top + 'px');
	$('#mask').width(width) ;
	$('#mask').height(height) ;
	update_icons();
}


/* Elforgatás/átméretezés esetén */
function reorient() {
	align_image();
	adjustImg();
	update_icons();
	update_close_btn();
	init_minimap();
}

/* Bezáró/visszalépő gomb újrapozícionálása */
function update_close_btn() {
	$('#close').css('display','none');
	$('#close').css('left',parseInt($(window).width()-$('#close').width()) + 'px');
	$('#close').css('display','block');
}



/* ikonok létrehozása */
function create_icons() {
	$('.ikon').remove();
	if (current_minimap_object.icons) {
		var arr = current_minimap_object.icons;
		var len = arr.length;
		
		for (var i=0;i<len;i++){
			
			// ikon hozzaadasa
			var id='icon_'+(i+1)+'';
			
			var ikon = '<img id="'+id+'" class="ikon" src="'+base+'img/tooltip.png" />';

			$('#minimap-wrapper').append(ikon);
			
			switch (arr[i].type) {
				case 'tooltip': 
					$('#'+id).attr('src',base+'img/tooltip.png');
				
					$('#'+id).qtip({
						content: {
							text: parse_tooltip(arr[i].txt)
						},
						show: {event: 'touchstart'},
						hide: {event: 'unfocus'},
						position: {
							my: 'top center',
							at: 'bottom center',
							adjust: {
								method: 'flip invert'
							},
							viewport: $("#minimap-wrapper")
						}
					});
					
					break;
				case 'popup': 
					$('#'+id).attr('src',base+'img/popup.png');
					$('#'+id).on('touchstart',arr[i], function(e){
						myMinimap.destroy();
						myMinimap = null;
						current_minimap_object = e.data;
						_minimap.is_main = false;
						app_start('second');
					});
				
					break;
				default:
					break;
			}
			
		}
		update_icons();
	}
	
}

/* ikon pozíciók frissítése */
function update_icons() {
	
	var kep = document.getElementById('kep').getBoundingClientRect();
	
	wrapper_left = left_offset();
	
	if (current_minimap_object.icons) {
		var arr = current_minimap_object.icons;
		var len = arr.length;
		
		for (var i=0;i<len;i++){
			
			var id='icon_'+(i+1);
			
			var arany =  kep.height/main_origh;
			
			var new_x = parseInt(arr[i].x * kep.width/main_origw) + myMinimap.x;
			var new_y = parseInt(arr[i].y * kep.height/main_origh) + myMinimap.y;
		
			$('#'+id).css('width',iconsize*arany + 'px');
			$('#'+id).css('height',iconsize*arany + 'px');

			$('#'+id).css('left',new_x  + wrapper_left + 'px');
			$('#'+id).css('top',new_y + 'px');
			
		}
		show_icons();	
	} 	
}

function parse_tooltip(txt) {
	txt = txt.replace(/#url:#([^#]*?)#/gi, '<a href="javascript:void(0)" onclick="window.open(\'$1\', \'_system\');">');
	txt = txt.replace(/#:url#/gi, '</a>');
	txt = txt.replace(/#ul:#/gi, '<ul>');
	txt = txt.replace(/#li:#/gi, '<li>');
	txt = txt.replace(/#:li#/gi, '</li>');
	txt = txt.replace(/#:ul#/gi, '</ul>');
	return txt;
}

function show_icons() {
	$('.ikon').css('display','block');
}

function hide_icons() {
	$('.ikon').css('display','none');
	hide_tooltips();
}

function hide_tooltips() {
	$('.qtip').qtip('hide');
}

function get_real_orig_size(imgSrc) {
    var newImg = new Image();
    newImg.onload = function() {
	  $(document).trigger("image_is_really_loaded",[{orig_width:newImg.width,orig_height:newImg.height}]);
    }
    newImg.src = imgSrc; // this must be done AFTER setting onload
}