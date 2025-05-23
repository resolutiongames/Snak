function scriptBody(script){
// TweenTransform.js
// Version: 0.1.3
// Event: Any Event
// Description: Runs a tween on a Lens Studio transform using TweenJS
// ----- USAGE -----
// Attach this script as a component after the Tween Manager script on either the same scene object or in a lower scene object in the Objects Panel.
// -----------------



// If no scene object is specified, use object the script is attached to
if (!script.sceneObjectReference) {
    script.sceneObjectReference = script.getSceneObject();
}

// Setup the external API
script.api.tweenObject = script.getSceneObject();
script.api.tweenType = "transform";
script.api.tweenName = script.tweenName;
script.api.time = script.time;
script.api.startTween = startTween;
script.api.resetObject = resetObject;
script.api.tween = null;
script.api.type = script.type;
script.api.movementType = script.movementType;
script.api.setupTween = setupTween;
script.api.setupTweenBackwards = setupTweenBackwards;
script.api.sceneObjectReference = script.sceneObjectReference;
script.api.updateToStart = updateToStart;
script.api.updateToEnd = updateToEnd;
script.api.loopType = script.loopType;
script.api.start = null;
script.api.end = null;
script.api.setStart = setStart;
script.api.setEnd = setEnd;
script.api.manualStart = false;
script.api.manualEnd = false;
script.api.playAutomatically = script.playAutomatically;
script.createEvent("OnDestroyEvent").bind(stopTween);

if (global.tweenManager && global.tweenManager.addToRegistry) {
    global.tweenManager.addToRegistry(script);
}

// Manually set start value
function setStart(start) {
    script.api.manualStart = true;
    script.api.start = start;
}

// Manually set end value
function setEnd(end) {
    script.api.manualEnd = true;
    script.api.end = end;
}

// Update the tween to its start
function updateToStart() {
    updateValue(script.api.start);
}

// Update the tween to its end
function updateToEnd() {
    if (script.loopType == 3) {
        updateValue(script.api.start);
    } else {
        updateValue(script.api.end);
    }
}

// Play it automatically if specified
if (script.playAutomatically) {
    // Start the tween
    startTween();
}

// Create the tween and start it
function startTween() {
    if (!global.tweenManager) {
        print("Tween Transform: Tween Manager not initialized. Try moving the TweenManager script to the top of the Objects Panel or changing the event on this TweenType to \"Lens Turned On\".");
        return;
    }

    script.api.tween = setupTween();

    if (script.api.tween) {
        // Start the tween
        script.api.tween.start();
    }
}

// Stops active tween
function stopTween() {
    if (script.api.tween) {
        script.api.tween.stop();
        script.api.tween = null;
    }
}

// Create the tween with passed in parameters
function setupTween() {
    var DEG_TO_RAD = 0.0174533;

    var transform = script.api.sceneObjectReference.getTransform();

    var transformParameter = null;

    var startValue = null;

    var endValue = null;

    var tween = null;

    // Set the appropriate parameter based on isLocal and tweenType
    var type = script.isLocal ? "Local" : "World";

    switch (script.type) {
        case 0:
            transformParameter = transform["get" + type + "Position"]();
            break;
        case 1:
            transformParameter = transform["get" + type + "Scale"]();
            break;
        case 2:
            transformParameter = transform["get" + type + "Rotation"]();
            break;
    }

    // Set the start and end of the script based on the movementType selected
    if (!script.api.manualStart) {
        switch (script.movementType) {
            case 0:
                script.api.start = (script.type == 2) ? quat.fromEulerAngles(script.start.x * DEG_TO_RAD, script.start.y * DEG_TO_RAD, script.start.z * DEG_TO_RAD) : script.start;
                break;
            case 1:
                script.api.start = (script.type == 2) ? transformParameter : new vec3(transformParameter.x, transformParameter.y, transformParameter.z);
                break;
            case 2:
                script.api.start = (script.type == 2) ? quat.fromEulerVec(script.from.uniformScale(DEG_TO_RAD)) : new vec3(script.from.x, script.from.y, script.from.z);
                break;
            case 3:
                script.api.start = (script.type == 2) ? transformParameter : new vec3(transformParameter.x, transformParameter.y, transformParameter.z);
                break;
        }
    }

    if (!script.api.manualEnd) {
        switch (script.movementType) {
            case 0:
                script.api.end = (script.type == 2) ? quat.fromEulerAngles(script.end.x * DEG_TO_RAD, script.end.y * DEG_TO_RAD, script.end.z * DEG_TO_RAD) : script.end;
                break;
            case 1:
                script.api.end = (script.type == 2) ? quat.fromEulerVec(script.to.uniformScale(DEG_TO_RAD)) : new vec3(script.to.x, script.to.y, script.to.z);
                break;
            case 2:
                script.api.end = (script.type == 2) ? transformParameter : new vec3(transformParameter.x, transformParameter.y, transformParameter.z);
                break;
            case 3:
                script.api.end = (script.type == 2) ? transformParameter.multiply(quat.angleAxis(script.offset.x * DEG_TO_RAD, vec3.right())).multiply(quat.angleAxis(script.offset.y * DEG_TO_RAD, vec3.up())).multiply(quat.angleAxis(script.offset.z * DEG_TO_RAD, vec3.forward())) : new vec3(transformParameter.x + script.offset.x, transformParameter.y + script.offset.y, transformParameter.z + script.offset.z);
                break;
        }
    }

    startValue = (script.type == 2) ? {
        x: 0
    } : {
        x: script.api.start.x,
        y: script.api.start.y,
        z: script.api.start.z
    };

    endValue = (script.type == 2) ? {
        x: 1
    } : {
        x: script.api.end.x,
        y: script.api.end.y,
        z: script.api.end.z
    };

    // Reset object to start
    resetObject();

    // Create the tween
    tween = new global.TWEEN.Tween(startValue)
        .to(endValue, script.api.time * 1000.0)
        .delay(script.delay * 1000.0)
        .easing(global.tweenManager.getTweenEasingType(script.easingFunction, script.easingType))
        .onUpdate(updateValue)
        .onComplete((script.movementType == 3 && script.additive && script.loopType == 1) ? startTween : null);

    if (tween) {
        // Configure the type of looping based on the inputted parameters
        if (script.movementType == 3 && script.additive && script.loopType == 1) {
            global.tweenManager.setTweenLoopType(tween, 0);
        } else {
            global.tweenManager.setTweenLoopType(tween, script.api.loopType);
        }

        // Save reference to tween
        script.api.tween = tween;

        return tween;
    }
}

// Resets the object to its start
function resetObject() {
    if (script.api.start == null) {
        setupTween();
    }

    var startValue = (script.type == 2) ? {
        x: 0
    } : {
        x: script.api.start.x,
        y: script.api.start.y,
        z: script.api.start.z
    };

    // Initialize transform to start value
    updateValue(startValue);
}

// Create a new tween with swapped start and end parameters
function setupTweenBackwards() {
    // Switch the order of the start and end parameters when creating the backwards Tween
    var startValue = (script.type == 2) ? {
        x: (script.loopType == 3) ? 0 : 1
    } : {
        x: (script.loopType == 3) ? script.api.start.x : script.api.end.x,
        y: (script.loopType == 3) ? script.api.start.y : script.api.end.y,
        z: (script.loopType == 3) ? script.api.start.z : script.api.end.z
    };

    var endValue = (script.type == 2) ? {
        x: (script.loopType == 3) ? 1 : 0

    } : {
        x: (script.loopType == 3) ? script.api.end.x : script.api.start.x,
        y: (script.loopType == 3) ? script.api.end.y : script.api.start.y,
        z: (script.loopType == 3) ? script.api.end.z : script.api.start.z
    };

    var tween = null;

    // Change easing type
    var easingType = global.tweenManager.getSwitchedEasingType(script.easingType);

    // Create the tween
    tween = new global.TWEEN.Tween(startValue)
        .to(endValue, script.api.time * 1000.0)
        .delay(script.delay * 1000.0)
        .easing(global.tweenManager.getTweenEasingType(script.easingFunction, easingType))
        .onUpdate(updateValue);

    if (tween) {
        // Configure the type of looping based on the inputted parameters
        global.tweenManager.setTweenLoopType(tween, script.api.loopType);

        return tween;
    }
}

// Here's were the values returned by the tween are used
// to drive the transform of the SceneObject
function updateValue(value) {
    var transform = script.api.sceneObjectReference.getTransform();
    var local = script.isLocal ? "Local" : "World";
    var type = null;
    var newValue = null;
    if (script.type == 0) {
        type = "Position";
        newValue = new vec3(value.x, value.y, value.z);
    } else if (script.type == 1) {
        type = "Scale";
        newValue = new vec3(value.x, value.y, value.z);
    } else if (script.type == 2) {
        type = "Rotation";
        newValue = quat.slerp(script.api.start, script.api.end, value.x);
        newValue.normalize();
    }
    transform["set" + local + type](newValue);
}

 }; module.exports = scriptBody;