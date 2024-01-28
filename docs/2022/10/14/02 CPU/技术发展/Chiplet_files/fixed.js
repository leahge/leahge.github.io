$(function() {

//首页左边tag浮动
    var windowWidth = $(window).width();
    if( windowWidth > 991 ){
        indexTag();
    }
    $(window).resize(function(){
        indexTag();
        if( windowWidth > 991 ){
            indexTag();
        }
    });
    function indexTag(){
        $(window).scroll(function () {
            scrollTop = $(window).scrollTop();
            indexTagScroll();
        });
        indexTagScroll();
    }
    function indexTagScroll(){
        var channelTop = $('.channel').offset().top;
        var scrollTop = $(window).scrollTop();
        var width = $('.channel').width();
        /*var height = $('.new-content').height();*/
        var height = $(window).height();
        var footerHeight = $('footer').height();
        var windowWidth = $(window).width();
        if( windowWidth > 991 ){
            if( scrollTop > channelTop){
                $('.channel-list').addClass('channel-list-fixed');
                $('.channel-list').css({
                    'width': width,
                    'height': height
                });
                $('.channel').height( height);
                $('.channel-list-seat').height(height);
            }
            else{
                $('.channel-list').removeClass('channel-list-fixed');
            }

            if($('.index-channel-list-seat').length){
                $('.channel-list-seat').niceScroll({
                    cursorcolor: "#ccc",//#CC0071 光标颜色
                    cursoropacitymax: 0, //改变不透明度非常光标处于活动状态（scrollabar“可见”状态），范围从1到0
                    touchbehavior: false, //使光标拖动滚动像在台式电脑触摸设备
                    cursorwidth: "5px", //像素光标的宽度
                    cursorborder: "0", // 	游标边框css定义
                    cursorborderradius: "5px",//以像素为光标边界半径
                    autohidemode: false //是否隐藏滚动条
                });
            }
        }
        else{
            var css = {
                width:'96%',
                height: '50px'
            };
            $('.channel-list').removeClass('channel-list-fixed');
            $('.channel-list').css(css);
            $('.channel').css('height','50px');
            $('.channel-list-seat').css('height','50px');
        }
    }
});
