//@input Component.ScriptComponent scriptMenuController


function onTap() {
    global.StartGame();
}

script.createEvent("TapEvent").bind(onTap);