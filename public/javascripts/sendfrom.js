window.onload = function() {
    let userId = $(".userId").text();

    $.ajax({
        url: "/sendfrom/getbalance",
        type: "post",
        data: { userId: userId },
        async: false,
        success: function(result) {
            $(".balance").text(String(result.balance));
        },
        error: function(error) {
            console.log(error);
        }
    });

    $('.send').on("click", ()=> {
        $.ajax({
            url: "/sendfrom/getbalance",
            type: "post",
            data: { userId: userId },
            async: false,
            success: function(result) {
                console.log(result.balance);
                if(result.balance == 0) {
                    alert("[ ERROR ] :  Your balance is 0");
                    location.replace('/');
                }
            },
            error: function(error) {
                console.log(error);
            }
        });
    });
}