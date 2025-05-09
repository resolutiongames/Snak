//@input vec3 boundaryMinimum
//@input vec3 boundaryMaximum
//@input float scale
// @input SceneObject gameParent
// @input SceneObject uiParent
// @input SceneObject playArea
// @input SceneObject cameraObject
// @input SceneObject controlParent

// @input vec3 playAreaWorldCenter

const coroutineModule = require('Coroutine');
const CoroutineManager = coroutineModule.CoroutineManager;
const waitForEndOfFrame = coroutineModule.waitForEndOfFrame;
const coroutineManager = new CoroutineManager(script);

var eventModule = require("./EventModule");
global.GameStarted = new eventModule.EventWrapper();
global.GameEnded = new eventModule.EventWrapper();

let camera = script.cameraObject.getComponent("Camera");

global.IsGameRunning = false;

global.IsObjectInView = function (obj, visibleThreshold) {
    // Get the bounding box of the object in screen space
    const screenSpaceBounds = camera.worldSpaceToScreenSpace(obj.getTransform().getWorldPosition());

    // Check if the object is within the camera's view based on a threshold
    return (
        screenSpaceBounds.x >= -visibleThreshold && screenSpaceBounds.x <= 1 + visibleThreshold &&
        screenSpaceBounds.y >= -visibleThreshold && screenSpaceBounds.y <= 1 + visibleThreshold
    );
}

script.SetPlayAreaWorldCenter = function (zValue) {
    script.playAreaWorldCenter.z = -zValue;
    print(script.playAreaWorldCenter);
}

script.GetPlayAreaWorldCenter = function () {
    return script.playAreaWorldCenter;
}

script.SavePlayAreaWorldCenter = function() {
    global.saveManager.SavePlayAreaWorldCenter(script.playAreaWorldCenter);
    print("Saving " + script.playAreaWorldCenter);
}



function initialize() {
    global.scale = script.scale;

    global.boundary = {
        boundaryMinimum: script.boundaryMinimum,
        boundaryMaximum: script.boundaryMaximum
    };

    script.playArea.getTransform().setWorldScale(vec3.one().uniformScale(global.scale));
    script.playAreaWorldCenter = global.saveManager.GetPlayAreaWorldCenter();
    print("Initialized " + script.playAreaWorldCenter);
    global.PlayMenuMusic();
}
initialize();

global.GetRandomPosition = function() {
    let boundaryMin = script.boundaryMinimum;
    let boundaryMax = script.boundaryMaximum;
    return new vec3(
        boundaryMin.x + Math.random() * (boundaryMax.x - boundaryMin.x),
        boundaryMin.y + Math.random() * (boundaryMax.y - boundaryMin.y),
        boundaryMin.z + Math.random() * (boundaryMax.z - boundaryMin.z)
    );
}


global.GetRandomPositionWithPadding = function(padding) {
    let boundaryMin = script.boundaryMinimum;
    let boundaryMax = script.boundaryMaximum;

    // Ensure padding doesn't exceed half the size of any axis range
    let safePadding = {
        x: Math.min(padding, (boundaryMax.x - boundaryMin.x) / 2),
        y: Math.min(padding, (boundaryMax.y - boundaryMin.y) / 2),
        z: Math.min(padding, (boundaryMax.z - boundaryMin.z) / 2)
    };

    return new vec3(
        boundaryMin.x + safePadding.x + Math.random() * (boundaryMax.x - boundaryMin.x - 2 * safePadding.x),
        boundaryMin.y + safePadding.y + Math.random() * (boundaryMax.y - boundaryMin.y - 2 * safePadding.y),
        boundaryMin.z + safePadding.z + Math.random() * (boundaryMax.z - boundaryMin.z - 2 * safePadding.z)
    );
}

global.GetRandomRotation = function() {
    // Generate random rotation angles in radians
    var randomRotationX = Math.random() * Math.PI * 2;
    var randomRotationY = Math.random() * Math.PI * 2;
    var randomRotationZ = Math.random() * Math.PI * 2;

    // Create a quaternion from the random Euler tangles
    var randomRotation = quat.fromEulerAngles(randomRotationX, randomRotationY, randomRotationZ);
    return randomRotation;
}

global.StartGame = function () {
    coroutineManager.startCoroutine(StartGameRoutine);
};

function* StartGameRoutine() {
    global.scoreManager.ResetScore();
    global.spawnManager.ClearSpawnPositions();
    // Wait until the end of the frame
    yield* waitForEndOfFrame();
    script.gameParent.enabled = true;
    script.uiParent.enabled = false;
    script.controlParent.enabled = true;
    global.PlayGameMusic();
    global.IsGameRunning = true;
    global.GameStarted.trigger();
}

global.EndGame = function () {
    global.GameEnded.trigger();
    global.PlayMenuMusic();
    script.uiParent.enabled = true;
    script.gameParent.enabled = false;
    script.controlParent.enabled = false;
    global.IsGameRunning = false;
};

//Exposed for typescript usage
script.StartGame = function () {
    global.StartGame();
}



