# Twitch Chat Highlight

### What is this?

It allows you to highlight a chat message and have it display in an overlay. Could be used on a Talk Show or Just Chatting stream when answering viewer questions on stream. This is similar to [Social Stream Ninja](https://github.com/steveseguin/social_stream#readme) however, I feel this is much simpler and low tech. No browser extensions, no Twitch chat pop-out window and is easier to implement.

**Notes:** 
- This only works with Twitch chat.
- Chat must be docked inside OBS in order for it to work with the browser source overlay.

### [Try it here](https://twitch-chat-highlight.pages.dev/)
The site will generate 2 links. One for the browser source overlay and one for the custom dock.

### Sample

![sample1](https://github.com/teklynk/twitch_chat_highlight/blob/main/screenshots/Screenshot%20from%202021-12-13%2014-17-34.png?raw=true)

### Creating a custom dock in OBS

![sample1](https://github.com/teklynk/twitch_chat_highlight/blob/main/screenshots/Screenshot%20from%202021-12-13%2016-28-30.png?raw=true)

**OBS Toolbar:** View > Docks > Custom Browser Docks...

This will open a box for you to add a Dock name and the URL for the
Dock. Once added, click Apply. You can now click and drag the dock window into the OBS interface if View > Lock UI is
disabled. Dragging the dock onto another element, will create a tabbed dock like pictured.

### Custom CSS

Add this CSS to the OBS browser source and modify as needed.

```
#overlay_avatar {
    display: inline-block;
    margin-left: 18px;
    z-index: 999;
}
#overlay_avatar img {
    vertical-align: middle;
    position: absolute;
    border-radius: 100%;
    height: 80px;
    z-index: 3;
    border: solid 4px #33127c;
    margin: 0 0 0 10px;
    padding: 0;
}
#overlay_username {
    text-align: center;
    text-shadow: 1px 1px #000000 !important;
    border-radius: 2px 2px 0 0;
    font-weight: bold;
    color: white;
    vertical-align: middle;
    position: absolute;
    margin-left: 60px;
    font-size: 20px !important;
    font-family: Basic !important;
    background: #33127c;
    padding: 4px 16px 4px 52px;
    z-index: 1;
    min-width: 100px;
    box-shadow: 6px 6px rgb(75, 75, 75);
}
#overlay_message {
    text-align: center;
    text-shadow: 1px 1px #000000 !important;
    border-radius: 0 2px 2px 2px;
    font-weight: bold;
    color: white;
    vertical-align: middle;
    position: absolute;
    margin-left: 60px;
    margin-top: 33px;
    margin-right: 50px;
    font-size: 32px !important;
    font-family: Basic !important;
    padding: 8px 60px 14px 60px;
    background: rgb(30, 29, 29);
    z-index: 2;
    box-shadow: 6px 6px rgb(75, 75, 75);
    min-width: 200px;
}
#overlay_message .emoticon {
    vertical-align: middle;
    height: 32px;
}
```