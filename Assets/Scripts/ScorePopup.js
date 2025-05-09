//@input SceneObject cameraObject
//@input Component.Text text;
//@input Component.ScriptComponent scoreManager;

let scoreManager = script.scoreManager;
let showScorePopup = false;
let score = 0;

script.EnableScorePopUp = function () {
    global.ScoreAdded.add(ShowPopUp);
}

script.DisableScorePopUp = function () {
    global.ScoreAdded.remove(ShowPopUp);
}

Awake();


function Awake() {
    UpdateScorePopUpDisplay();
}

function OnEnable() {
    UpdateScorePopUpDisplay();
}

function OnDisable() {
    script.DisableScorePopUp();
}


function ShowPopUp(scoreAmount) {
    score += scoreAmount;
    script.text.text = "+" + score.toString();
    global.tweenManager.startTween(script.getSceneObject(), "popupScore", OnComplete);
}

function OnComplete() {
    score = 0;
}


function onUpdate() {
    if(!showScorePopup) return;

    var cameraTransform = script.cameraObject.getTransform();
    var textTransform = script.getSceneObject().getTransform();
    textTransform.setWorldRotation(cameraTransform.getWorldRotation());
}

function UpdateScorePopUpDisplay() {
    showScorePopup = scoreManager.GetScorePopUpSetting();
    if(showScorePopup) {
        script.EnableScorePopUp();
    }
    else {
        script.DisableScorePopUp();
    }
}



script.createEvent("UpdateEvent").bind(onUpdate);
script.createEvent("OnEnableEvent").bind(OnEnable);
script.createEvent("OnDisableEvent").bind(OnDisable);

