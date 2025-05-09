function scriptBody(script){ 
// TweenScreenTransform.js
// Version: 0.1.2
// Event: Any Event
// Description: Runs a tween on a Lens Studio ScreenTransform using TweenJS
// ----- USAGE -----
// Attach this script as a component after the Tween Manager script on either the same scene object or in a lower scene object in the Objects Panel.
//
// Assign a Scene Object that has a ScreenTransform component to the "Scene Object" property on this script.
// -----------------


// Movement Values - From/To





var propertyTypes = ["Position", "Scale", "Rotation", "Anchors", "Offsets"];
var PropertyType = {};
propertyTypes.forEach(function(d, i) {
    PropertyType[d] = i;
});

var RectPropTypes = ["Bounds", "Size", "Center"];

var vecProperties = ["x", "y", "z", "w"];

var movementProperties = ["start", "to", "from", "offset"];

var propertyTypeName = Object.keys(PropertyType)[script.type];

function setProperty(propName, inputName) {
    switch (script.type) {
        case PropertyType.Rotation:
            script[propName] = new vec3(script[inputName + propertyTypeName], 0, 0);
            break;
        case PropertyType.Anchors:
            script[propName] = script[inputName + propertyTypeName + RectPropTypes[script.anchorsParam]];
            break;
        case PropertyType.Offsets:
            script[propName] = script[inputName + propertyTypeName + RectPropTypes[script.offsetsParam]];
            break;
        default:
            script[propName] = script[inputName + propertyTypeName];
    }
}
setProperty(movementProperties[script.movementType], "start");
if (script.movementType == 0) {
    setProperty("end", "end");
}

// If no scene object is specified, use object the script is attached to
if (!script.sceneObjectReference) {
    script.sceneObjectReference = script.getSceneObject();
}

// Setup the external API
script.api.tweenObject = script.getSceneObject();
script.api.tweenType = "screen_transform";
script.api.type = script.type;
script.api.movementType = script.movementType;
script.api.time = script.time;
script.api.tweenName = script.tweenName;
script.api.startTween = startTween;
script.api.resetObject = resetObject;
script.api.tween = null;
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
        print("Tween Screen Transform: Tween Manager not initialized. Try moving the TweenManager script to the top of the Objects Panel or changing the event on this TweenType to \"Lens Turned On\".");
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
    var tween = null;
    var screenTransform = script.api.sceneObjectReference.getComponent("Component.ScreenTransform");
    var screenTransformParams = null;

    if (screenTransform != null) {
        // Set the appropriate parameter based on movementType and tweenType selected
        switch (script.type) {
            case 0:
                screenTransformParams = screenTransform.position;
                break;
            case 1:
                screenTransformParams = screenTransform.scale;
                break;
            case 2:
                screenTransformParams = screenTransform.rotation.toEulerAngles().z;
                break;
            case 3:
                screenTransformParams = getRectParams(screenTransform.anchors, script.anchorsParam);
                break;
            case 4:
                screenTransformParams = getRectParams(screenTransform.offsets, script.offsetsParam);
                break;
        }

        if (!script.api.manualStart) {
            switch (script.movementType) {
                case 0:
                    script.api.start = script.type == PropertyType.Rotation ? script.start.x * DEG_TO_RAD : script.start;
                    break;
                case 1:
                    script.api.start = screenTransformParams;
                    break;
                case 2:
                    script.api.start = script.type == PropertyType.Rotation ? script.from.x * DEG_TO_RAD : script.from;
                    break;
                case 3:
                    script.api.start = screenTransformParams;
                    break;
            }
        }

        if (!script.api.manualEnd) {
            switch (script.movementType) {
                case 0:
                    script.api.end = script.type == PropertyType.Rotation ? script.end.x * DEG_TO_RAD : script.end;
                    break;
                case 1:
                    script.api.end = script.type == PropertyType.Rotation ? script.to.x * DEG_TO_RAD : script.to;
                    break;
                case 2:
                    script.api.end = screenTransformParams;
                    break;
                case 3:
                    script.api.end = script.type == PropertyType.Rotation ? screenTransformParams + script.offset.x * DEG_TO_RAD : script.api.start.add(script.offset);
                    break;
            }
        }
        var startValue;
        var endValue;
        if (script.type == PropertyType.Rotation) {
            startValue = { x: 0 };
        } else {
            startValue = createObjectFromVec(script.api.start);
        }

        if (script.type == PropertyType.Rotation) {
            endValue = { x: 1 };
        } else {
            endValue = createObjectFromVec(script.api.end);
        }

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
    } else {
        print("Tween Screen Transform: There is no Screen Transform component found on " + script.sceneObjectReference.name + " SceneObject");
    }
}

// Create the tween with swapped start and end parameters
function setupTweenBackwards() {
    var tween = null;

    var startValue;
    var endValue;

    if (script.type == PropertyType.Rotation) {
        startValue = { x: (script.loopType == 3) ? 0 : 1 };
    } else {
        if (script.loopType == 3) {
            startValue = createObjectFromVec(script.api.start);
        } else {
            startValue = createObjectFromVec(script.api.end);
        }
    }
    if (script.type == PropertyType.Rotation) {
        startValue = { x: (script.loopType == 3) ? 1 : 0 };
    } else {
        if (script.loopType == 3) {
            startValue = createObjectFromVec(script.api.end);
        } else {
            startValue = createObjectFromVec(script.api.start);
        }
    }

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

// Resets the object to its start

function resetObject() {
    if (script.api.start == null) {
        setupTween();
    }
    var startValue = {};
    if (script.type == PropertyType.Rotation) {
        startValue = { x: 0 };
    } else {
        startValue = createObjectFromVec(script.api.start);
    }
    // Initialize to start value
    updateValue(startValue);
}

// Here's where the values returned by the tween are used
// to drive the Component.ScreenTransform of the SceneObject

function updateValue(value) {
    if (script.api.sceneObjectReference == null) {
        return;
    }

    var screenTransform = script.api.sceneObjectReference.getComponent("Component.ScreenTransform");

    if (screenTransform != null) {
        switch (script.api.type) {
            case PropertyType.Position: // Position
                screenTransform.position = new vec3(value.x, value.y, value.z);
                break;
            case PropertyType.Scale: // Scale
                screenTransform.scale = new vec3(value.x, value.y, value.z);
                break;
            case PropertyType.Rotation: // Rotation
                var newAngle = lerp(script.api.start, script.api.end, value.x);
                var newQuat = quat.angleAxis(newAngle, vec3.forward());
                newQuat.normalize();
                screenTransform.rotation = newQuat;
                break;
            case PropertyType.Anchors: // Anchors
                setRectParams(screenTransform.anchors, value, script.anchorsParam);
                break;
            case PropertyType.Offsets: // Offsets
                setRectParams(screenTransform.offsets, value, script.offsetsParam);
                break;
        }
    }
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

//  helper functions
function getRectParams(rect, type) {
    switch (type) {
        case 0:
            return new vec4(rect.left, rect.right, rect.bottom, rect.top);
        case 1:
            return rect.getSize();
        case 2:
            return rect.getCenter();
    }
}

function setRectParams(rect, value, type) {
    switch (type) {
        case 0:
            rect.left = value.x;
            rect.right = value.y;
            rect.bottom = value.z;
            rect.top = value.w;
            break;
        case 1:
            rect.setSize(new vec2(value.x, value.y));
            break;
        case 2:
            rect.setCenter(new vec2(value.x, value.y));
            break;
    }
}

function createObjectFromVec(vec) {
    var value = {};
    for (var i = 0; i < vecProperties.length; i++) {
        if (vec[vecProperties[i]] != undefined) {
            value[vecProperties[i]] = vec[vecProperties[i]];
        }
    }
    return value;
}

 }; module.exports = scriptBody;