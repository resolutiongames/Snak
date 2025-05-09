// @input SceneObject snake
// @input float forwardProgression
// @input Asset.ObjectPrefab foodPrefab
// @input Asset.ObjectPrefab[] foodChainPrefabs
// @input SceneObject foodPrefabsParent
// @input int maxInstances = 256 {"min":0, "max":1000, "step":1}
// @input int maxChainInstances = 256 {"min":0, "max":1000, "step":1}
// @input float minimumSpawnDistance;

let prefabInstances = [];

var foodCount = 0;


const coroutineModule = require('Coroutine');
const CoroutineManager = coroutineModule.CoroutineManager;
const coroutineManager = new CoroutineManager(script);
const waitForEndOfFrame = coroutineModule.waitForEndOfFrame;

script.api.MoveAllInstancesToRandomPositions = function() {
    coroutineManager.startCoroutine(moveAllSequentially);
}

function* moveAllSequentially() {
    for (let i = 0; i < prefabInstances.length; i++) {
        let prefabInstance = prefabInstances[i];
        yield* spawnManager.MoveToRandomPositionRoutine(prefabInstance, script.minimumSpawnDistance, 50);
    }
}

Awake();

function Awake() {
    coroutineManager.startCoroutine(SpawnFoodRoutine);
    global.GameStarted.add(script.api.MoveAllInstancesToRandomPositions);
}

function* SpawnFoodRoutine() {
    // Start spawning food, wait a frame for performance
    SpawnFood(script.foodPrefab, script.maxInstances);
    yield waitForEndOfFrame; // Yielding to next frame before continuing to spawn the food chain
    SpawnFoodChain();

}

function SpawnFood(foodPrefab, maxInstances) {
    for (let i = 0; i < maxInstances; i++) {
        let foodInstance = SpawnFoodItem(foodPrefab);
        prefabInstances.push(foodInstance);
    }
}

function SpawnFoodItem(foodPrefab) {
    return foodPrefab.instantiate(script.foodPrefabsParent);
}

function SpawnFoodChain() {
    let numPrefabs = script.foodChainPrefabs.length;

    for (let i = 0; i < numPrefabs; i++) {
        let foodChainPrefab = script.foodChainPrefabs[i];
        for (let j = 0; j < script.maxChainInstances; j++) {
            let foodInstance = SpawnFoodItem(foodChainPrefab);
            let randomRotation = global.GetRandomRotation();
            foodInstance.getTransform().setLocalRotation(randomRotation);
            prefabInstances.push(foodInstance);
        }
    }
}

script.api.reset = function() {
    foodCount = 0;
}

script.EatFood = function() {
    foodCount++;
}