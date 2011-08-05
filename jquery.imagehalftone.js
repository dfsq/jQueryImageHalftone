/**
 * Steps:
 * 1. Find images.
 * 2. Replace original image with new haltone version.
 */
;(function($) {
	$.fn.imageHalftone = function(options) {
		/**
		 * Default haltone image options.
		 * For radius 1 algorithm behave like Floyd-Steinberg dithering.
		 * For radius > 1 AM dithering.
		 */
		var options = $.extend({
			radius: 1
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

					this.process();

					// TODO temp append canvas to document
					this.canvas.appendTo('body');
				},

				drawCircle: function(i, j, gray) {
					var saturation = this.saturation(gray);
					var r = options.radius;

					// Radius of the circle to be placed in the section
					var R = Math.round(r * Math.sqrt(saturation / Math.PI));

					// Draw square first
					this.ctx.fillStyle = '#FFF';
					this.ctx.fillRect(i, j, r, r);

					// Draw circle
					this.ctx.fillStyle = '#000';
					this.ctx.beginPath();
					this.ctx.arc(i + r/2, j + r/2, R, 0, 2 * Math.PI);
					this.ctx.closePath();
					this.ctx.fill();
				},

				/**
				 * Getter/setter of the average color of the pixel/section.
				 * Get the average color of the section refered by its vertical and
				 * horizontal index in the array matrix. Section can be either 1x1 pixel
				 * or squares like 16x16 pixels. Size of the section is defined by radius setting.
				 * @param x int coordinates of the left upper corner pixel
				 * @param y int coordinates of the left upper corner pixel
				 * @param radius
				 * @param value int a new color to assign to pixel (section); if defined method acts as setter.
				 */
				area: function(i, j, radius, value, gray) {

					if (radius == 1) {
						var index = i * 4 + j * 4 * this.raw.width;
						if (typeof value == 'undefined') {
							return (this.raw.data[index] + this.raw.data[index + 1] + this.raw.data[index + 2]) / 3;
						}
						else {
							value = Math.round(value);
							this.raw.data[index] = value;
							this.raw.data[index + 1] = value;
							this.raw.data[index + 2] = value;
						}
					}
					else {
						if (typeof value == 'undefined') {
							var average = 0;
							for (var ri = 0; ri < radius; ri++)
								for (var rj = 0; rj < radius; rj++)
									average += this.area(i + ri, j + rj, 1);

							return average/(radius*radius);
						}
						else {
//							for (var ri = 0; ri < radius; ri++)
//								for (var rj = 0; rj < radius; rj++)
//									this.area(i + ri, j + rj, 1, value);

							this.drawCircle(i, j, gray);
						}
					}
				},

				/**
				 * Switch the color between completely white and black.
				 * @param color
				 */
				closestColor: function(color) {
					return color < 128 ? 0 : 255;
				},

				/**
				 * Define how dark the gray color is. 0 - means 100% black.
				 * @param color
				 */
				saturation: function(color) {
					return (255 - color) / 255;
				},

				process: function() {
					// Iteration delta
					var d = options.radius;

					// Iterate over each pixel in array
					for (var i = 0; i < this.raw.height; i = i + d) {
						for (var j = 0; j < this.raw.width; j = j + d) {
							// Old pixel converted to grayscale
							var oldPixel = this.area(i, j, d);

							// Change color accordeing to how dark gray is
							var newPixel = this.closestColor(oldPixel);

							// Set new pixel
							this.area(i, j, d, newPixel, oldPixel);

							var quantError = oldPixel - newPixel;
							j+d < this.raw.width  && this.area(i, j+d, d, this.area(i, j+d, d) + (7/16)*quantError);
							i+d < this.raw.height && j > d && this.area(i+d, j-d, d, this.area(i+d, j-d, d) + (3/16)*quantError);
							i+d < this.raw.height && this.area(i+d, j, d, this.area(i+d, j, d) + (5/16)*quantError);
							i+d < this.raw.height && j+d < this.raw.width && this.area(i+d, j+d, d, this.area(i+d, j+d, d) + (1/16)*quantError);
						}
					}

					//this.ctx.putImageData(this.raw, 0, 0, 0, 0, this.raw.width, this.raw.height);
				}
			};
		};

		/**
		 * Run transformations.
		 */
		return support() && this.each(function() {
			$(this).is('img') && new Halftone($(this)).create();
		});
	};
})(jQuery);