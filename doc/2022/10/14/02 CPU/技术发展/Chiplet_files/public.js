(function (jQuery) {
    // 鼠标移入公用插件
    jQuery.fn.toolsHover = function (opt) {
        var res = GetRequest();
        var par = res['index'];
        if (par != 'gfan') {
            var ua = navigator.userAgent.toLowerCase();
            var contains = function (a, b) {
                if (a.indexOf(b) != -1) {
                    return true;
                }
            };
            if (contains(ua, "ipad") || (contains(ua, "rv:1.2.3.4")) || (contains(ua, "0.0.0.0")) || (contains(ua, "8.0.552.237"))) {
                // console.log('ipad');
                return 0;
            }
            if ((contains(ua, "android") && contains(ua, "mobile")) || (contains(ua, "android") && contains(ua, "mozilla")) || (contains(ua, "android") && contains(ua, "opera"))
                || contains(ua, "ucweb7") || contains(ua, "iphone")) {
                // console.log('iphone');
            } else {
                var options = {
                    'className': 'open',
                };
                var options = jQuery.extend(options, opt);

                this.hover(function () {
                    jQuery(this).addClass(options.className);
                }, function () {
                    jQuery(this).removeClass(options.className);
                });
            }
        }
    };

    function GetRequest() {
        var url = location.search; //获取url中"?"符后的字串
        var theRequest = new Object();
        if (url.indexOf("?") != -1) {
            var str = url.substr(1);
            strs = str.split("&");
            for (var i = 0; i < strs.length; i++) {
                theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
            }
        }
        return theRequest;
    }


    // 手机端导航切换
    jQuery.fn.toolsSwitch = function (opt) {
        var options = {
            showBox: '',					// 显示的容器
            showButtonClass: '',			// 显示的按钮
            hideBox: '',					// 隐藏的容器
            hideButton: '',				// 隐藏的按钮
            hideButtonClass: ''			// 隐藏的按钮class
        };
        options = jQuery.extend(options, opt);
        this.click(function () {
            jQuery(options.showBox).toggle();
            jQuery(options.hideBox).hide();
            jQuery(options.hideButton).removeClass(options.hideButtonClass);
            if (jQuery(this).hasClass(options.showButtonClass)) {
                jQuery(this).removeClass(options.showButtonClass);
            } else {
                jQuery(this).addClass(options.showButtonClass);
            }
        });
    };


    //详情页面点赞
    jQuery.fn.thumbsUp = function (opt) {
        var options = {
            triggerBefore: '',
            triggerAfter: '',
            numTextContainer: '',
            numTextContainers: '',
            url: '',
            data: '',
            numText: 0,
            zanType: 1  // 1为文章点赞  2为评论点赞
        };
        options = jQuery.extend(options, opt);

        $('body').on('click','.'+options.triggerBefore,function () {
            var numText = $(this).find(options.numTextContainer).text();
            numText = parseInt(numText);
            numText += 1;
            options.numText = numText;
            if (options.zanType == 1) {
                var _this = $('.'+options.triggerBefore);
                options.numTextContainers = $(options.numTextContainer);
            } else if (options.zanType == 2) {
                var _this = $(this);
                options.numTextContainers = $(this).find(options.numTextContainer);
            }
            ajax(options, function() {
                _this.addClass(options.triggerAfter);
                _this.removeClass(options.triggerBefore);
            });
        });

        $('body').on('click','.'+options.triggerAfter,function () {
            var numText = $(this).find(options.numTextContainer).text();
            numText = parseInt(numText);
            numText -= 0;
            options.numText = numText;
            if (options.zanType == 1) {
                var _this = $('.'+options.triggerAfter);
                options.numTextContainers = $(options.numTextContainer);
            } else if (options.zanType == 2) {
                var _this = $(this);
                options.numTextContainers = $(this).find(options.numTextContainer);
            }
            ajax(options, function() {
                // _this.addClass(options.triggerBefore);
                // _this.removeClass(options.triggerAfter);
            });
        });

        function ajax(options, callback) {
            jQuery.ajax({
                type: "POST",
                url: options.url,
                data: options.data,
                dataType: "json",
                success: function (response) {
                    if(response.flag){
                        options.numTextContainers.text(options.numText);

                        callback && typeof callback == 'function' && callback();
                    } else {
                        alert(response.mes);
                    }
                },
                error:function (response) {
                    console.log(response);
                    alert('error444');
                }
            })
        }
    };
    (function($){
        $.fn.autoTextarea = function(options) {
            var defaults={
                maxHeight:null,
                minHeight:$(this).height()
            };
            var opts = $.extend({},defaults,options);
            return $(this).each(function() {
                $(this).bind("paste cut keydown keyup focus blur",function(){
                    var height,style=this.style;
                    this.style.height = opts.minHeight + 'px';
                    if (this.scrollHeight > opts.minHeight) {
                        if (opts.maxHeight && this.scrollHeight > opts.maxHeight) {
                            height = opts.maxHeight;
                            style.overflowY = 'scroll';
                        } else {
                            height = this.scrollHeight;
                            style.overflowY = 'hidden';
                        }
                        style.height = height + 'px';
                    }
                });
            });
        };
    })(jQuery);

})(jQuery);

