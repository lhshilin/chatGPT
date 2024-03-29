$(function () {
    var key = true,
        apikey = localStorage.getItem('apikey3.0'),
        chatRecords = JSON.parse(localStorage.getItem('chatGPT3.0ChatRecords')),
        text = localStorage.getItem('chatGPT3.0Text');
    $('.dialogBox').css('height', ($(window).height()) * 0.8);
    $('.dialogBox .left:first-child .time').html(nowTime());
    $('.dialogBox .leftText:first-child').css('height', $('.dialogBox .leftText:first-child').prop('scrollHeight'))
    text ? $('input:eq(0)').val(text) : null;
    $('input:eq(0)').focus().on('input', function () {
        localStorage.setItem('chatGPT3.0Text', $(this).val())
    });
    if(chatRecords && chatRecords !== []) {
        $.each(chatRecords, function (i, e) {
            if(e.spokesman == 'left') {
                $('.dialogBox').append('<p class="right"><span class="time">' + e.time + '</span><img src="./images/oneSelf.jpg" alt="logo"></p><p class="rightContent"><textarea class="rightText" disabled>' + e.text +'</textarea></p>')
                $('.dialogBox .rightText:last').css('height', $('.dialogBox .rightText:last').prop('scrollHeight'))
            } else {
                $('.dialogBox').append('<p class="left"><img src="./images/chatGPT.png" alt="chatGPT-log"><span class="time">' + e.time + '</span></p><p class="leftContent"><textarea class="leftText" disabled>' + e.text + '</textarea></p>')
                $('.dialogBox .leftText:last').css('height', $('.dialogBox .leftText:last').prop('scrollHeight'))
            }
        })
        $('.dialogBox').scrollTop($('.dialogBox').prop('scrollHeight'))
    } else {
        localStorage.setItem('chatGPT3.0ChatRecords', "[]");
        chatRecords = [];
    }
    function nowTime() {
        var time = new Date();
        function zeroPadding(num) {
            if(num < 10) {
                return '0' + num
            }
            return num
        }
        time = time.getFullYear() + '年' + (time.getMonth() + 1) + '月' + time.getDate() + '日 ' + zeroPadding(time.getHours()) + ':' + zeroPadding(time.getMinutes()) + ':' + zeroPadding(time.getSeconds());
        return time
    }
    if(!apikey) {
        $('.apikey').show(300)
        $('.cover').show()
        $('body').css('overflow', 'hidden')
        $('.apikeyInput').focus()
    } else {
        $('.text').focus()
    }
    function getApiKey() {
        var apikeyInput = $('.apikeyInput').val();
        apikey = apikeyInput;
        localStorage.setItem('apikey', apikeyInput)
        $('.apikey').hide(300)
        $('.cover').hide()
        $('body').css('overflow', 'visible')
        $('.text').focus()
    }
    $('.apikeyBtn').on('click', function () {
        if($('.apikeyInput').val() !== '') getApiKey()
    })
    $('.apikey .apikeyInput').on('keydown', function (e) {
        if(e.keyCode == 13) {
            if($(this).val() !== '') getApiKey()
        }
    })
    function returnData(data) {
        var time = nowTime();
        chatRecords.push({
            spokesman : 'right',
            time : time,
            text : data
        });
        localStorage.setItem('chatGPT3.0ChatRecords', JSON.stringify(chatRecords));
        $('.dialogBox .leftText:last').html($.trim(data)).css('height', $('.dialogBox .leftContent:last-child .leftText').prop('scrollHeight'))
        $('.dialogBox .left:nth-last-child(2) .time').html(time)
        $('.dialogBox').scrollTop($('.dialogBox').prop('scrollHeight'))
        key = true;
        $('.send').on('click', getData)
    }
    // 得到回复信息
    function getData() {
        key = false;
        $('.send').off('click')
        var text = $.trim($('.text').val());
        if(text === '') return;
        var time = nowTime();
        chatRecords.push({
            spokesman : 'left',
            time : time,
            text : text
        });
        localStorage.setItem('chatGPT3.0ChatRecords', JSON.stringify(chatRecords));
        localStorage.setItem('chatGPT3.0Text', '');
        $('.dialogBox').append('<p class="right"><span class="time">' + time + '</span><img src="./images/oneSelf.jpg" alt="logo"></p><p class="rightContent"><textarea class="rightText" disabled>' + text +'</textarea></p><p class="left"><img src="./images/chatGPT.png" alt="chatGPT-log"><span class="time"></span></p><p class="leftContent"><textarea class="leftText" disabled>chatGPT正在思考中...</textarea></p>')
        $('.text').val('')
        $('.dialogBox .rightText:last').css('height', $('.dialogBox .rightText:last').prop('scrollHeight'))
        $('.dialogBox').scrollTop($('.dialogBox').prop('scrollHeight'))
        var Authorization = 'Bearer ' + apikey,
            data = JSON.stringify({
                model : 'text-davinci-003',
                user : '1',
                max_tokens : 2000,
                temperature : 0.5,
                frequency_penalty : 0,
                presence_penalty : 0,
                prompt : text
            });
        $.ajax({
            url : 'https://api.openai.com/v1/completions',
            type : 'post',
            dataType : 'json',
            headers : {
                Authorization : Authorization,
                'Content-Type' : 'application/json'
            },
            data : data,
            success : function (res) {
                returnData(res.choices[0].text)
            },
            error : function (err) {
                if(err.responseText) {
                    err = JSON.parse(err.responseText)
                    returnData(err.error.message)
                } else {
                    returnData('对不起，chatGPT不能收到你的消息')
                }
            }
        })
    }
    // 长按效果
    function headerDown() {
        var count = 0;
        timer = setInterval(function () {
            count ++;
            if(count == 2) {
                count = 0;
                clearInterval(timer)
                $('.apikey').fadeIn(300)
                $('.cover').show()
                $('body').css('overflow', 'hidden')
                $('.apikeyInput').focus()
            }
        }, 1000)
        return timer
    }
    $('.header img').on({
        mousedown : function () {
            headerDown()
            $('.header img').on('mouseup', function () {
                count = 0;
                clearInterval(timer)
                return false;
            }) 
        },
        touchstart : function () {
            headerDown()
            $('.header img').on('touchend', function () {
                count = 0;
                clearInterval(timer)
                return false;
            }) 
        }
    })
    $('.header span').on('dblclick', function () {
        chatRecords = [];
        localStorage.setItem('chatGPT3.0ChatRecords', "[]");
        $('.dialogBox').html('')
        $('input:eq(0)').val('')
        localStorage.setItem('chatGPT3.0Text', '')
    })
    $('.send').on('click', getData)
    $('.text').on('keydown', function (e) {
        if(e.keyCode == 13 && key) getData();
    })
})