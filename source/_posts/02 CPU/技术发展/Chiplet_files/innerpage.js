var googletag = googletag || {};
googletag.cmd = googletag.cmd || [];
(function() {
    var gads = document.createElement('script');
    gads.async = true;
    gads.type = 'text/javascript';
    var useSSL = 'https:' == document.location.protocol;
    gads.src = (useSSL ? 'https:' : 'http:') +
        '//www.googletagservices.com/tag/js/gpt.js';
    var node = document.getElementsByTagName('script')[0];
    node.parentNode.insertBefore(gads, node);
})();


jQuery(document).ready(function(){

    googletag.cmd.push(function() {

        var mappingTOP_LEADERBOARD = googletag.sizeMapping().
        addSize([1024, 0], [[970, 90],[728, 90],[970,150]]).
        addSize([768, 0], [728, 90]).
        addSize([730, 0], [728, 90]).
        addSize([0, 0], [300, 100]).
        build();

        var mappingTOP_LEADERBOARD_COMMENT = googletag.sizeMapping().
        addSize([1024, 0], [728, 90]).
        addSize([768, 0], [728, 90]).
        addSize([730, 0], [728, 90]).
        addSize([0, 0], [300, 100]).
        build();

        var mappingMID_LEADERBOARD_COMMENT = googletag.sizeMapping().
        addSize([1024, 0], [728, 90]).
        addSize([768, 0], [728, 90]).
        addSize([730, 0], [728, 90]).
        addSize([0, 0], [300, 100]).
        build();

        var mappingMID_LEADERBOARD = googletag.sizeMapping().
        addSize([1024, 0], [[970, 90],[728, 90]]).
        addSize([768, 0], [728, 90]).
        addSize([730, 0], [728, 90]).
        addSize([0, 0], [300, 100]).
        build();

        var mappingBTM_LEADERBOARD = googletag.sizeMapping().
        addSize([1024, 0], [970, 90]).
        addSize([768, 0], [728, 90]).
        addSize([730, 0], [728, 90]).
        addSize([0, 0], [300, 100]).
        build();

        var mappingTOP_RECTANGLE = googletag.sizeMapping().
        addSize([1024, 0], [300, 250]).
        addSize([768, 0], [300, 250]).
        addSize([730, 0], [300, 250]).
        addSize([0, 0], [300, 250]).
        build();

        var mappingMID_RECTANGLE = googletag.sizeMapping().
        addSize([1024, 0], [300, 250]).
        addSize([768, 0], [300, 250]).
        addSize([730, 0], [300, 250]).
        addSize([0, 0], [300, 250]).
        build();

        var mappingMID_LEADERBOARD2 = googletag.sizeMapping().
        addSize([1024, 0], [[728, 90]]).
        addSize([768, 0], [728, 90]).
        addSize([730, 0], [728, 90]).
        addSize([0, 0], [300, 100]).
        build();

        var mappingBLOG_TEXT_AD = googletag.sizeMapping().
        addSize([1024, 0], [860, 125]).
        addSize([992, 0], [680, 120]).
        addSize([768, 0], [735, 120]).
        addSize([0, 0], [310, 75]).
        build();
        //定制版块儿广告
        var mappingFTOP_LEADERBOARD = googletag.sizeMapping().
        addSize([1200, 0], [[970, 90],[728, 90]]).
        addSize([1024, 0], [728, 90]).
        addSize([768, 0], [728, 90]).
        addSize([0, 0], [300, 100]).
        build();

        var mappingFMID_LEADERBOARD = googletag.sizeMapping().
        addSize([1200, 0], [[970, 90],[728, 90]]).
        addSize([1024, 0], [728, 90]).
        addSize([768, 0], [728, 90]).
        addSize([0, 0], [300, 100]).
        build();

        var mappingFBTM_LEADERBOARD = googletag.sizeMapping().
        addSize([1200, 0], [[970, 90],[728, 90]]).
        addSize([1024, 0], [728, 90]).
        addSize([768, 0], [728, 90]).
        addSize([0, 0], [300, 100]).
        build();


        var gptAdSlots = [];

        if(jQuery('#div-gpt-ad-1512032390436-0').length>0){
            googletag.defineSlot('/122049170/TOP_LEADERBOARD', [[300, 250], [728, 90], [970, 90], [970, 250], [300, 100], [728, 250],[970,150]], 'div-gpt-ad-1512032390436-0').defineSizeMapping(mappingTOP_LEADERBOARD).addService(googletag.pubads());
        }
        if(jQuery('#div-gpt-ad-1512032390436-3').length>0){
            googletag.defineSlot('/122049170/BTM_LEADERBOARD', [[300, 250], [728, 90], [970, 90], [970, 250], [300, 100], [728, 250]], 'div-gpt-ad-1512032390436-3').defineSizeMapping(mappingBTM_LEADERBOARD).addService(googletag.pubads());
        }
        if(jQuery('#div-gpt-ad-1515756551439-1').length>0){
            googletag.defineSlot('/122049170/TOP_RECTANGLE', [[300, 100], [300, 250]], 'div-gpt-ad-1515756551439-1').defineSizeMapping(mappingTOP_RECTANGLE).addService(googletag.pubads());
        }
        if(jQuery('#div-gpt-ad-1515756551439-3').length>0){
            googletag.defineSlot('/122049170/MID_RECTANGLE', [[300, 100], [300, 250]], 'div-gpt-ad-1515756551439-3').defineSizeMapping(mappingMID_RECTANGLE).addService(googletag.pubads());
        }
        if(jQuery('#div-gpt-ad-1515756551439-7').length>0){
            googletag.defineSlot('/122049170/MID_LEADERBOARD', [[300, 250], [728, 90], [300, 100], [728, 250]], 'div-gpt-ad-1515756551439-7').defineSizeMapping(mappingMID_LEADERBOARD2).addService(googletag.pubads());
        }
        if(jQuery('#div-gpt-ad-1515756551439-2').length>0){
            googletag.defineSlot('/122049170/MID_LEADERBOARD', [[728, 90], [300, 100]], 'div-gpt-ad-1515756551439-2').defineSizeMapping(mappingMID_LEADERBOARD_COMMENT).addService(googletag.pubads());
        }
        if(jQuery('#div-gpt-ad-1515756551439-5').length>0){
            googletag.defineSlot('/122049170/MID_LEADERBOARD', [[728, 90], [300, 100]], 'div-gpt-ad-1515756551439-5').defineSizeMapping(mappingTOP_LEADERBOARD_COMMENT).addService(googletag.pubads());
        }
        if(jQuery('#div-gpt-ad-1515756551439-6').length>0){
            googletag.defineSlot('/122049170/BTM_LEADERBOARD', [[300, 250], [728, 90], [970, 90], [970, 250], [300, 100], [728, 250]], 'div-gpt-ad-1515756551439-6').defineSizeMapping(mappingBTM_LEADERBOARD).addService(googletag.pubads());
        }
        if(jQuery('#div-gpt-ad-1515756551440-0').length>0){
            googletag.defineSlot('/122049170/BLOG_TEXT_AD', [[680, 120], [310, 75], [735, 120], [860, 125]], 'div-gpt-ad-1515756551440-0').defineSizeMapping(mappingBLOG_TEXT_AD).addService(googletag.pubads());
        }

        googletag.pubads().enableSingleRequest();
        googletag.pubads().setTargeting('site', ['EETC']).setTargeting('page', ['article','browse']).setTargeting('keyword', ['ROS']);

        googletag.pubads().setCentering(true);
        googletag.pubads().collapseEmptyDivs(true);

        googletag.enableServices();
    });

    if(jQuery('#div-gpt-ad-1512032390436-0').length>0){
       jQuery('#div-gpt-ad-1512032390436-0').html("<script> googletag.cmd.push(function() { googletag.display('div-gpt-ad-1512032390436-0'); });</script>");
    }
    if(jQuery('#div-gpt-ad-1512032390436-3').length>0){
        jQuery('#div-gpt-ad-1512032390436-3').html("<script> googletag.cmd.push(function() { googletag.display('div-gpt-ad-1512032390436-3'); });</script>");
    }
    if(jQuery('#div-gpt-ad-1515756551439-1').length>0){
        jQuery('#div-gpt-ad-1515756551439-1').html("<script> googletag.cmd.push(function() { googletag.display('div-gpt-ad-1515756551439-1'); });</script>");
    }
    if(jQuery('#div-gpt-ad-1515756551439-3').length>0){
        jQuery('#div-gpt-ad-1515756551439-3').html("<script> googletag.cmd.push(function() { googletag.display('div-gpt-ad-1515756551439-3'); });</script>");
    }
    if(jQuery('#div-gpt-ad-1515756551439-2').length>0){
        jQuery('#div-gpt-ad-1515756551439-2').html("<script> googletag.cmd.push(function() { googletag.display('div-gpt-ad-1515756551439-2'); });</script>");
    }
    if(jQuery('#div-gpt-ad-1515756551439-5').length>0){
        jQuery('#div-gpt-ad-1515756551439-5').html("<script> googletag.cmd.push(function() { googletag.display('div-gpt-ad-1515756551439-5'); });</script>");
    }
    if(jQuery('#div-gpt-ad-1515756551439-6').length>0){
        jQuery('#div-gpt-ad-1515756551439-6').html("<script> googletag.cmd.push(function() { googletag.display('div-gpt-ad-1515756551439-6'); });</script>");
    }
    if(jQuery('#div-gpt-ad-1515756551439-7').length>0){
        jQuery('#div-gpt-ad-1515756551439-7').html("<script> googletag.cmd.push(function() { googletag.display('div-gpt-ad-1515756551439-7'); });</script>");
    }
    if(jQuery('#div-gpt-ad-1515756551440-0').length>0){
        jQuery('#div-gpt-ad-1515756551440-0').html("<script> googletag.cmd.push(function() { googletag.display('div-gpt-ad-1515756551440-0'); });</script>");
    }
});



