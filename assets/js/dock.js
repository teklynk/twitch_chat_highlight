function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    let regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    let results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

let scroll = false;

function autoScroll() {
    let browserWindowHeight = $(window).height();
    let elem = document.getElementById('chat');
    $('#chat').height(browserWindowHeight);
    elem.scrollTop = elem.scrollHeight;
}

function stopAutoScroll() {
    clearInterval(scroll);
    document.getElementById('chat').scrollTop = 10000;
}

function startAutoScroll() {
    scroll = setInterval(autoScroll, 500);
}

let channelName = getUrlParameter('channel');
let refreshRate = 0;
let chatTimer;
let chatCount = 0;
let channels = [channelName], // Channels to initially join
    fadeDelay = false, // Set to false to disable chat fade
    showChannel = true, // Show repespective channels if the channels is longer than 1
    useColor = true, // Use chatters' colors or to inherit
    showBadges = true, // Show chatters' badges
    showEmotes = true, // Show emotes in the chat
    doTimeouts = true, // Hide the messages of people who are timed-out
    doChatClears = true, // Hide the chat from an entire channel
    showHosting = true, // Show when the channel is hosting or not
    refresh = 0,
    chatLimit = 100,
    transition = '',
    showNotices = false, // Show chat-delete-timeout chat-timedout chat-notice
    botAccount = [''],
    debugMode = false,
    showConnectionNotices = false; // Show messages like "Connected", "Disconnected", "Parted"


let chat = document.getElementById('chat'),
    defaultColors = ['rgb(255, 0, 0)', 'rgb(0, 0, 255)', 'rgb(0, 128, 0)', 'rgb(178, 34, 34)', 'rgb(255, 127, 80)', 'rgb(154, 205, 50)', 'rgb(255, 69, 0)', 'rgb(46, 139, 87)', 'rgb(218, 165, 32)', 'rgb(210, 105, 30)', 'rgb(95, 158, 160)', 'rgb(30, 144, 255)', 'rgb(255, 105, 180)', 'rgb(138, 43, 226)', 'rgb(0, 255, 127)'],
    randomColorsChosen = {},
    clientOptions = {
        options: {
            debug: debugMode
        },
        channels: channels
    },
    client = new tmi.client(clientOptions);

function dehash(channel) {
    return channel.replace(/^#/, '');
}

function capitalize(n) {
    return n[0].toUpperCase() + n.substr(1);
}

function htmlEntities(html) {
    function it() {
        return html.map(function (n, i, arr) {
            if (n.length == 1) {
                return n.replace(/[\u00A0-\u9999<>\&]/gim, function (i) {
                    return '&#' + i.charCodeAt(0) + ';';
                });
            }
            return n;
        });
    }

    let isArray = Array.isArray(html);
    if (!isArray) {
        html = html.split('');
    }
    html = it(html);
    if (!isArray) html = html.join('');
    return html;
}

function formatEmotes(text, emotes) {
    let splitText = text.split('');
    for (let i in emotes) {
        let e = emotes[i];
        for (let j in e) {
            let mote = e[j];
            if (typeof mote == 'string') {
                mote = mote.split('-');
                mote = [parseInt(mote[0]), parseInt(mote[1])];
                let length = mote[1] - mote[0],
                    empty = Array.apply(null, new Array(length + 1)).map(function () {
                        return ''
                    });
                splitText = splitText.slice(0, mote[0]).concat(empty).concat(splitText.slice(mote[1] + 1, splitText.length));
                splitText.splice(mote[0], 1, '<img class="emoticon" src="https://static-cdn.jtvnw.net/emoticons/v1/' + i + '/3.0">');
            }
        }
    }
    return htmlEntities(splitText).join('')
}

function badges(chan, user, isBot) {

    function createBadge(name) {
        let badge = document.createElement('div');
        badge.className = 'chat-badge-' + name;
        return badge;
    }

    let chatBadges = document.createElement('span');
    chatBadges.className = 'chat-badges';

    if (!isBot) {
        if (user.username === chan) {
            chatBadges.appendChild(createBadge('broadcaster'));
        }
        if (user['user-type']) {
            chatBadges.appendChild(createBadge(user['user-type']));
        }
        if (user.turbo) {
            chatBadges.appendChild(createBadge('turbo'));
        }
    } else {
        chatBadges.appendChild(createBadge('bot'));
    }

    return chatBadges;
}

function handleChat(channel, user, message, self) {

    if (self) return;

    chatCount++;

    let chan = dehash(channel),
        name = user.username,
        chatLine = document.createElement('div'),
        chatChannel = document.createElement('span'),
        chatName = document.createElement('span'),
        chatColon = document.createElement('span'),
        chatMessage = document.createElement('span');

    let color = useColor ? user.color : 'inherit';
    if (color === null) {
        if (!randomColorsChosen.hasOwnProperty(chan)) {
            randomColorsChosen[chan] = {};
        }
        if (randomColorsChosen[chan].hasOwnProperty(name)) {
            color = randomColorsChosen[chan][name];
        } else {
            color = defaultColors[Math.floor(Math.random() * defaultColors.length)];
            randomColorsChosen[chan][name] = color;
        }
    }

    chatLine.className = 'chat-line';
    chatLine.dataset.username = name;
    chatLine.dataset.channel = channel;
    chatLine.id = 'chat-id-' + chatCount;

    //only show messages that have the message-type=chat
    if (showNotices === false) {
        if (user['message-type'] !== 'chat') {
            return false; //skip message
        }
    }

    //skip messages from bot account
    if (botAccount > '') {
        if ($.inArray(user['display-name'], botAccount) > -1) {
            return false; //skip message
        }
    }

    if (user['message-type'] === 'action') {
        chatLine.className += ' chat-action';
    }

    chatChannel.className = 'chat-channel';
    chatChannel.innerHTML = chan;

    chatName.className = 'chat-name';
    chatName.style.color = color;
    chatName.innerHTML = user['display-name'] || name;

    chatColon.className = 'chat-colon';
    chatColon.style.color = color;

    chatMessage.className = 'chat-message';

    chatMessage.style.color = color;
    chatMessage.innerHTML = showEmotes ? formatEmotes(message, user.emotes) : htmlEntities(message);

    if (client.opts.channels.length > 1 && showChannel) chatLine.appendChild(chatChannel);
    if (showBadges) chatLine.appendChild(badges(chan, user, self));
    chatLine.appendChild(chatName);
    chatLine.appendChild(chatColon);
    chatLine.appendChild(chatMessage);

    chat.appendChild(chatLine);

    if (typeof fadeDelay === 'number') {
        setTimeout(function () {
            chatLine.dataset.faded = '';
        }, fadeDelay);
    }

    if (chat.children.length > 100) {
        let oldMessages = [].slice.call(chat.children).slice(0, 10);
        for (let i in oldMessages) oldMessages[i].remove();
    }

    //do transitions
    if (transition > '') {
        transition = transition + ' new';

        $('div#chat').children('div.chat-line').removeClass(transition);
        $('div#chat').children('div.chat-line:last').addClass(transition);
    }

    //chat count limit
    if (chatLimit > 0) {
        if ($($('div#chat').children('div.chat-line.chat-notice').length) || $($('div#chat').children('div.chat-line.chat-timedout').length)) {
            $('div#chat').children('div.chat-line.chat-notice').remove();
            $('div#chat').children('div.chat-line.chat-timedout').remove();
        }
        if (chat.children.length === chatLimit) {
            $('div#chat').children('div.chat-line:first').remove();
        }
    }

    //start refresh timer
    if (refresh > 0) {
        clearInterval(chatTimer);
        refreshRate = 0;
        chatTimer = setInterval(function () {
            refreshRate++;
            if (refreshRate === refresh) {
                $('div.chat-line').remove();
                refreshRate = 0;
            }
        }, 1000);
    }

    $("div.chat-line").on('click', function () {

        let elementId = $(this).attr('id');

        $(".chat-line").css('background-color', '');

        $("#" + elementId).css('background-color', '#ccc');

        localStorage.setItem(channelName + '_Clicked_Username', $("#" + elementId + " span.chat-name").html());
        localStorage.setItem(channelName + '_Clicked_Usermsg', $("#" + elementId + " span.chat-message").html());
    });

}

function chatNotice(information, noticeFadeDelay, level, additionalClasses) {
    let ele = document.createElement('div');

    ele.className = 'chat-line chat-notice';
    ele.innerHTML = information;

    if (additionalClasses !== undefined) {
        if (Array.isArray(additionalClasses)) {
            additionalClasses = additionalClasses.join(' ');
        }
        ele.className += ' ' + additionalClasses;
    }

    if (typeof level === 'number' && level !== 0) {
        ele.dataset.level = level;
    }

    chat.appendChild(ele);

    if (typeof noticeFadeDelay === 'number') {
        setTimeout(function () {
            ele.dataset.faded = '';
        }, noticeFadeDelay || 500);
    }

    return ele;
}

let recentTimeouts = {};

function timeout(channel, username) {
    if (!doTimeouts) return false;
    if (!recentTimeouts.hasOwnProperty(channel)) {
        recentTimeouts[channel] = {};
    }
    if (!recentTimeouts[channel].hasOwnProperty(username) || recentTimeouts[channel][username] + 1000 * 10 < +new Date) {
        recentTimeouts[channel][username] = +new Date;
        chatNotice(capitalize(username) + ' was timed-out in ' + capitalize(dehash(channel)), 1000, 1, 'chat-delete-timeout')
    }

    let toHide = document.querySelectorAll('.chat-line[data-channel="' + channel + '"][data-username="' + username + '"]:not(.chat-timedout) .chat-message');
    for (let i in toHide) {
        let h = toHide[i];
        if (typeof h === 'object') {
            h.innerText = '<Message deleted>';
            h.parentElement.className += ' chat-timedout';
        }
    }
}

function clearChat(channel) {
    if (!doChatClears) return false;
    let toHide = document.querySelectorAll('.chat-line[data-channel="' + channel + '"]');
    for (let i in toHide) {
        let h = toHide[i];
        if (typeof h === 'object') {
            h.className += ' chat-cleared';
        }
    }
    chatNotice('Chat was cleared in ' + capitalize(dehash(channel)), 1000, 1, 'chat-delete-clear')
}

function hosting(channel, target, viewers, unhost) {
    if (!showHosting) return false;
    if (viewers === '-') viewers = 0;
    let chan = dehash(channel);
    chan = capitalize(chan);
    if (!unhost) {
        let targ = capitalize(target);
        chatNotice(chan + ' is now hosting ' + targ + ' for ' + viewers + ' viewer' + (viewers !== 1 ? 's' : '') + '.', null, null, 'chat-hosting-yes');
    } else {
        chatNotice(chan + ' is no longer hosting.', null, null, 'chat-hosting-no');
    }
}

client.addListener('message', handleChat);
client.addListener('timeout', timeout);
client.addListener('clearchat', clearChat);
client.addListener('hosting', hosting);
client.addListener('unhost', function (channel, viewers) {
    hosting(channel, null, viewers, true)
});

client.addListener('connecting', function (address, port) {
    if (showConnectionNotices) chatNotice('Connecting', 1000, -4, 'chat-connection-good-connecting');
});
client.addListener('logon', function () {
    if (showConnectionNotices) chatNotice('Authenticating', 1000, -3, 'chat-connection-good-logon');
});
client.addListener('connectfail', function () {
    if (showConnectionNotices) chatNotice('Connection failed', 1000, 3, 'chat-connection-bad-fail');
});
client.addListener('connected', function (address, port) {
    if (showConnectionNotices) chatNotice('Connected', 1000, -2, 'chat-connection-good-connected');
    joinAccounced = [];
});
client.addListener('disconnected', function (reason) {
    if (showConnectionNotices) chatNotice('Disconnected: ' + (reason || ''), 3000, 2, 'chat-connection-bad-disconnected');
});
client.addListener('reconnect', function () {
    if (showConnectionNotices) chatNotice('Reconnected', 1000, 'chat-connection-good-reconnect');
});
client.addListener('join', function (channel, username) {
    if (username === client.getUsername()) {
        if (showConnectionNotices) chatNotice('Joined ' + capitalize(dehash(channel)), 1000, -1, 'chat-room-join');
        joinAccounced.push(channel);
    }
});
client.addListener('part', function (channel, username) {
    let index = joinAccounced.indexOf(channel);
    if (index > -1) {
        if (showConnectionNotices) chatNotice('Parted ' + capitalize(dehash(channel)), 1000, -1, 'chat-room-part');
        joinAccounced.splice(joinAccounced.indexOf(channel), 1)
    }
});

client.addListener('crash', function () {
    chatNotice('Crashed', 10000, 4, 'chat-crash');
});

client.connect();

//clear overlay message
document.getElementById('click-clear').addEventListener('click', function (event) {
    localStorage.setItem(channelName + '_Clicked_Username', '');
    localStorage.setItem(channelName + '_Clicked_Usermsg', '');
}, false);