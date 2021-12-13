// Twitch API: user info: user_id
function getInfo(channelName, callback) {
    let urlI = "https://twitchapi.teklynk.com/getuserinfo.php?channel=" + channelName + "";
    let xhrI = new XMLHttpRequest();
    xhrI.open("GET", urlI);
    xhrI.onreadystatechange = function () {
        if (xhrI.readyState === 4 && xhrI.status === 200) {
            callback(JSON.parse(xhrI.responseText));
            return true;
        } else {
            return false;
        }
    };

    xhrI.send();
}

