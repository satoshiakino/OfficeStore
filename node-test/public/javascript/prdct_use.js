function getCookieArray(){
    var arr = new Array();
    if(document.cookie != ''){
        var tmp = document.cookie.split(';');
        for(var i=0; i<tmp.length; i++){
            var data = tmp[i].split('=');
            arr[data[0]] = decodeURIComponent(data[1]);
        }
    }
    return arr;
}
var arr = getCookieArray();
var prdct_use = arr['prdct_use'];
console.log(prdct_use);
if(prdct_use == 'true'){
    alert("指定されたidは未精算のデータに使用されています。\nidを削除する場合は一度精算を行ってください。");
}
document.cookie = "prdct_use=true; max-age=0";