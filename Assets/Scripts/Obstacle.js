//@input SceneObject[] pathPoints
//@input Asset.ObjectPrefab foodPrefab
//@input int foodCount = 10
//@input bool spawnFoodOnAwake;
//@input float radius = 5.0
//@input bool shouldSpawnInVolume;
//@input Component.RenderMeshVisual spawnVolume

const coroutineModule = require('Coroutine');
const CoroutineManager = coroutineModule.CoroutineManager;
const coroutineManager = new CoroutineManager(script);
const waitForEndOfFrame = coroutineModule.waitForEndOfFrame;
const waitForSeconds = coroutineModule.waitForSeconds;

let spawnedFoods = []; // Track currently active food objects
let foodCurveItemTypeName = requireType('FoodCurveItem');

DestroyPointRenderMeshVisuals();

function DestroyPointRenderMeshVisuals() {
    for (var i = 0; i < script.pathPoints.length; i++) {
        var renderMeshVisual = script.pathPoints[i].getComponent("RenderMeshVisual");
        if (renderMeshVisual) {
            renderMeshVisual.destroy();
        }
    }
}

script.api.TrySpawnFood = function() {
    coroutineManager.startCoroutine(TrySpawnFoodRoutine);
};

script.api.HideFood = function() {
    for (var i = 0; i < spawnedFoods.length; i++) {
        let food = spawnedFoods[i];
        let foodScript = food.getComponent(foodCurveItemTypeName);
        foodScript.api.Hide();
    }
};

function spawnFoodInVolume() {
    if (!script.foodPrefab || !script.spawnVolume) {
        print("Missing prefab or spawnVolume object.");
        return;
    }

    // Get the world-space bounding box
    let minBound = script.spawnVolume.worldAabbMin();
    let maxBound = script.spawnVolume.worldAabbMax();


    // Ensure the array is sized correctly
    if (!spawnedFoods || spawnedFoods.length != script.foodCount) {
        spawnedFoods = new Array(script.foodCount);
    }

    for (var i = 0; i < script.foodCount; i++) {
        var food = spawnedFoods[i];
        var shouldSpawn = false;

        if (!food) {
            shouldSpawn = true;
        } else {
            var foodScript = food.getComponent(foodCurveItemTypeName);
            if (!foodScript || !foodScript.api || foodScript.api.IsEaten) {
                shouldSpawn = true;
            }
        }

        if (shouldSpawn) {
            var spawnPos = getRandomPointInBox(minBound, maxBound);

            if (!food) {
                food = script.foodPrefab.instantiate(script.getSceneObject());
                spawnedFoods[i] = food;
            }

            food.getTransform().setWorldPosition(spawnPos);

            // Reset if food script exists
            var foodScript = food.getComponent(foodCurveItemTypeName);
            if (foodScript && foodScript.api && foodScript.api.Reset) {
                foodScript.api.ResetWithoutPosition();
                global.tweenManager.startTween(food, "food_scale");
            }
        }
    }
}

function getRandomPointInBox(minVec, maxVec) {
    var x = Math.random() * (maxVec.x - minVec.x) + minVec.x;
    var y = Math.random() * (maxVec.y - minVec.y) + minVec.y;
    var z = Math.random() * (maxVec.z - minVec.z) + minVec.z;

    return new vec3(x, y, z);
}


function getRandomPointInSphere(radius) {
    var u = Math.random();
    var v = Math.random();
    var theta = u * 2.0 * Math.PI;
    var phi = Math.acos(2.0 * v - 1.0);
    var r = Math.cbrt(Math.random()) * radius;

    var sinPhi = Math.sin(phi);
    var x = r * sinPhi * Math.cos(theta);
    var y = r * sinPhi * Math.sin(theta);
    var z = r * Math.cos(phi);

    return new vec3(x, y, z);
}

function* TrySpawnFoodRoutine() {
    if (script.shouldSpawnInVolume) {
        spawnFoodInVolume();
    }
    else {
        spawnFoodUsingPointPath();
    }
}

function catmullRom(p0, p1, p2, p3, t) {
    var t2 = t * t;
    var t3 = t2 * t;
    return p0.uniformScale(-0.5 * t3 + t2 - 0.5 * t)
        .add(p1.uniformScale(1.5 * t3 - 2.5 * t2 + 1.0))
        .add(p2.uniformScale(-1.5 * t3 + 2.0 * t2 + 0.5 * t))
        .add(p3.uniformScale(0.5 * t3 - 0.5 * t2));
}

function getPointOnSegment(points, segmentIndex, t) {
    var p0 = points[segmentIndex];
    var p1 = points[segmentIndex + 1];
    var p2 = points[segmentIndex + 2];
    var p3 = points[segmentIndex + 3];

    return catmullRom(
        p0.getTransform().getWorldPosition(),
        p1.getTransform().getWorldPosition(),
        p2.getTransform().getWorldPosition(),
        p3.getTransform().getWorldPosition(),
        t
    );
}

function spawnFoodUsingPointPath() {
    var originalPoints = script.pathPoints;
    if (originalPoints.length < 2 || !script.foodPrefab) {
        print("Need at least 2 points and a food prefab.");
        return;
    }

    // Pad the start and end for full curve coverage
    var points = [];
    points.push(originalPoints[0]); // duplicate start
    points = points.concat(originalPoints);
    points.push(originalPoints[originalPoints.length - 1]); // duplicate end

    var numSegments = points.length - 3;

    if (!spawnedFoods) {
        spawnedFoods = new Array(script.foodCount);
    }

    for (var i = 0; i < script.foodCount; i++) {
        let food = spawnedFoods[i];

        // If food doesn't exist or was eaten, (re)spawn/reset it
        let shouldSpawn = false;

        if (!food) {
            shouldSpawn = true;
        } else {
            let foodScript = food.getComponent(foodCurveItemTypeName);
            if (!foodScript || !foodScript.api || foodScript.api.IsEaten) {
                shouldSpawn = true;
            }
        }

        if (shouldSpawn) {
            // Force last food to be exactly at the end
            var tGlobal = i / (script.foodCount - 1);
            var totalT = tGlobal * numSegments;

            var segIndex = Math.floor(totalT);
            var localT = totalT - segIndex;

            if (i === script.foodCount - 1) {
                segIndex = numSegments - 1;
                localT = 1;
            }

            segIndex = Math.min(segIndex, numSegments - 1);

            var position = getPointOnSegment(points, segIndex, localT);

            // Create or reset food
            if (!food) {
                food = script.foodPrefab.instantiate(script.getSceneObject());
                spawnedFoods[i] = food;
            }

            food.getTransform().setWorldPosition(position);

            // Reset it if the script exists
            let foodScript = food.getComponent(foodCurveItemTypeName);
            if (foodScript && foodScript.api && foodScript.api.Reset) {
                foodScript.api.ResetWithoutPosition();
                global.tweenManager.startTween(food, "food_scale");
            }
        }
    }
}
