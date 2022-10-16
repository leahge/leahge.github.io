
$(function(){
    var windowWidth = $(window).width();
    if (windowWidth > 991 ){

        var tags,navheight,tags_h,tags_top,sum1,dom,LeftHeight,RightHeight,fg;
        function setFixedAD(){
            navheight = $('.nav-top-bg ').outerHeight() + $('.nav-bottom-bg ').outerHeight();
            dom = $('.right-tags');
            LeftHeight = $('.new-content').outerHeight();
            RightHeight = $('.detail-right').outerHeight();

            if(!tags_top){
                tags_top = dom.offset().top;   //右边tags距离顶部的距离
            }
            sum1 = $('.new-content').offset().top;
            scroll_top = $(window).scrollTop();
            if( LeftHeight < RightHeight){
                dom.css('top','');
                dom.css('position','static');
            }else{
                if( tags_top -70  < scroll_top ){
                    dom.addClass('public-r-seat');
                    dom.css('top',0+'px');
                }
                if( tags_top - 70 > scroll_top ){
                    dom.removeClass('public-r-seat');
                    dom.css('top','');

                }
               /* if( sum1 < scroll_top + tags_h){
                    add = sum1 - scroll_top-tags_h;
                    dom.css('top',add+'px');
                }*/
            }
            clearInterval(fg);
        }


        fg=setInterval(function () {
           if(!tags_h){
               return false;
           }
            setFixedAD();
        },1000)


        $(window).scroll(function(){
            clearInterval(fg);
            scroll_top = $(window).scrollTop();
            setFixedAD();
        });
    }

})