//@input bool shouldTranslate;

Awake();

function Awake () {
    StartTween();
}

function onEnable() {
    StartTween();
}

if(script.shouldTranslate) {
    const visibleThreshold = 0.1; // This is the visibility threshold (0-1)

    let isTweenActive = false; // Track whether the tween is active

    // Function to apply the tween animation when the object is visible
    function applyTween() {
        const isVisible = global.IsObjectInView(script.getSceneObject(), visibleThreshold);
        if (isVisible && !isTweenActive) {
            global.tweenManager.startTween(script.getSceneObject(), "food_pingpong");
            isTweenActive = true;
        } else if (!isVisible && isTweenActive) {
            global.tweenManager.stopTween(script.getSceneObject(), "food_pingpong");
            isTweenActive = false;
        }
    }

    script.createEvent("UpdateEvent").bind(function() {
        applyTween();
    });
}


function onDisable() {
    global.tweenManager.stopTween(script.getSceneObject(), "food_scale");
}


function StartTween() {
    global.tweenManager.startTween(script.getSceneObject(), "food_scale");
}

script.createEvent("OnEnableEvent").bind(onEnable);
script.createEvent("OnDisableEvent").bind(onDisable);
