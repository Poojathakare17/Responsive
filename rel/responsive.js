/*
 * Responsive framework
 *
 * Responsive is a minimalist framework for rapidly creating responsive websites specifically 
 * written to prevent the need to undo styles set by the framework itself and allow 
 * developers to write streamlined code.
 *
 * Portions of this CSS and JS are based on the incredibly hard work that has been 
 * done creating the HTML5 Boilerplate, Twitter Bootstrap, Zurb Foundation, and Normalize.css 
 * and all credit for that work is due to them.
 * 
 */

/*  ==|== Responsive =============================================================
    Author: James South
    twitter : http://twitter.com/James_M_South
    github : https://github.com/JimBobSquarePants/Responsive
    Copyright (c),  James South.
    Licensed under the Apache License v2.0.
    ============================================================================== */

/*! Responsive v2.0.0 | Apache v2.0 License | git.io/rRNRLA */

/*
 * Responsive Utils
 */

/*global jQuery*/
/*jshint forin:false*/
(function ($) {

    "use strict";

    $.support.transition = (function () {
        /// <summary>Returns a value indicating whether the browser supports CSS transitions.</summary>
        /// <returns type="Boolean">True if the current browser supports css transitions.</returns>

        var transitionEnd = function () {
            /// <summary>Gets transition end event for the current browser.</summary>
            /// <returns type="Object">The transition end event for the current browser.</returns>

            var el = document.createElement("responsive"),
                transEndEventNames = {
                    "transition": "transitionend",
                    "WebkitTransition": "webkitTransitionEnd",
                    "MozTransition": "transitionend",
                    "OTransition": "oTransitionEnd otransitionend"
                };

            for (var name in transEndEventNames) {
                if (el.style[name] !== undefined) {
                    return { end: transEndEventNames[name] };
                }
            }

            return false;
        };

        return transitionEnd();

    }());

    $.fn.redraw = function () {
        /// <summary>Forces the browser to redraw by measuring the given target.</summary>
        /// <returns type="jQuery">The jQuery object for chaining.</returns>
        var redraw;
        return this.each(function () {
            redraw = this.offsetWidth;
        });
    };

    $.extend($.expr[":"], {
        attrStart: function (el, i, props) {
            /// <summary>Custom selector extension to allow attribute starts with selection.</summary>
            /// <param name="el" type="DOM">The element to test against.</param>
            /// <param name="i" type="Number">The index of the element in the stack.</param>
            /// <param name="props" type="Object">Metadata for the element.</param>
            /// <returns type="Boolean">True if the element is a match; otherwise, false.</returns>
            var hasAttribute = false;

            $.each(el.attributes, function () {
                if (this.name.indexOf(props[3]) === 0) {
                    hasAttribute = true;
                    return false;  // Exit the iteration.
                }
                return true;
            });

            return hasAttribute;
        }
    });

    $.buildDataOptions = function ($elem, options, prefix, namespace) {
        /// <summary>Creates an object containing options populated from an elements data attributes.</summary>
        /// <param name="$elem" type="jQuery">The object representing the DOM element.</param>
        /// <param name="options" type="Object">The object to extend</param>
        /// <param name="prefix" type="String">The prefix with which to identify the data attribute.</param>
        /// <param name="namespace" type="String">The namespace with which to segregate the data attribute.</param>
        /// <returns type="Object">The extended object.</returns>
        $.each($elem.data(), function (key, val) {

            if (key.indexOf(prefix) === 0 && key.length > prefix.length) {

                // Build a key with the correct format.
                var length = prefix.length,
                    newKey = key.charAt(length).toLowerCase() + key.substring(length + 1);

                options[newKey] = val;

                // Clean up.
                $elem.removeData(key);
            }

        });

        if (namespace) {
            $elem.data(namespace + "." + prefix + "Options", options);
        } else {
            $elem.data(prefix + "Options", options);
        }

        return options;
    };

}(jQuery));
/*
 * Responsive AutoSize
 */

/*global jQuery*/
/*jshint expr:true*/
(function ($, w, ns) {

    "use strict";

    if (w.RESPONSIVE_AUTOSIZE) {
        return;
    }

    // General variables and methods.
    var resisizeTimer,
        eready = "ready" + ns,
        eresize = "resize" + ns + " orientationchange" + ns,
        ekeyup = "keyup" + ns,
        epaste = "paste" + ns,
        ecut = "cut" + ns,
        esize = "size" + ns,
        esized = "sized" + ns;

    // Private methods.
    var bindEvents = function () {

        this.$element.on(ekeyup + " " + epaste + " " + ecut, function (event) {

            var $this = $(this),
                delay = 0;

            if (event.type === "paste" || event.type === "cut") {
                delay = 5;
            }

            w.setTimeout(function () {

                // Run the size method.
                $this.autoSize("size");

            }, delay);
        });

    },
        createClone = function () {

            var self = this,
                attributes = this.options.removeAttributes,
                classes = this.options.removeClasses,
                $element = this.$element,
                clone = function () {

                    // Create a clone and offset it removing all specified attributes classes and data.
                    self.$clone = self.$element.clone()
                                      .css({ "position": "absolute", "top": "-99999px", "left": "-99999px", "visibility": "hidden", "overflow": "hidden" })
                                      .attr({ "tabindex": -1, "rows": 2 })
                                      .removeAttr("id name data-autosize " + attributes)
                                      .removeClass(classes)
                                      .insertAfter($element);

                    // jQuery goes spare if you try to remove null data.
                    if (classes) {
                        self.$clone.removeData(classes);
                    }

                };

            $.when(clone()).then(this.size());
        };

    // AutoSize class definition
    var AutoSize = function (element, options) {

        this.$element = $(element);
        this.defaults = {
            removeAttributes: null,
            removeClasses: null
        };
        this.options = $.extend({}, this.defaults, options);
        this.$clone = null;
        this.sizing = null;

        // Initial setup.
        bindEvents.call(this);
        createClone.call(this);
    };

    AutoSize.prototype.size = function () {

        var supportTransition = $.support.transition,
            self = this,
            $element = this.$element,
            element = this.$element[0],
            $clone = this.$clone,
            clone = $clone[0],
            heightComparer = 0,
            startHeight,
            endHeight,
            sizeEvent = $.Event(esize),
            complete = function () {
                self.sizing = false;
                $element.trigger($.Event(esized));
            };

        // Set the width of the clone to match.
        $clone.width($element.width());

        // Copy the text across.
        $clone.val($element.val());

        // Set the height so animation will work.
        startHeight = $clone.height();
        $element.height(startHeight);

        // Shrink
        while (clone.rows > 1 && clone.scrollHeight < clone.offsetHeight) {
            clone.rows -= 1;
        }

        // Grow
        while (clone.scrollHeight > clone.offsetHeight && heightComparer !== clone.offsetHeight) {
            heightComparer = element.offsetHeight;
            clone.rows += 1;
        }
        clone.rows += 1;

        endHeight = $clone.height();

        if (startHeight !== endHeight) {

            $element.trigger($.Event(esize));

            if (this.sizing || sizeEvent.isDefaultPrevented()) {
                return;
            }

            this.sizing = true;

            // Reset the height
            $element.height($clone.height());

            // Do our callback
            supportTransition ? $element.one(supportTransition.end, complete) : complete();
        }
    };

    // Plug-in definition 
    var old = $.fn.autoSize;

    $.fn.autoSize = function (options) {

        return this.each(function () {

            var $this = $(this),
                data = $this.data("r.autosize"),
                opts = typeof options === "object" ? options : null;

            if (!data) {
                // Check the data and reassign if not present.
                $this.data("r.autosize", (data = new AutoSize(this, opts)));
            }

            // Run the appropriate function is a string is passed.
            if (typeof options === "string") {
                data[options]();
            }
        });
    };

    // Set the public constructor.
    $.fn.autoSize.Constructor = AutoSize;

    // No conflict.
    $.fn.autoSize.noConflict = function () {
        $.fn.autoSize = old;
        return this;
    };

    // Data API
    $(document).on(eready, function () {

        $("textarea[data-autosize]").each(function () {

            var $this = $(this),
                data = $this.data("r.autosizeOptions"),
                options = data || $.buildDataOptions($this, {}, "autosize", "r");

            // Run the autosize method.
            $this.autoSize(options);
        });
    });

    $(w).on(eresize, function () {

        if (resisizeTimer) {
            w.clearTimeout(resisizeTimer);
        }

        var resize = function () {

            $("textarea[data-autosize]").each(function () {

                var autosize = $(this).data("r.autosize");

                if (autosize) { autosize.size(); }

            });
        };

        resisizeTimer = w.setTimeout(resize, 5);
    });

    w.RESPONSIVE_AUTOSIZE = true;

}(jQuery, window, ".r.autosize.data-api"));/*
 * Responsive Carousel
 */

/*global jQuery*/
/*jshint expr:true*/
(function ($, w, ns) {

    "use strict";

    if (w.RESPONSIVE_CAROUSEL) {
        return;
    }

    // General variables.
    var supportTransition = $.support.transition,
        emouseenter = "mouseenter" + ns,
        emouseleave = "mouseleave" + ns,
        eclick = "click" + ns,
        eready = "ready" + ns,
        eslide = "slide" + ns,
        eslid = "slid" + ns;

    // Private methods.
    var getActiveIndex = function () {

        var $activeItem = this.$element.find(".carousel-active");
        this.$items = $activeItem.parent().children();

        return this.$items.index($activeItem);
    };

    // AutoSize class definition
    var Carousel = function (element, options) {

        this.$element = $(element);
        this.defaults = {
            interval: 5000,
            mode: "slide",
            pause: "hover",
            wrap: true
        };
        this.options = $.extend({}, this.defaults, options);
        this.$indicators = this.$element.find(".carousel-indicators");
        this.paused = null;
        this.interval = null;
        this.sliding = null;
        this.$items = null;

        if (this.options.pause === "hover") {
            // Bind the mouse enter/leave events
            this.$element.on(emouseenter, $.proxy(this.pause, this))
                         .on(emouseleave, $.proxy(this.cycle, this));
        }
    };

    Carousel.prototype.cycle = function (event) {

        if (!event) {
            // Flag false when there's no event.
            this.paused = false;
        }

        if (this.interval) {
            w.clearInterval(this.interval);
        }

        if (this.options.interval && !this.paused) {

            // Cycle to the next item on the set interval
            this.interval = w.setInterval($.proxy(this.next, this), this.options.interval);
        }

        // Return the carousel for chaining.
        return this;
    };

    Carousel.prototype.to = function (position) {

        var activePosition = getActiveIndex.call(this),
            self = this;

        if (position > (this.$items.length - 1) || position < 0) {

            return false;
        }

        if (this.sliding) {

            // Fire the slid event.
            return this.$element.one(eslid, function () {
                // Reset the position.
                self.to(position);

            });
        }

        if (activePosition === position) {
            return this.pause().cycle();
        }

        return this.slide(position > activePosition ? "next" : "prev", $(this.$items[position]));

    };

    Carousel.prototype.pause = function (event) {

        if (!event) {
            // Mark as paused
            this.paused = true;
        }

        // Ensure that transition end is triggered.
        if (this.$element.find(".next, .prev").length && $.support.transition.end) {
            this.$element.trigger($.support.transition.end);
            this.cycle(true);
        }

        // Clear the interval and return the carousel for chaining.
        this.interval = w.clearInterval(this.interval);

        return this;
    };

    Carousel.prototype.next = function () {

        if (this.sliding) {
            return false;
        }

        return this.slide("next");
    };

    Carousel.prototype.prev = function () {

        if (this.sliding) {
            return false;
        }

        return this.slide("prev");
    };

    Carousel.prototype.slide = function (type, next) {

        var $activeItem = this.$element.find(".carousel-active"),
            $nextItem = next || $activeItem[type](),
            isCycling = this.interval,
            isNext = type === "next",
            direction = isNext ? "left" : "right",
            fallback = isNext ? "first" : "last",
            self = this,
            slidEvent = $.Event(eslid),
            slideMode = this.options.mode === "slide",
            fadeMode = this.options.mode === "fade";

        if (isCycling) {
            // Pause if cycling.
            this.pause();
        }

        // Work out which item to slide to.
        if (!$nextItem.length) {

            if (!this.options.wrap) {
                return false;
            }

            $nextItem = this.$element.find(".carousel-item")[fallback]();
        }

        if ($nextItem.hasClass("carousel-active")) {
            return false;
        }

        if (this.interval) {
            this.pause();
        }

        // Trigger the slide event with positional data.
        var slideEvent = $.Event(eslide, { relatedTarget: $nextItem[0], direction: direction });
        this.$element.trigger(slideEvent);

        if (this.sliding || slideEvent.isDefaultPrevented()) {
            return false;
        }


        // Good to go? Then let's slide.
        this.sliding = true;

        // Highlight the correct indicator.
        if (this.$indicators.length) {
            this.$indicators.find(".active").removeClass("active");

            this.$element.one(eslid, function () {
                var $nextIndicator = $(self.$indicators.children()[getActiveIndex.call(self)]);
                if ($nextIndicator) {
                    $nextIndicator.addClass("active");
                }
            });
        };

        var complete = function () {
            $activeItem.removeClass(["carousel-active", direction].join(" "));
            $nextItem.removeClass([type, direction].join(" ")).addClass("carousel-active");
            self.sliding = false;
            self.$element.trigger(slidEvent);
        };

        // Force reflow.
        $nextItem.addClass(type).redraw();

        // Do the slide.
        $activeItem.addClass(direction);
        $nextItem.addClass(direction);

        supportTransition && (slideMode || fadeMode)
            ? $activeItem.one(supportTransition.end, complete)
            : complete();

        // Restart the cycle.
        if (isCycling) {

            this.cycle();
        }

        return this;
    };

    // Plug-in definition 
    var old = $.fn.carousel;

    $.fn.carousel = function (options) {

        return this.each(function () {

            var $this = $(this),
                data = $this.data("r.carousel"),
                opts = typeof options === "object" ? options : null;

            if (!data) {
                // Check the data and reassign if not present.
                $this.data("r.carousel", (data = new Carousel(this, opts)));
            }

            if (typeof options === "number") {
                // Cycle to the given number.
                data.to(options);

            } else if (typeof options === "string" || (options = opts.slide)) {

                data[options]();

            } else if (data.options.interval) {
                data.cycle();
            }
        });
    };

    // Set the public constructor.
    $.fn.carousel.Constructor = Carousel;

    // No conflict.
    $.fn.carousel.noConflict = function () {
        $.fn.carousel = old;
        return this;
    };

    // Data API
    $(document).on(eclick, ":attrStart(data-carousel-slide)", function (event) {

        event.preventDefault();

        var $this = $(this),
            data = $this.data("r.carouselOptions"),
            options = data || $.buildDataOptions($this, {}, "carousel", "r"),
            $target = $(options.target || (options.target = $this.attr("href"))),
            slideIndex = options.slideTo,
            carousel = $target.data("r.carousel");

        if (carousel) {
            typeof slideIndex === "number" ? carousel.to(slideIndex) : carousel[options.slide]();
        }
    }).on(eready, function () {

        $(".carousel").each(function () {

            var $this = $(this),
                data = $this.data("r.carouselOptions"),
                options = data || $.buildDataOptions($this, {}, "carousel", "r");

            $this.carousel(options);
        });
    });

    w.RESPONSIVE_CAROUSEL = true;

}(jQuery, window, ".r.carousel"));/*
 * Responsive Dismiss 
 */

/*global jQuery*/
/*jshint expr:true*/
(function ($, w, ns) {

    "use strict";

    if (w.RESPONSIVE_DISMISS) {
        return;
    }

    // General variables.
    var eclick = "click" + ns,
        edismiss = "dismiss" + ns,
        edismissed = "dismissed" + ns;

    // Dismiss class definition
    var Dismiss = function (element, target) {

        this.$element = $(element);
        this.$target = this.$element.parents(target);
        this.dismissing = null;
    };

    Dismiss.prototype.close = function () {

        var supportTransition = $.support.transition,
            dismissEvent = $.Event(edismiss),
            $target = this.$target,
            self = this,
            complete = function () {

                self.dismissing = false;
                $target.addClass("hidden").trigger($.Event(edismissed));
            };

        $target.trigger(dismissEvent);

        if (this.dismissing || dismissEvent.isDefaultPrevented()) {
            return;
        }

        this.dismissing = true;

        $target.addClass("fade-in fade-out")
               .redraw()
               .removeClass("fade-in");

        // Do our callback
        supportTransition ? this.$target.one(supportTransition.end, complete) : complete();
    };

    // Plug-in definition 
    var old = $.fn.dismiss;

    $.fn.dismiss = function (target) {

        return this.each(function () {

            var $this = $(this),
                data = $this.data("dismiss");

            if (!data) {
                // Check the data and reassign if not present.
                $this.data("dismiss", (data = new Dismiss(this, target + ":first")));
            }

            // Close the element.
            data.close();
        });
    };

    // Set the public constructor.
    $.fn.dismiss.Constructor = Dismiss;

    // No conflict.
    $.fn.dismiss.noConflict = function () {
        $.fn.dismiss = old;
        return this;
    };

    // Data API
    $("body").on(eclick, ":attrStart(data-dismiss)", function (event) {

        event.preventDefault();

        var $this = $(this),
            data = $this.data("r.dismissOptions"),
            options = data || $.buildDataOptions($this, {}, "dismiss", "r"),
            target = options.target || (options.target = $this.attr("href"));

        // Run the dismiss method.
        if (target) {
            $(this).dismiss(options.target);
        }
    });

    w.RESPONSIVE_DISMISS = true;

}(jQuery, window, ".r.dismiss"));/*
 * Responsive Dropdown 
 */

/*global jQuery*/
(function ($, w, ns) {

    "use strict";

    if (w.RESPONSIVE_DROPDOWN) {
        return;
    }

    // General variables.
    var supportTransition = w.getComputedStyle && $.support.transition,
        eclick = "click" + ns,
        eshow = "show" + ns,
        eshown = "shown" + ns,
        ehide = "hide" + ns,
        ehidden = "hidden" + ns;

    // Private methods.
    var transition = function (method, startEvent, completeEvent) {

        var self = this,
            complete = function () {

                // The event to expose.
                var eventToTrigger = $.Event(completeEvent);

                // Ensure the height/width is set to auto.
                self.$element.removeClass("trans")[self.options.dimension]("");

                self.transitioning = false;
                self.$element.trigger(eventToTrigger);
            };

        if (this.transitioning || startEvent.isDefaultPrevented()) {
            return;
        }

        this.transitioning = true;

        // Remove or add the expand classes.
        this.$element.trigger(startEvent)[method]("collapse");
        this.$element[startEvent.type === "show" ? "addClass" : "removeClass"]("expand trans");

        supportTransition ? this.$element.one(supportTransition.end, complete) : complete();
    };

    // The Dropdown class definition
    var Dropdown = function (element, options) {

        this.$element = $(element);
        this.defaults = {
            toggle: true,
            dimension: "height"
        };
        this.options = $.extend({}, this.defaults, options);
        this.$parent = null;
        this.transitioning = null;
        this.endSize = null;

        if (this.options.parent) {
            this.$parent = this.$element.parents(this.options.parent + ":first");
        }

        // Check to see if the plug-in is set to toggle and trigger 
        // the correct internal method if so.
        if (this.options.toggle) {
            this.toggle();
        }
    };

    Dropdown.prototype.show = function () {

        if (this.transitioning || this.$element.hasClass("expand")) {
            return;
        }

        var dimension = this.options.dimension,
            actives = this.$parent && this.$parent.find(".dropdown-group:not(.collapse)"),
            hasData;

        if (actives && actives.length) {
            hasData = actives.data("r.dropdown");
            actives.dropdown("hide");

            if (!hasData) {
                actives.data("r.dropdown", null);
            }
        }

        // Set the height/width to zero then to the height/width
        // so animation can take place.
        this.$element[dimension](0);

        if (supportTransition) {

            // Calculate the height/width.
            this.$element[dimension]("auto");
            this.endSize = w.getComputedStyle(this.$element[0])[dimension];

            // Reset to zero and force repaint.
            this.$element[dimension](0).redraw();
        }

        this.$element[dimension](this.endSize || "auto");

        transition.call(this, "removeClass", $.Event(eshow), eshown);
    };

    Dropdown.prototype.hide = function () {

        if (this.transitioning || this.$element.hasClass("collapse")) {
            return;
        }

        // Reset the height/width and then reduce to zero.
        var dimension = this.options.dimension,
            size;

        if (supportTransition) {

            // Set the height to auto, calculate the height/width and reset.
            size = w.getComputedStyle(this.$element[0])[dimension];

            // Reset the size and force repaint.
            this.$element[dimension](size).redraw(); // Force reflow ;
        }

        this.$element.removeClass("expand");
        this.$element[dimension](0);
        transition.call(this, "addClass", $.Event(ehide), ehidden);
    };

    Dropdown.prototype.toggle = function () {
        // Run the correct command based on the presence of the class 'collapse'.
        this[this.$element.hasClass("collapse") ? "show" : "hide"]();
    };

    // Plug-in definition 
    var old = $.fn.dropdown;

    $.fn.dropdown = function (options) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data("r.dropdown"),
                opts = typeof options === "object" ? options : null;

            if (!data) {
                // Check the data and reassign if not present.
                $this.data("r.dropdown", (data = new Dropdown(this, opts)));
            }

            // Run the appropriate function if a string is passed.
            if (typeof options === "string") {
                data[options]();
            }
        });
    };

    // Set the public constructor.
    $.fn.dropdown.Constructor = Dropdown;

    // No conflict.
    $.fn.dropdown.noConflict = function () {
        $.fn.dropdown = old;
        return this;
    };

    // Dropdown data api initialization.
    $("body").on(eclick, ":attrStart(data-dropdown)", function (event) {

        event.preventDefault();

        var $this = $(this),
            data = $this.data("r.dropdownOptions"),
            options = data || $.buildDataOptions($this, {}, "dropdown", "r"),
            target = options.target || (options.target = $this.attr("href")),
            $target = $(target),
            params = $target.data("r.dropdown") ? "toggle" : options;

        // Run the dropdown method.
        $target.dropdown(params);
    });

    w.RESPONSIVE_DROPDOWN = true;

}(jQuery, window, ".r.dropdown"));/*
 * Responsive Lightbox
 */

/*global jQuery*/
/*jshint expr:true*/

(function ($, w, ns) {

    "use strict";

    if (w.RESPONSIVE_LIGHTBOX) {
        return;
    }

    // General variables.
    var $window = $(w),
        $html = $("html"),
        $body = $("body"),
        $overlay = $("<div/>").addClass("lightbox-overlay lightbox-loader fade-out"),
        $lightbox = $("<div/>").addClass("lightbox fade-out").appendTo($overlay),
        $header = $("<div/>").addClass("lightbox-header fade-out"),
        $footer = $("<div/>").addClass("lightbox-footer fade-out"),
        $img = null,
        $iframe = null,
        $content = null,
        $close = $("<a/>").attr({ "href": "#", "title": "Close (Esc)" }).addClass("lightbox-close fade-out").html("x"),
        $next = $("<a/>").attr({ "href": "#", "title": "Next (Right Arrow)" }).addClass("lightbox-direction right hidden"),
        $previous = $("<a/>").attr({ "href": "#", "title": "Previous (Left Arrow)" }).addClass("lightbox-direction left hidden"),
        $placeholder = $("<div/>").addClass("lightbox-placeholder"),
        lastScroll = 0,
        supportTransition = $.support.transition,
        keys = {
            ESCAPE: 27,
            LEFT: 37,
            RIGHT: 39
        },
        protocol = w.location.protocol.indexOf("http") === 0 ? w.location.protocol : "http:",
        // Regular expression.
        rexternalHost = new RegExp("//" + w.location.host + "($|/)"),
        rimage = /(^data:image\/.*,)|(\.(jp(e|g|eg)|gif|png|bmp|ti(f|ff)|webp|svg)((\?|#).*)?$)/,
        // Taken from jQuery.
        rhash = /^#.*$/, // Altered to only match beginning.
        rurl = /^([\w.+-]+:)(?:\/\/([^\/?#:]*)(?::(\d+)|)|)/,
        rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/,
        rembedProvider = /vimeo|vine|instagram|instagr\.am/i,
        // Events
        eclick = "click" + ns,
        ekeyup = "keyup" + ns,
        eshow = "show" + ns,
        eshown = "shown" + ns,
        ehide = "hide" + ns,
        ehidden = "hidden" + ns,
        eresize = "resize" + ns + " orientationchange" + ns;

    // Private methods.
    var isExternalUrl = function (url) {
        // Handle different host types.
        // Split the url into it's various parts.
        var locationParts = rurl.exec(url) || rurl.exec(protocol + url);

        if (locationParts === undefined || rhash.test(url)) {
            return false;
        }

        // Target is a local protocol.
        if (locationParts === null || locationParts[2] === undefined || rlocalProtocol.test(locationParts[1])) {
            return false;
        }

        // If the regex doesn't match return true . 
        return !rexternalHost.test(locationParts[2]);
    },
        create = function () {

            // Calculate whether this is an external request and set the value.
            this.options.external = !rhash.test(this.options.target);

            var self = this,
                title = this.options.title,
                description = this.options.description,
                close = this.options.close,
                target = this.options.target,
                local = !this.options.external && !isExternalUrl(target),
                group = this.options.group,
                nextText = this.options.next,
                previousText = this.options.previous,
                iframeScroll = this.options.iframeScroll,
                iframe = this.options.iframe || !local ? isExternalUrl(target) && !rimage.test(target) : false,
                $iframeWrap = $("<div/>").addClass(iframeScroll ? "media media-scroll" : "media");

            $content = $("<div/>").addClass("lightbox-content");
            $iframe = $("<iframe/>"); // This needs to be assigned then unassigned or ie8 won't test against it.
            $img = $("<img/>"); // ditto.

            // 1: Build the header
            if (title || close) {

                $header.html(title ? "<div class=\"container\"><h2>" + title + "</h2></div>" : "")
                       .appendTo($overlay);

                if (close) {
                    $close.appendTo($overlay);
                }
            }

            // 2: Build the footer
            if (description) {

                // Add footer text if necessary
                $footer.html("<div class=\"container\">" + description + "</div>")
                       .appendTo($overlay);
            }

            // 3: Build the content
            if (local) {

                $placeholder.detach().insertAfter(this.$element);
                $(target).detach().appendTo($content).removeClass("hidden");
                $content.appendTo($lightbox);
                toggleFade.call(this);
            } else {
                if (iframe) {

                    $img = null;
                    $lightbox.addClass("lightbox-iframe");

                    // Normalize the src.
                    var src = target.indexOf("http") !== 0 ? protocol + target : target;

                    // Have to add inline styles for older browsers.
                    $iframe.attr({
                        "scrolling": iframeScroll ? "yes" : "no",
                        "allowTransparency": true,
                        "frameborder": 0,
                        "hspace": 0,
                        "vspace": 0,
                        "webkitallowfullscreen": "",
                        "mozallowfullscreen": "",
                        "allowfullscreen": "",
                        "src": src
                    })
                        .appendTo($iframeWrap);

                    // Test and add additional media classes.
                    var mediaClasses = rembedProvider.test(target) ? target.match(rembedProvider)[0].toLowerCase() : "";

                    $iframeWrap.addClass(mediaClasses).appendTo($lightbox);

                    // Not on load as can take forever.
                    toggleFade.call(this);

                } else {

                    if (rimage.test(target)) {

                        $iframe = null;
                        $lightbox.addClass("lightbox-image");

                        $img.one("load", function () {
                            toggleFade.call(self);
                        }).attr("src", target)
                            .appendTo($lightbox);
                    } else {

                        $img = null;
                        $iframe = null;
                        $lightbox.addClass("lightbox-ajax");

                        // Standard ajax load.
                        $content.load(target, function () {
                            $content.appendTo($lightbox);
                            toggleFade.call(self);
                        });
                    }
                }
            }

            if (group) {
                // Need to show next/previous.
                $next.text(nextText).prependTo($lightbox).removeClass("hidden");
                $previous.text(previousText).prependTo($lightbox).removeClass("hidden");
            }

            // Bind the click events.
            $lightbox.off(eclick).on(eclick, $.proxy(function (event) {

                var next = $next[0],
                    previous = $previous[0],
                    eventTarget = event.target;

                if (eventTarget === next || eventTarget === previous) {
                    event.preventDefault();
                    event.stopPropagation();
                    this[eventTarget === next ? "next" : "previous"]();
                }

            }, this));

        },

        destroy = function () {
            if (!this.options.external) {
                // Put that kid back where it came from or so help me.
                $(this.options.target).addClass("hidden").detach().insertAfter($placeholder);
                $placeholder.detach().insertAfter($overlay);
            }

            toggleFade.call(this);

            // Clean up the header/footer.
            $header.empty().detach();
            $footer.empty().detach();
            $close.detach();

            // Clean up the lightbox.
            $next.detach();
            $previous.detach();

            var self = this,
                empty = function () {
                    $lightbox.removeClass("lightbox-iframe lightbox-ajax lightbox-image").css({
                        "max-height": "",
                        "max-width": "",
                        "margin-top": "",
                        "margin-bottom": ""
                    }).empty();

                    // Unbind the keyboard actions.
                    if (self.options.keyboard) {

                        manageKeyboard.call(self, "hide");
                    }
                };

            // Fix __flash__removeCallback' is undefined error.
            $.when($lightbox.find("iframe").attr("src", "")).then(w.setTimeout(empty, 100));
        },

        resize = function () {
            // Bind the resize event and fade in.
            var newWindowHeight,
                oldWindowHeight,
                maxWidth = parseInt($lightbox.css("max-width"), 10),
                onResize = function () {

                    var headerHeight,
                        footerHeight,
                        childHeight,
                        $child = $iframe || $img || $content;

                    if ($child) {

                        newWindowHeight = $window.height();

                        if (newWindowHeight !== oldWindowHeight) {

                            headerHeight = $header[0] ? $header[0].clientHeight : 0;
                            footerHeight = $footer[0] ? $footer[0].clientHeight : 0;

                            childHeight = newWindowHeight - (headerHeight + footerHeight);

                            if ($img) {

                                $img.css("max-height", childHeight);

                            } else if ($iframe) {

                                var clientWidth = $iframe[0].clientWidth,
                                    clientHeight = $iframe[0].clientHeight,
                                    ratio = clientWidth / clientHeight,
                                    childWidth = childHeight * ratio;

                                $.each([$lightbox, $iframe], function () {

                                    this.css({
                                        "max-height": childHeight,
                                        "max-width": childWidth > maxWidth ? maxWidth : childWidth
                                    });
                                });
                            }

                            $lightbox.css({
                                "margin-top": headerHeight > 0 ? headerHeight : "",
                                "margin-bottom": footerHeight > 0 ? footerHeight : ""
                            });

                            oldWindowHeight = newWindowHeight;
                        }
                    }
                };

            $window.off(eresize).on(eresize, onResize);

            onResize();
        },

        toggleFade = function () {

            // Resize the lightbox content.
            if (this.isShown) {
                resize();
            }

            $.each([$header, $footer, $close, $lightbox], function () {

                this.toggleClass("fade-in")
                    .redraw();
            });

            $overlay.toggleClass("lightbox-loader");
        },

        toggleOverlay = function (event) {

            var fade = event === "show" ? "addClass" : "removeClass",
                self = this,
                complete = function () {

                    if (event === "hide") {
                        $overlay.addClass("hidden");
                        $html.removeClass("lightbox-on");

                        if (lastScroll !== $window.scrollTop) {
                            $($html, $body).animate({ scrollTop: lastScroll });
                            lastScroll = 0;
                        }

                        return;
                    }

                    $overlay.off(eclick).on(eclick, function (e) {

                        var closeTarget = $close[0],
                            eventTarget = e.target;

                        if (eventTarget === closeTarget) {
                            e.preventDefault();
                            e.stopPropagation();
                            self.hide();
                        }

                        if (eventTarget === $overlay[0]) {
                            self.hide();
                        }
                    });
                };

            // Add the overlay to the body if not done already.
            if (!$("div.lightbox-overlay").length) {

                $body.append($overlay);
            }

            if (lastScroll === 0) {
                lastScroll = $window.scrollTop();
            }
            $html.addClass("lightbox-on");

            $overlay.removeClass("hidden")
                .redraw()[fade]("fade-in")
                .redraw();

            supportTransition ? $overlay.one(supportTransition.end, complete)
                  : complete();

        },

        direction = function (course) {

            if (!this.isShown) {
                return;
            }

            if (this.options.group) {
                var self = this,
                    index = this.$group.index(this.$element),
                    length = this.$group.length,
                    position = course === "next" ? index + 1 : index - 1,
                    complete = function () {

                        self.isShown = false;
                        if (self.$sibling) {

                            if (supportTransition) {
                                self.$sibling.trigger(eclick);
                            } else {
                                w.setTimeout(function () {
                                    self.$sibling.trigger(eclick);
                                }, 300);
                            }
                        }
                    };

                if (course === "next") {

                    if (position >= length || position < 0) {

                        position = 0;
                    }
                } else {

                    if (position >= length) {

                        position = 0;
                    }

                    if (position < 0) {
                        position = length - 1;
                    }
                }

                this.$sibling = $(this.$group[position]);

                destroy.call(this);

                supportTransition ? $lightbox.one(supportTransition.end, complete)
                    : complete();
            }
        },

      manageKeyboard = function (event) {
          if (this.options.keyboard) {

              if (event === "hide") {
                  $body.off(ekeyup);
                  return;
              }

              $body.off(ekeyup).on(ekeyup, $.proxy(function (e) {

                  // Bind the escape key.
                  if (e.which === keys.ESCAPE) {
                      this.hide();
                  }

                  // Bind the next/previous keys.
                  if (this.options.group) {
                      // Bind the left arrow key.
                      if (e.which === keys.LEFT) {
                          this.previous();
                      }

                      // Bind the right arrow key.
                      if (e.which === keys.RIGHT) {
                          this.next();
                      }
                  }
              }, this));
          }
      };

    // Lightbox class definition
    var LightBox = function (element, options) {

        this.$element = $(element);
        this.defaults = {
            close: true,
            external: false,
            group: null,
            iframe: false,
            iframeScroll: false,
            keyboard: true,
            next: ">",
            previous: "<",
            mobileTarget: null,
            mobileViewportWidth: 480
        };
        this.options = $.extend({}, this.defaults, options);
        this.title = null;
        this.description = null;
        this.isShown = null;
        this.$group = null;

        // Make a list of grouped lightbox targets.
        if (this.options.group) {
            this.$group = $("[data-lightbox-group=" + this.options.group + "]");
        }

        this.toggle();
    };

    LightBox.prototype.show = function () {

        if (this.isShown) {
            return;
        }

        // If the trigger has a mobile target and the viewport is smaller than the mobile limit
        // then redirect to that page instead.
        if (this.options.mobileTarget && this.options.mobileViewportWidth >= $window.width()) {
            w.location.href = this.options.mobileTarget;
        }

        var self = this,
            showEvent = $.Event(eshow),
            shownEvent = $.Event(eshown),
            complete = function () {

                // Bind the keyboard actions.
                if (self.options.keyboard) {
                    manageKeyboard.call(self, "show");
                }

                self.$element.trigger(shownEvent);
            };

        this.$element.trigger(showEvent);

        if (showEvent.isDefaultPrevented()) {
            return;
        }

        this.isShown = true;

        toggleOverlay.call(this, "show");
        create.call(this);

        // Call the callback.
        supportTransition ? $lightbox.one(supportTransition.end, complete)
                          : complete();
    };

    LightBox.prototype.hide = function () {

        if (!this.isShown) {
            return;
        }

        var self = this,
            hideEvent = $.Event(ehide),
            hiddenEvent = $.Event(ehidden),
            complete = function () {

                self.$element.trigger(hiddenEvent);
            };


        this.$element.trigger(hideEvent);

        if (hideEvent.isDefaultPrevented()) {
            return;
        }

        this.isShown = false;

        toggleOverlay.call(this, "hide");
        destroy.call(this);

        supportTransition ? $lightbox.one(supportTransition.end, complete)
                          : complete();
    };

    LightBox.prototype.next = function () {
        direction.call(this, "next");
    };

    LightBox.prototype.previous = function () {
        direction.call(this, "previous");
    };

    LightBox.prototype.toggle = function () {
        return this[!this.isShown ? "show" : "hide"]();
    };

    // Plug-in definition 
    var old = $.fn.lightbox;

    $.fn.lightbox = function (options) {

        return this.each(function () {
            var $this = $(this),
                data = $this.data("r.lightbox"),
                opts = typeof options === "object" ? options : {};

            if (!opts.target) {
                opts.target = $this.attr("href");
            }

            if (!data) {
                // Check the data and reassign if not present.
                $this.data("r.lightbox", (data = new LightBox(this, opts)));
            }

            // Run the appropriate function if a string is passed.
            if (typeof options === "string") {
                data[options]();
            }

        });
    };

    // No conflict.
    $.fn.lightbox.noConflict = function () {
        $.fn.lightbox = old;
        return this;
    };

    // Data API
    $body.on(eclick, ":attrStart(data-lightbox)", function (event) {

        event.preventDefault();

        var $this = $(this),
            data = $this.data("r.lightboxOptions"),
            options = data || $.buildDataOptions($this, {}, "lightbox", "r"),
            params = $this.data("r.lightbox") ? "toggle" : options;

        // Run the lightbox method.
        $this.lightbox(params);
    });

    w.RESPONSIVE_LIGHTBOX = true;

}(jQuery, window, ".r.lightbox"));/*
 * Responsive Tables
 */

/*global jQuery*/
/*jshint expr:true*/
(function ($, w, ns) {

    "use strict";

    if (w.RESPONSIVE_TABLE) {
        return;
    }

    // General variables and methods.
    var eready = "ready" + ns,
        eadd = "add" + ns,
        eadded = "added" + ns;

    var Table = function (element) {

        this.$element = $(element);
        this.$thead = this.$element.find("thead");
        this.$tfoot = this.$element.find("tfoot");
        this.$tbody = this.$element.find("tbody");
        this.$headerColumns = this.$thead.find("th");
        this.$footerColumns = this.$tfoot.find("th");
        this.$bodyRows = this.$tbody.find("tr");
        this.isAdded = null;

        this.add();
    };

    Table.prototype.add = function () {

        if (this.isAdded) {
            return;
        }

        var supportTransition = $.support.transition,
            self = this,
            addEvent = $.Event(eadd),
            complete = function () {
                self.$element.trigger($.Event(eadded));
            };

        this.$element.trigger(addEvent);

        if (addEvent.isDefaultPrevented()) {

            return;
        }

        this.isAdded = true;

        $.each(this.$bodyRows, function () {

            $(this).find("th, td").each(function (index) {
                var $this = $(this),
                    theadAttribute = $(self.$headerColumns[index]).text();

                $this.attr("data-thead", theadAttribute);

                if (self.$tfoot) {

                    var tfootAttribute = $(self.$footerColumns[index]).text();
                    $this.attr("data-tfoot", tfootAttribute);
                }
            });
        });

        this.$element.addClass("fade-in").redraw();

        // Do our callback
        supportTransition ? this.$element.one(supportTransition.end, complete) : complete();
    };

    // Plug-in definition 
    var old = $.fn.table;

    $.fn.table = function (options) {

        return this.each(function () {

            var $this = $(this),
                data = $this.data("r.table"),
                opts = typeof options === "object" ? options : null;

            if (!data) {
                // Check the data and reassign if not present.
                $this.data("r.table", (data = new Table(this, opts)));
            }

            // Run the appropriate function is a string is passed.
            if (typeof options === "string") {
                data[options]();
            }
        });
    };

    // Set the public constructor.
    $.fn.table.Constructor = Table;

    // No conflict.
    $.fn.table.noConflict = function () {
        $.fn.table = old;
        return this;
    };

    // Data API
    $(document).on(eready, function () {

        $("table[data-table-list]").each(function () {

            var $this = $(this),
                data = $this.data("r.tableOptions"),
                options = data || $.buildDataOptions($this, {}, "table", "r");

            // Run the table method.
            $this.table(options);
        });
    });

    w.RESPONSIVE_TABLE = true;

}(jQuery, window, ".r.table.data-api"));/*
 * Responsive tabs
 */

/*global jQuery*/
/*jshint expr:true*/
(function ($, w, ns) {

    "use strict";

    if (w.RESPONSIVE_TABS) {
        return;
    }

    // General variables.
    var supportTransition = $.support.transition,
        eready = "ready" + ns,
        eclick = "click" + ns,
        eshow = "show" + ns,
        eshown = "shown" + ns;

    // Private methods.
    var tab = function (activePosition, postion, callback) {

        var showEvent = $.Event(eshow),
            $element = this.$element,
            $childTabs = $element.find("ul.tabs > li"),
            $childPanes = $element.children("div"),
            $nextTab = $childTabs.eq(postion),
            $currentPane = $childPanes.eq(activePosition),
            $nextPane = $childPanes.eq(postion);

        $element.trigger(showEvent);

        if (this.tabbing || showEvent.isDefaultPrevented()) {
            return;
        }

        this.tabbing = true;

        $childTabs.removeClass("tab-active");
        $nextTab.addClass("tab-active");

        // Do some class shuffling to allow the transition.
        $currentPane.addClass("fade-out fade-in");
        $nextPane.addClass("tab-pane-active fade-out");
        $childPanes.filter(".fade-in").removeClass("tab-pane-active fade-in");

        // Force redraw.
        $nextPane.redraw().addClass("fade-in");

        // Do the callback
        callback.call(this);

    };

    // Tabs class definition
    var Tabs = function (element) {

        this.$element = $(element);
        this.tabbing = null;

        // TODO: Move this.
        this.$element.off(eclick).on(eclick, "ul.tabs > li > a", function (event) {

            event.preventDefault();

            var $this = $(this),
                $li = $this.parent(),
                index = $li.index();

            $(event.delegateTarget).tabs(index);

        });
    };

    Tabs.prototype.show = function (position) {

        var $activeItem = this.$element.find(".tab-active"),
             $children = $activeItem.parent().children(),
             activePosition = $children.index($activeItem),
             self = this;

        if (position > ($children.length - 1) || position < 0) {

            return false;
        }

        if (activePosition === position) {
            return false;
        }

        // Call the function with the callback
        return tab.call(this, activePosition, position, function () {

            var complete = function () {

                self.tabbing = false;
                self.$element.trigger($.Event(eshown));
            };

            // Do our callback
            supportTransition ? this.$element.one(supportTransition.end, complete) : complete();
        });
    };

    // Plug-in definition 
    var old = $.fn.tabs;

    $.fn.tabs = function (options) {

        return this.each(function () {

            var $this = $(this),
                data = $this.data("r.tabs");

            if (!data) {
                // Check the data and reassign if not present.
                $this.data("r.tabs", (data = new Tabs(this)));
            }

            // Show the given number.
            if (typeof options === "number") {
                data.show(options);
            }

        });
    };

    // Set the public constructor.
    $.fn.tabs.Constructor = Tabs;

    // No conflict.
    $.fn.tabs.noConflict = function () {
        $.fn.tabs = old;
        return this;
    };

    // Data API
    $(document).on(eready, function () {

        $("[data-tabs]").tabs();
    });

    w.RESPONSIVE_TABS = true;

}(jQuery, window, ".r.tabs.data-api"));