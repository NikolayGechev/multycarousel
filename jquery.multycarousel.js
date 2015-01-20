/*
 *
 * Multycarousel
 *
 *
 * Date: 23 / 01 / 2014
 * Depends on library: jQueryUI
 * 
 */

;
(function($) {
	$.mult = $.mult || {};

	$.mult.slider = {
		options : {
			first_slide_position : {
				top : 0,
				left : 0
			},
			drop_css : {},
			slide_marginLeft : 0,
			display : 1
		},
		sliders : []
	};

	/*
	 * Make dragable
	 * 
	 * Carousel
	 */

	function Carousel(root, options) {

		this.carousel = {};
		that = this;

		function add_identifiers() {

			$(root).addClass('ms-slider_container');

			var ul = $('ul:first', root);

			ul.addClass('ms-slider_ul');

			ul.parent().addClass('ms-viewport');

			ul.parent().parent().addClass('ms-viewport_container');

			$('li', ul).each(function(i, el) {
				el.id = i + 1;
			});

		}

		function initialize() {

			setInterval(function() {
				viewNumNext(caroucelValues(root).numNext);
				viewNumPrev(caroucelValues(root).numPrev);
			}, 100);

			add_identifiers();

			$("li", root)
					.draggable(
							{

								cancel : ".nodrag", // clicking an icon won't
													// initiate dragging
								helper : "clone",
								cursor : "move",
								start : function(event, ui) {

									$(this).addClass('ms-drag_view');
									this.old_position_left = 0;

								},
								stop : function(e, ui) {

								},
								drag : function(e, ui) {

									var diff = $(ui.helper).position().left
											- this.old_position_left;

									if (this.old_position_left != 0) {
										$("li", root).not(
												'.ui-draggable-dragging').css({
											left : "+=" + diff
										});
									}
									this.old_position_left = $(ui.helper)
											.position().left;

								},
								revert : function(r) {

									if (r) {
										var id = $(this).attr('id');

										if (is_viewable_on_this(id)) {
											if ($(this).parents(
													'.ms-slider_container')
													.attr('id') != ($(r)
													.attr('id'))) {
												// drop
												$(this).switchClass(
														'ms-view ms-drag_view',
														'ms-display_none');
											} else {
												// back from inside
												$(this).removeClass(
														'ms-drag_view');
											}
										}
									} else {
										// back from outside
										$(this).removeClass('ms-drag_view');
									}
								}
							});

			$(root)
					.droppable(
							{

								accept : "ul.ms-slider_ul > li",

								drop : function(event, ui) {

									var element = $(ui.draggable);
									var id = $(element).attr('id');

									if (!is_viewable_on_this(id)) {
										$('ul:first > li#' + id, root)
												.switchClass('ms-drop_view',
														'ms-view');
									}

								},
								over : function(event, ui) {

									var element = $(ui.draggable);
									var id = $(element).attr('id');

									if (!is_viewable_on_this(id)) {
										var befor_drop = $('ul:first > li#'
												+ id, root);
										$
												.when(
														befor_drop
																.addClass('ms-drop_view'))
												.then(
														function() {
															var diff = ui.draggable
																	.offset().left
																	- befor_drop
																			.offset().left;
															$('li', root)
																	.animate(
																			{
																				left : "+="
																						+ diff
																			});
														});
									}

								},
								out : function(event, ui) {

									var element = $(ui.draggable);
									var id = $(element).attr('id');

									if (!is_viewable_on_this(id)) {
										$('ul:first > li#' + id, root)
												.switchClass(
														'ms-view ms-drop_view',
														'ms-display_none');
									}

								}
							});
		}

		function is_viewable_on_this(id) {
			return !!$('ul:first > li#' + id + '.ms-view', root).length;
		}

		function caroucelValues(root) {
			var bg_left, bg_width, bg_right, first, first_left, begin, end, all_elements_width, last_right, width_map;

			function getNumNext() {
				var num = 0, sum = 0, n = width_map.length, adition, next_distance = 0;

				if (end < 0) {
					for (k = n - 1; k > 0; k--) {
						if (sum < Math.abs(end)) {
							adition = width_map[k]
									+ parseInt(options.slide_marginLeft)
							sum += adition;
						} else {
							break;
						}
						num++;
					}
					next_distance = sum - adition + end
							- options.slide_marginLeft;
				}

				return {
					'num' : num,
					'next_distance' : next_distance
				}
			}

			function getNumPrev() {
				var num = 0, sum = 0, adition, prev_distance = 0;

				if (begin < 0) {
					for ( var k in width_map) {

						if (sum < Math.abs(begin)) {
							adition = width_map[k]
									+ parseInt(options.slide_marginLeft);
							sum += adition;
						} else {
							break;
						}
						num++;

					}
					prev_distance = sum - adition + begin
							- options.slide_marginLeft;

				}

				return {
					'num' : num,
					'prev_distance' : Math.abs(prev_distance)
				};
			}

			bg_left = parseInt($('.ms-viewport_container', root).offset().left);
			bg_width = parseInt($('.ms-viewport_container', root).width());
			bg_right = parseInt(bg_left + bg_width);

			first = $('.ms-slider_ul > li.ms-view:first', root);

			if (first.length == 1) {
				first_left = parseInt(first.offset().left);
				begin = first_left - bg_left;
				width_map = [];

				var tmp = 0;
				var el;

				$.each($('.ms-view', root), function(k, v) {
					tmp += $(v).width() + parseInt(options.slide_marginLeft);
					el = v;
					width_map[k] = $(v).width();
				});

				all_elements_width = tmp;
				last_right = first_left + all_elements_width
						- options.slide_marginLeft;
				end = bg_right - last_right;

			}

			return {
				'begin' : begin,
				'end' : end,
				'widthMap' : width_map,
				'numPrev' : getNumPrev().num,
				'numNext' : getNumNext().num,
				'prevDistance' : getNumPrev().prev_distance,
				'nextDistance' : getNumNext().next_distance,
			};
		}

		function viewNumPrev(num) {
			$('.ms-prev_navigator > .ms-slide_counter', root).text(num);
		}

		function viewNumNext(num) {
			$('.ms-next_navigator > .ms-slide_counter', root).text(num);
		}

		$('.ms-prev_navigator > .ms-slide', root).click(function() {

			$('li', root).animate({
				left : "+=" + caroucelValues(root).prevDistance
			});

		});

		$('.ms-next_navigator > .ms-slide', root).click(function() {

			$('li', root).animate({
				left : "+=" + caroucelValues(root).nextDistance
			});

		});

		return initialize();

	};

	$.fn.multycarousel = function(params) {
		var slider_options = $.extend({}, $.mult.slider.options, params);

		$.mult.slider.sliders.push(new Carousel($(this), slider_options));

		return this;
	};
}(jQuery));
