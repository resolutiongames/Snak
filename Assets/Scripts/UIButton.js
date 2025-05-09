let transform = null;
script.api.audioComponent = script.getSceneObject().getComponent("AudioComponent");

script.api.index = 0;
script.api.scriptMenuController = null;

let state = 0;


function Start() {
    let sO = script.getSceneObject();
    transform = sO.getTransform();
}

script.api.Highlighted = function () {
    if (state === 1) return;
    state = 1;

    script.api.audioComponent.play(1);
}

script.api.Unhighlighted = function () {
    if (state === 0) return;
    state = 0;

    script.api.audioComponent.stop(false);
}

script.api.Selected = function () {
    script.api.scriptMenuController.api.OnButtonPress(script.api.index);
}

script.createEvent("OnStartEvent").bind(Start);