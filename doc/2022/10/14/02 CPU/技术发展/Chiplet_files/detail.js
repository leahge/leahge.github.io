$(function () {

    //地址
    var digTopUrl = 'https://mbb.eet-china.com/specialcolumn.php?mod=specialcolumn&do=special';
    var reply_id = 1;
    var article_id = 10;


   //点击回复出现回复框
   var bgLayer = $('.bg-layer');
   var beforeBox = $('.art-comment-xs');
   var InputBox = $('.art-comment-area-xs');
   var shareBox = $('.share-box-xs');
   var textarea = InputBox.find('textarea');
   var windowwidth = $(window).width();
   if( windowwidth > 767 ){
       var size = 0;
       $('body').on('click','.reply-icon',function () {
           var strhtml  = '<div class="comment-from reply-comment-from">\n' +
               '            <from action="">\n' +
               '            <div class="comment-input">\n' +
               '            <textarea id="reply_message" placeholder="请输入评论..."></textarea>\n' +
               '            <div class="comment-submit-btn">\n' +
               '            <a href="javascript:void (0)" class="reply-cancle">取消</a>\n' +
               '            <a href="javascript:void (0)" id="sendmessage" >发送</a>\n' +
               '            </div>\n' +
               '            </div>\n' +
               '            </from>\n' +
               '            </div>';
           size = $(this).parents('.comment-list').find('.reply-comment-from').length;
           if( size < 1 ){
               $(this).parent('.operate-icon').after(strhtml);
               $(this).parents('.comment-list').siblings('.comment-list').find('.reply-comment-from').remove();
           }
       });
       $('.comment-list').parent().on('click','.reply-cancle',function () {

           $(this).parents('.reply-comment-from').remove();
       });
       $('.comment-list').parent().on('click','#sendmessage',function () {
           var reply_message = $('#reply_message').val();
           var id = $(this).parents('.comment-list').attr('id');
           //ajax回复评论
           $.ajax({
               url: 'https://mbb.eet-china.com/specialcolumn.php?mod=specialcolumn&do=special',
               type: 'POST',
               xhrFields: {withCredentials: true},
               crossDomain: true,
               data:{reply_comment:'reply_comment',id:id,'reply_message':reply_message},
               success: function (data) {
                  if(data==1){
                      location.reload();//重新加载当前页面
                  }
               }
           })
       });

   }
   else{
       var strhtml = '<textarea placeholder="回复趣味科技..."></textarea>\n' +
           '        <div class="comment-submit-btn">\n' +
           '            <a href="javascript:void (0)" class="pl-cancle-btn">取消</a>\n' +
           '            <a href="javascript:void (0)">发送</a>\n' +
           '        </div>';
       $('.comment-list').on('click','.reply-icon',function () {
           InputBox.html(strhtml);
           textarea = $('.art-comment-area-xs').find('textarea');
           beforeBox.hide();
           InputBox.show();
           bgLayer.show();
           textarea.focus();
       });
       bgLayer.click(function () {
            $('.art-comment-area-xs').empty();
       })
   }


   /*点击我要评论出现评论框*/
   var commentInputLg = $('.comment-input');
   var commentInputLgHtml = commentInputLg.html();
   if( windowwidth < 767 ){
       $('.mypl-xs').click(function () {
           InputBox.html(commentInputLgHtml);
           textarea = $('.art-comment-area-xs').find('textarea');
           beforeBox.hide();
           InputBox.show();
           bgLayer.show();
           textarea.focus();
           commentInputLg.empty();
           $('html,body').addClass('disable-scroll');
       });
       $('.art-comment-area-xs').on('click','.pl-cancle-btn',function () {
           InputBox.html('');
           bgLayer.hide();
           InputBox.hide();
           beforeBox.show();
           commentInputLg.html(commentInputLgHtml);
           $('html,body').removeClass('disable-scroll');
       });
   }

    /*点击bgLayer 黑色背景效果*/
    bgLayer.click(function(){
        beforeBox.show();
        InputBox.hide();
        bgLayer.hide();
        shareBox.hide();
        commentInputLg.html(commentInputLgHtml);
        $('html,body').removeClass('disable-scroll');
    });


    //点击我知道啦
    $('.share-btn-xs').click(function(){
        beforeBox.hide();
        shareBox.show();
        bgLayer.show();
        $('html,body').addClass('disable-scroll');
        return false;
    });

    //如果是微信端分享，则分享到朋友圈
    function shareWeixinXs(){
        var shareWeixin = $('.share-weixin-box-xs-bg');
        $('.share-box-xs .weixin').click(function(){
            shareWeixin.show();
            bgLayer.hide();
        });
        $('.share-weixin-box-xs-bg .thebtn').click(function(){
            shareWeixin.hide();
            bgLayer.show();
        })
    }

    //如果是浏览器分享，则使用浏览器分享功能
    function shareBrowserXs(){
        var shareBrowser = $('.share-weixin-browser-xs-bg');
        $('.share-box-xs .weixin').click(function(){
            shareBrowser.show();
            bgLayer.hide();
        });
        $('.share-weixin-browser-xs-bg .thebtn').click(function(){
            shareBrowser.hide();
            bgLayer.show();
        })
    }

    function isWeiXin() {
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == "micromessenger") {
            return true
        } else {
            return false
        }
    }
    if (isWeiXin()) {
        shareWeixinXs();
    } else {
        shareBrowserXs();
    }

    var id=$("#id").val();
    //文章点赞
    $('body').thumbsUp({
        triggerBefore: 'article-thumbs-icon',
        triggerAfter: 'article-thumbs-icon-a',
        numTextContainer: '.article-thumbs-number',
        url:digTopUrl,
        data:{'article_click':'article_click',id:id},
        zanType:1
    });

    //评论点赞
    // $('.operate-icon').thumbsUp({
    //     triggerBefore: 'reply-thumbs-icon',
    //     triggerAfter: 'reply-thumbs-icon-a',
    //     numTextContainer: 'strong',
    //     url:digTopUrl,
    //     data:{'reply_id':reply_id},
    //     zanType: 2
    // });



    //点击评论icon显示到对应的位置
    var replyIcon = $('.reply-icon-seat');
    var Top = $('.comment-title').offset().top;
    var navheight = $('.nav-bg').height();
    replyIcon.click(function() {
        $('html,body').animate({scrollTop:Top - navheight - 10},800);
    });

    $("[data-toggle='tooltip']").tooltip();




});



