$(function () {
    $('.dialogBox').css('height', ($(window).height()) * 0.8)
    if(!localStorage.getItem('apikey')) {
        $('.apikey').show()
    }
    $('.apikeyBtn').on('click', function () {
        if($('.apikeyInput').val()) {
            localStorage.setItem('apikey', $('.apikeyInput').val())
            $('.apikey').hide(300)
        }
    })
    function getData() {
        var text = $('.text').val();
        if(text === '') return;
        $('.dialogBox').append('<p class="right"><img src="./images/logo.png" alt="logo"></p><p class="rightContent"><span>' + text +'</span></p>')
        $('.text').val('')
        $('.dialogBox').scrollTop($('.dialogBox').prop('scrollHeight'))
        var Authorization = 'Bearer ' + localStorage.getItem('apikey'),
            data = JSON.stringify({
                model : 'text-davinci-003',
                user : '1',
                max_tokens : 1000,
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
                $('.dialogBox').append('<p class="left"><img src="./images/charGPT.png" alt="charGpt-log"></p><p class="leftContent"><span>' + res.choices[0].text + '</span></p>')
                $('.dialogBox').scrollTop($('.dialogBox').prop('scrollHeight'))
            },
            error : function (err) {
                err = JSON.parse(err.responseText)
                $('.dialogBox').append('<p class="left"><img src="./images/charGPT.png" alt="charGpt-log"></p><p class="leftContent"><span>' + err.error.message + '</span></p>')
                $('.dialogBox').scrollTop($('.dialogBox').prop('scrollHeight'))
            }
        })
    }
    function headerDown() {
        var count = 0;
        timer = setInterval(function () {
            count ++;
            if(count == 2) {
                count = 0;
                clearInterval(timer)
                $('.apikey').fadeIn(300)
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
    $('.send').on('click', getData)
    $('.apikeyInput').on('keydown', function (e) {
        if(e.keyCode == 13) $('.apikeyBtn').click();
    })
    $('.text').on('keydown', function (e) {
        if(e.keyCode == 13) getData();
    })
})