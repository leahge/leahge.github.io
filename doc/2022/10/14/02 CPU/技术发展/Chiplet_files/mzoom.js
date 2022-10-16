function mzoom(el, $) {
    this.init = function (el, $) {
        this.createContainer($)
        this.getImgGroup()
    }
    this.createContainer = function () {
        $('body').append(
            $('<div>').attr('id', 'zoom-container').css({
                width: '100%',
                height: 0,
                position: 'fixed',
                top: 0,
                'background-color': 'black',
                'z-index': 10000,
                overflow: 'hidden',
            }).click(function () {
                $(this).height(0)
            })
            // .append(
            //     $('<div>').addClass('swiper-container').css('height','100%')
            //         .append($('<div>').addClass('swiper-wrapper'))
            //         .append($('<div>').addClass('swiper-pagination').css('color','white'))
            // )
        )
    }
    this.getImgGroup = function () {
        $(el).each(function () {
            var _this = $(this),
                src = _this.attr('src'),
                pz;
            _this.click(function () {
                $('#zoom-container').css({
                    width: '100%',
                    height: '100vh',
                    position: 'fixed',
                    top: 0,
                    background: 'black',
                    display: 'unset',
                    'z-index': '100000'
                }).html(
                    $('<div>').css({
                        display: 'flex',
                        'align-items': 'center',
                        height: '100%'
                    }).html(
                        $('<img>').click(function () {
                            $('#zoom-container').css({
                                position: 'unset',
                                display: 'none'
                            })
                        }).attr('src', src).css({'width': '100%'})
                    )
                )

                pz = new PinchZoom($('#zoom-container img'), {
                    minZoom: 0.9
                });
                setTimeout(function () {
                    $('.pinch-zoom-container').css({
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        'align-items': 'center',
                    })
                }, 0)
            })
        });

        /*$(el).each(function (i,e) {
            var _this = $(this),
                src = _this.attr('src'),
                id = 'zoom_img_' + randomNum(10000, 999999);

            _this.click(function (index) {
                $('#zoom-container').css({
                    height: '100vh'
                })
                mySwiper.slideTo(i, 0);
            })

            $('.swiper-wrapper').append(
                $('<div>').addClass('swiper-slide').css({
                    display: 'flex',
                    'align-items': 'center',
                    'overflow': 'scroll',
                }).html(
                    $('<img>').attr('src', src).attr('id', id).css({'width': '100%'})
                )
            )
            new PinchZoom($('#' + id), {
                minZoom: 0.9
            });
        })
        var mySwiper = new Swiper('.swiper-container', {
            autoplay: false,
            loop: false,
            pagination: {
                el: '.swiper-pagination',
                type: 'fraction'
            },
        })*/
    }
}

function randomNum(minNum, maxNum) {
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * minNum + 1, 10);
            break;
        case 2:
            return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
            break;
        default:
            return 0;
            break;
    }
}


