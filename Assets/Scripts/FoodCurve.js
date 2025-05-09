//@input SceneObject[] foodPrefabInstances
//@input Component.ScriptComponent[] foodScripts
//@input float minimumSpawnDistance;
//@input int numberOfSecondsToWaitBeforeChecking;
//@input int scoreAmount;

let isAllFoodEaten = true;


const coroutineModule = require('Coroutine');
const CoroutineManager = coroutineModule.CoroutineManager;
const coroutineManager = new CoroutineManager(script);
const waitForEndOfFrame = coroutineModule.waitForEndOfFrame;
const waitForSeconds = coroutineModule.waitForSeconds;


let coroutine = null;

function Start(){
    global.GameStarted.add(StartChecking);
    global.GameEnded.add(StopChecking);
    StartChecking();
}

script.createEvent("OnStartEvent").bind(Start);

function StartChecking() {
    ResetAllFood();
    if(coroutine === null) {
        coroutine = coroutineManager.startCoroutine(CheckIfAllFoodIsEatenRoutine)
    }
}

function StopChecking() {
    ResetAllFood();
    coroutineManager.stopCoroutine(coroutine);
    coroutine = null;
}

function* CheckIfAllFoodIsEatenRoutine() {
    while (true) {
        yield* waitForSeconds(script.numberOfSecondsToWaitBeforeChecking);
        let isAllFoodEaten = true; // Assume all food is eaten initially
        for (let i = 0; i < script.foodScripts.length; i++) {
            let foodInstance = script.foodScripts[i];
            if (!foodInstance.api.IsEaten) {
                isAllFoodEaten = false; // If any food is not eaten, set isAllFoodEaten to false
                break; // No need to check further if one is not eaten
            }
        }

        if (isAllFoodEaten) {
            spawnManager.MoveToRandomPosition(script.getSceneObject(), script.minimumSpawnDistance);
            yield* waitForEndOfFrame();
            ResetAllFood();
            global.scoreManager.AddScore(script.scoreAmount)
        }
    }
}

function ResetAllFood() {
    for (let i = 0; i < script.foodScripts.length; i++) {
        let foodInstance = script.foodScripts[i];
        foodInstance.api.Reset();
    }
    isAllFoodEaten = false;
}
