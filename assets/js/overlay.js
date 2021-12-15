function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    let regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    let results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

let channelName = getUrlParameter('channel');

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

// Check if a new message has been added to localStorage.
setInterval(function () {

    if (localStorage.getItem(channelName + '_Clicked_Usermsg') !== document.getElementById('overlay_message').innerHTML) {

        let profileImage = 'assets/images/default.jpg';

        if (localStorage.getItem(channelName + '_Clicked_Usermsg') !== '') {
            $("body").fadeOut(function () {
                document.getElementById('overlay_avatar').src = profileImage;
                document.getElementById('overlay_username').innerHTML = '';
                document.getElementById('overlay_message').innerHTML = '';
            });
        }

        if (document.getElementById('overlay_message').innerHTML !== '' || localStorage.getItem(channelName + '_Clicked_Usermsg') !== '') {
            getInfo(localStorage.getItem(channelName + '_Clicked_Username').toLowerCase(), function (data) {
                profileImage = data.data[0]['profile_image_url'];
            });
            $("body").fadeIn(function () {
                document.getElementById('overlay_avatar').src = profileImage;
                document.getElementById('overlay_username').innerHTML = localStorage.getItem(channelName + '_Clicked_Username');
                document.getElementById('overlay_message').innerHTML = localStorage.getItem(channelName + '_Clicked_Usermsg');
            });
        }

    }

    if (localStorage.getItem(channelName + '_Clicked_Usermsg') === '') {
        $("body").fadeOut();
    }

}, 1000);