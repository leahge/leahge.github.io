jQuery(function () {
   if(!!jQuery('.is_hide_welcome').length){
       return false;
   }
    googletag.cmd.push(function () {
        var mappingWELCOME_AD = googletag.sizeMapping().addSize([1024, 0], [640, 480]).addSize([768, 0], [640, 480]).addSize([730, 0], [300, 250]).addSize([0, 0], [300, 250]).build();
        //var mappingWELCOME_AD = googletag.sizeMapping().addSize([1024, 0], [640, 480]).addSize([768, 0], [0,0]).addSize([730, 0], [0,0]).addSize([0, 0], [0,0]).build();
        var gptAdSlots = [];
        googletag.defineSlot('/122049170/WELCOME_AD', [640, 480], 'div-gpt-ad-1523434024271-0').defineSizeMapping(mappingWELCOME_AD).addService(googletag.pubads());
        googletag.pubads().setTargeting('site', ['MBBC']);
    });
    jQuery('#div-gpt-ad-1523434024271-0').html("<script> googletag.cmd.push(function() { googletag.display('div-gpt-ad-1523434024271-0'); });</script>");

    var welcome_ad = jQuery('.welcome-ad');
    var wd_InterValObj; //timer变量，控制时间
    var wd_count = 5; //间隔函数，1秒执行
    wd_num = 1;
    ad_flag = true;
    wd_a = setInterval(function () {
        ad(welcome_ad);
    }, 1000);
    var ad = function (welcome_ad) {
        wd_num++;
        if (wd_num > 5) {
            clearInterval(wd_a);
        }
        ;
        var iframe = welcome_ad.find('iframe');
        if (iframe.length&&ad_flag) {
            var body = welcome_ad.find('iframe')[0];
            if (body) {     //不为空的时候
                welcome_ad.css('display', 'block');
                clearInterval(wd_a);
                jQuery('.welcome-ad .count .thenum').text(wd_count);
                wd_InterValObj = setInterval(SetRemainTime, 1000); //启动计时器，1秒执行一次
                jQuery.get('https://www.eet-china.com/e/public/welcome_ad/cookie.php');
                ad_flag = false;
            }
        }
    }


    function SetRemainTime() {
        wd_count--;
        if (wd_count == 0) {
            clearInterval(wd_InterValObj);
            jQuery('.welcome-ad .count .iconfont').show();
            jQuery('.welcome-ad .count .thenum').hide();
        }
        else {
            jQuery('.welcome-ad .count .thenum').text(wd_count);
        }
    }
    jQuery('.iconfont').click(function () {
        jQuery('.welcome-ad').remove();
    })
})


