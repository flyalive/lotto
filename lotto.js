
$(document).ready(function()
{
    init();
});

function init()
{
    // console.log("lotto")
    // $.ajax({
    //     url:'http://lotto.kaisyu.com/api?method=get&gno=850',
    //     ataType : "jsonp",
    //     jsonp : "callback",
    //
    //     success:function(data){
    //         console.log(data);
    //         //$('#time').append(data);

    // console.log("http://lotto.kaisyu.com/api?method=get&gno=850");




    $("#start_ajax").click(function(){
        $.ajax({
            type:"POST",
            url:"http://lotto.kaisyu.com/api?method=get&gno=850",
            data : {name : "홍길동"},
            dataType : "xml",
            success: function(xml){
                console.log(xml);
                },
            error: function(xhr, status, error) {
                alert(error);
                }
        });
        });
};