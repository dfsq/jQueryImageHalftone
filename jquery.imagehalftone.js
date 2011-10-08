/**
 * jQuery imageHalftone plugin.
 * Simple image halftone Floyd-Steinberg dithering algorithm implementation.
 * Converts image into two color halftoned.
 *
 * @author Aliaksandr Astashenkau, dfsq.dfsq@gmail.com
 * @author-website http://dfsq.info
 * @license MIT License - http://www.opensource.org/licenses/mit-license.php
 * @version 0.2
 */
;(function($) {
	$.fn.imageHalftone = function(options) {

		/**
		 * Default options.
		 *
		 * radius: [Integer:1] Number of pixels per dot.
		 * output: [String:'canvas'] Type of resulting image representation.
		 *   canvas - original image is replaced with canvas element.
		 *   image  - original image is replaced with a new image.
		 * target: [String:null] CSS selector of the container to append new converted
		 *   image (or canvas) to. Original image will not be replaced.
		 * grayscale: [Boolean:false] Just convert image to grayscale.
		 * addCSS: [Object:{}] CSS properties to be added to the image or canvas.
		 * addClass: [String:null] Class name to be added.
		 */
		var settings = $.extend({
			radius: 1,
			output: 'canvas',
			target: null,
			grayscale: false,
			addCSS: {},
			addClass: null
		}, options);

		/**
		 * First of all check canvas support.
		 */
		function support() {
			return !!document.createElement('canvas').getContext;
		}

		/**
		 * Actual algorithm goes here.
		 */
		var Halftone = function($img) {
			return {
				create: function() {
					this.canvas = $('<canvas>').attr({
						width:  $img.width(),
						height: $img.height()
					});
					this.ctx = this.canvas[0].getContext('2d');

					// Draw the image on canvas first
					this.ctx.drawImage($img[0], 0, 0);

					// Array of image color pixels
					this.raw = this.ctx.getImageData(0, 0, this.canvas.attr('width'), this.canvas.attr('height'));
					this.rawW = this.raw.width;
					this.rawH = this.raw.height;

					this.process();

					// New element
					var $el = settings.output == 'canvas'
						? this.canvas
						: (function(c) {
							var i = new Image();
							i.src = c.toDataURL("image/png");
							return $(i);
						})(this.canvas[0]);

					settings.addClass && $el.addClass(settings.addClass);
					$el.css(settings.addCSS);

					settings.target
						? (typeof settings.target === 'function' ? settings.target($el) : $(settings.target).html($el))
						: $img.replaceWith($el);
				},

				/**
				 * Getter/setter of the average color of the pixel/section.
				 * Get the average color of the section refered by its vertical and
				 * horizontal index in the array matrix. Section can be either 1x1 pixel
				 * or squares like 16x16 pixels. Size of the section is defined by r setting.
				 * @param i int coordinates of the left upper corner pixel
				 * @param j int coordinates of the left upper corner pixel
				 * @param r size of the dot
				 * @param val int a new color to assign to pixel (section); if defined method acts as setter.
				 */
				area: function(i, j, r, val) {

					var d = this.raw.data;

					if (r == 1) {
						var index = i * 4 * this.rawW + j * 4;

						if (typeof val == 'undefined') {
							return (d[index] + d[index + 1] + d[index + 2]) / 3;
						}
						else {
							val = Math.round(val);
							d[index] = val;
							d[index + 1] = val;
							d[index + 2] = val;
						}
					}
					else {
						var ri, rj;

						if (typeof val == 'undefined') {
							var average = 0;
							for (ri = 0; ri < r; ri++)
								for (rj = 0; rj < r; rj++)
									average += this.area(i + ri, j + rj, 1);

							return average/(r*r);
						}
						else {
							for (ri = 0; ri < r; ri++)
								for (rj = 0; rj < r; rj++)
									this.area(i + ri, j + rj, 1, val);
						}
					}
				},

				/**
				 * Switch the color between completely white and black.
				 */
				closestColor: function(color) {
					return color < 128 ? 0 : 255;
				},

				process: function() {

					var r = settings.radius,
						w = this.rawW,
						h = this.rawH,
						oldPixel, newPixel, quantError,
						i, j;

					// Iterate over each pixel in array
					for (i = 0; i < h; i += r) {
						for (j = 0; j < w; j += r) {

							// Old pixel converted to grayscale
							oldPixel = newPixel = this.area(i, j, r);

							if (!settings.grayscale) {
								// Change color depending on how dark gray is
								newPixel = this.closestColor(oldPixel);

								// Actual algorithm
								quantError = oldPixel - newPixel;
								j+r < w && this.area(i, j+r, r, this.area(i, j+r, r) + (7/16)*quantError);
								i+r < h && j > r && this.area(i+r, j-r, r, this.area(i+r, j-r, r) + (3/16)*quantError);
								i+r < h && this.area(i+r, j, r, this.area(i+r, j, r) + (5/16)*quantError);
								i+r < h && j+r < w && this.area(i+r, j+r, r, this.area(i+r, j+r, r) + (1/16)*quantError);
							}

							// Set new pixel
							this.area(i, j, r, newPixel);
						}
					}

					this.ctx.putImageData(this.raw, 0, 0);
				}
			};
		};

		return support() && this.each(function() {
			$(this).is('img') && new Halftone($(this)).create();
		});
	};
})(jQuery);