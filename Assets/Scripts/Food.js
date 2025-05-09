//@input Physics.ColliderComponent foodCollider
//@input int scoreAmount;
//@input float minimumSpawnDistance;
//@input vec3 startScale;

const coroutineModule = require('Coroutine');
const CoroutineManager = coroutineModule.CoroutineManager;
const coroutineManager = new CoroutineManager(script);
const waitTill = coroutineModule.waitTill;

let scoreAmount = script.scoreAmount;
let startScale = script.startScale;

script.GetWorldPosition = function(){
    return script.getSceneObject().getTransform().getWorldPosition();
}

script.ToggleCollider = function(state){
    script.foodCollider.enabled = state;
}

script.Reset = function() {
    spawnManager.MoveToRandomPosition(script.getSceneObject(), script.minimumSpawnDistance, 50);
    script.getSceneObject().getTransform().setLocalScale(script.startScale);
    script.foodCollider.enabled = true;
}

// The Eat function starts the routine
script.Eat = function(){
    coroutineManager.startCoroutine(EatRoutine);
}

function* EatRoutine() {
    let positionValid = yield* spawnManager.MoveToRandomPositionRoutine(script.getSceneObject(), script.minimumSpawnDistance);
    yield* waitTill(() => positionValid === true);
    script.getSceneObject().getTransform().setLocalScale(script.startScale);
    script.foodCollider.enabled = true;
}



