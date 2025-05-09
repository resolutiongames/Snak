//@input Component.ScriptComponent snake
//@input float flickerDuration
//@input float flickerInterval
//@input vec4 flickerColor = {1,1,1,1} {"widget":"color"}

const coroutineModule = require('Coroutine');
const CoroutineManager = coroutineModule.CoroutineManager;
const coroutineManager = new CoroutineManager(script);
const waitForSeconds = coroutineModule.waitForSeconds;

// Flicker configuration
const warningColor = script.flickerColor;
const flickerDuration = script.flickerDuration;
const flickerInterval = script.flickerInterval;
const whiteColor = new vec4(1,1,1,1);

let snake = script.snake;
let segmentVisualData = []; // Stores visuals for the segments

// Initialize on script start
script.createEvent("OnStartEvent").bind(function () {
    if (snake && snake.api && snake.api.bodyBits) {
        cacheVisuals();
    }
});

// Refresh cached visuals for all segments
function cacheVisuals() {
    segmentVisualData = [];

    let segments = snake.api.bodyBits;
    for (let i = 0; i < segments.length; i++) {
        let visuals = findFirstMeshVisual(segments[i]);
        segmentVisualData.push({ visuals: visuals });
    }
}

// Coroutine that handles flickering logic
function* FlickerRoutine() {
    let elapsed = 0;

    while (elapsed < flickerDuration) {
        applyColorToSnake(warningColor);
        yield* waitForSeconds(flickerInterval / 2);

        applyColorToSnake(whiteColor); // Restoring to white color
        yield* waitForSeconds(flickerInterval / 2);

        elapsed += flickerInterval;
    }

    applyColorToSnake(whiteColor); // Final restore to white
}

// Public method to trigger the flicker effect
script.StartFlicker = function () {
    cacheVisuals(); // Always refresh visuals before flicker
    coroutineManager.startCoroutine(FlickerRoutine);
};

// Apply a given color to all cached visuals
function applyColorToSnake(color) {
    for (let i = 0; i < segmentVisualData.length; i++) {
        let visuals = segmentVisualData[i].visuals;
        for (let j = 0; j < visuals.length; j++) {
            let mesh = visuals[j];
            if (mesh.mainMaterial && mesh.mainMaterial.mainPass) {
                mesh.mainMaterial.mainPass.baseColor = color;
            }
        }
    }
}

function findFirstMeshVisual(obj) {
    let mesh = obj.getChild(0).getComponent("Component.MeshVisual");
    return mesh ? [mesh] : [];
}

function findAllMeshVisuals(obj) {
    let results = [];

    let childCount = obj.getChildrenCount();
    for (let i = 0; i < childCount; i++) {
        let child = obj.getChild(i);
        let mesh = child.getComponent("Component.MeshVisual");
        if (mesh) {
            results.push(mesh);
        }
    }

    return results;
}
