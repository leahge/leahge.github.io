$(function() {
    //二级菜单鼠标移入移出添加和删除class属性
    $('.nav-mianbaoban .dropdown').toolsHover();
    //登录div移入时显示二级菜单
    $('.nav-login-user').toolsHover();

    $('.two-nav').toolsHover();

    //点击搜索按钮切换
    $('.nav-search-xs').toolsSwitch({
        showBox: '.nav-search-xs-con',
        hideBox: '.nav-list-xs',
        hideButton: '.nav-menu-xs',
        hideButtonClass: 'nav-menu-xs-active',
        showButtonClass: 'nav-search-xs-active'
    });

    //点击菜单按钮切换
    $('.nav-menu-xs').toolsSwitch({
        showBox: '.nav-list-xs',
        hideBox: '.nav-search-xs-con',
        hideButton: '.nav-search-xs',
        hideButtonClass: 'nav-search-xs-active',
        showButtonClass: 'nav-menu-xs-active'
    });
//pc端点击搜索点击
    $('.nav-search .search-input').click(function () {
        $('.nav-search-before').animate({
            width:"298px"
        },300,'linear');
        $('.nav-search').addClass('nav-search-after');
        $('.nav-search .search-option').show();
        $('.nav-search .theline').show();
    });

    $(document).bind("click",function(e){
        var target  = $(e.target);
        if(target.closest(".nav-search").length == 0){
            $('.nav-search-before').animate({
                width:"240px"
            },300,'linear');
            $('.nav-search').removeClass('nav-search-after');
            $('.nav-search .search-option').hide();
            $('.nav-search .theline').hide();
        }
    });


    //手机端添加浮动导航
    var windowWidth = $(window).width();
    function navbarFixed() {
        if ( windowWidth < 991 ){
            $('.nav-bottom-bg').addClass('navbar-fixed-top');
        }
        else{
            $('.nav-bottom-bg').removeClass('navbar-fixed-top');
        }
    }
    navbarFixed();
    $(window).resize(function () {
        windowWidth = $(window).width();
        navbarFixed();
    });


    //如果二级菜单和搜索框显示，点击头像则隐藏
    $('.user-pic-xs').click(function () {
        if ($('.nav-list-xs').is(":visible")) {
            $('.nav-list-xs').hide();
            $('.nav-menu-xs .close-btn').css('display', 'none');
            $('.nav-menu-xs .menu-btn').css('display', 'block');
        }
        if ($('.nav-search-xs-con').is(":visible")) {
            $('.nav-search-xs-con').hide();
            $('.nav-search-xs .close-btn').css('display', 'none');
            $('.nav-search-xs .search-btn').css('display', 'block');
        }
    });

    // 手机端二级菜单显示隐藏
    $('.nav-list-xs li .theOne').click(function () {
        $(this).next(".nav-list-subnav").slideToggle(300);
        $(this).parent('.nav-list-xs li').siblings('.nav-list-xs li').children(".nav-list-subnav").slideUp(500);
    });

//模拟搜索下拉菜单
    var searchOption = jQuery('.search-option ul');
    var searchOptionLi = searchOption.find('li');
    var searchOptionValue = jQuery('.search-option-value');
    var FirstText = jQuery('.search-option .thetitle').text();
    searchOptionValue.find('.thetext').text(FirstText);
    var FirstTextXs = jQuery('.search-option .thetitle-xs').text();
    searchOptionValue.find('.thetext-xs').text(FirstTextXs);
    searchOptionValue.click(function() {
        searchOption.toggle();
    });

    searchOptionLi.click(function(){
        var text = jQuery(this).text();
        var value = jQuery(this).attr('value');
        searchOptionValue.find('.thetext').text(text);
        searchOptionValue.find('.thetext-xs').text(text);
        searchOption.toggle();
        jQuery('input[name=show]').val(value);
    });
    /*返回顶部*/
    $(function () {
        $(window).scroll(function () {
            var scTop = $(window).scrollTop();
            if (scTop > 0) {
                $(".sidebar-top").css("display", "block");
            } else {
                $(".sidebar-top").css("display", "none");
            }
        });
        $(".sidebar-top").click(function () {
            $('body,html').animate({scrollTop: 0}, 500);
        });
    });


});
	




	