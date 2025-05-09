/*
@typedef ObstacleConfig
@property {Asset.ObjectPrefab} prefab
@property {int} spawnChance {"label":"Spawn %", "min":0, "max":100, "step":1}
*/
// @input ObstacleConfig[] obstaclesPrefabs

//@input int numberOfObstaclesToSpawn = 1 {"min":0, "max":1000, "step":1}
//@input float minimumSpawnDistance;
//@input SceneObject obstacleInstancesParent
//@input float spawnInterval  {"min":0, "max":100, "step": 1}
//@input float chanceToSpawn {"min":0, "max":1, "step":0.05}
//@input int padding = 80

//@input bool logSpawnPercentage;

var obstacles = [];


const coroutineModule = require('Coroutine');
const CoroutineManager = coroutineModule.CoroutineManager;
const coroutineManager = new CoroutineManager(script);
const waitForEndOfFrame = coroutineModule.waitForEndOfFrame;

let obstacleTypeName = requireType('Obstacle');
let timeSinceLastSpawn = 0;

script.api.MoveAllInstancesToRandomPositions = function() {
    coroutineManager.startCoroutine(moveAllSequentially);
}

function* moveAllSequentially() {
    for (let i = 0; i < obstacles.length; i++) {
        let prefabInstance = obstacles[i];
        yield* spawnManager.MoveToRandomPositionRoutine(prefabInstance, script.minimumSpawnDistance, script.padding);
    }
}
Awake();

function Awake() {
    coroutineManager.startCoroutine(SpawnObstacleRoutine);
    global.GameStarted.add(OnGameStarted);
    global.GameEnded.add(HideAllFoodInObstacles);
    if(script.logSpawnPercentage) {
        logPrefabSpawnChances();
    }
}

function* SpawnObstacleRoutine() {
    for(var i = 0; i < script.numberOfObstaclesToSpawn; i ++) {
        script.api.spawn();
    }
}

function Update(eventData) {
    if(global.IsGameRunning === false ) return;
    let deltaTime = eventData.getDeltaTime();
    timeSinceLastSpawn += deltaTime;

    if (timeSinceLastSpawn >= script.spawnInterval) {
        timeSinceLastSpawn = 0;
        TrySpawnFood();
    }
}
script.createEvent("UpdateEvent").bind(Update);

function OnGameStarted() {
    script.api.MoveAllInstancesToRandomPositions();
    ShowFoodInObstacles();

}

function ShowFoodInObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        let obstacle = obstacles[i];
        let obstacleScript = obstacle.getComponent(obstacleTypeName);
        if(obstacleScript.spawnFoodOnAwake) {
            obstacleScript.api.TrySpawnFood();
        }
    }
}

function HideAllFoodInObstacles() {
    for (let i = 0; i < obstacles.length; i++) {
        let obstacle = obstacles[i];
        let obstacleScript = obstacle.getComponent(obstacleTypeName);
        obstacleScript.api.HideFood();
    }
}

function TrySpawnFood() {
    let chance = Math.random();
    if (chance < script.chanceToSpawn) {
        if (obstacles.length > 0) {
            let randomIndex = Math.floor(Math.random() * obstacles.length);
            let selectedObstacle = obstacles[randomIndex];

            let obstacleScript = selectedObstacle.getComponent(obstacleTypeName);
            if (obstacleScript && obstacleScript.api && obstacleScript.api.TrySpawnFood) {
                obstacleScript.api.TrySpawnFood();
            }
        }
    }
}

script.api.spawn = function() {
    var randomPrefab = getRandomPrefab();
    var newObject = randomPrefab.instantiate(script.obstacleInstancesParent);

    // Generate random rotation angles in radians
    var randomRotationX = Math.random() * Math.PI * 2;
    var randomRotationY = Math.random() * Math.PI * 2;
    var randomRotationZ = Math.random() * Math.PI * 2;

    var randomRotation = quat.fromEulerAngles(randomRotationX, randomRotationY, randomRotationZ);

    newObject.getTransform().setLocalRotation(randomRotation);
    obstacles.push(newObject);
}

function getRandomPrefab() {
    var obstacles = script.obstaclesPrefabs;

    if (!obstacles || obstacles.length === 0) {
        print("Error: No obstacles defined.");
        return null;
    }

    // Compute total weight
    var totalWeight = 0;
    for (var i = 0; i < obstacles.length; i++) {
        totalWeight += obstacles[i].spawnChance;
    }

    if (totalWeight === 0) {
        print("Error: Total spawnChance is 0.");
        return null;
    }

    var randomValue = Math.random() * totalWeight;
    var cumulativeWeight = 0;

    for (var i = 0; i < obstacles.length; i++) {
        cumulativeWeight += obstacles[i].spawnChance;
        if (randomValue < cumulativeWeight) {
            return obstacles[i].prefab;
        }
    }

    return obstacles[obstacles.length - 1].prefab; // Fallback
}


function logPrefabSpawnChances() {
    var obstacles = script.obstaclesPrefabs;

    if (!obstacles || obstacles.length === 0) {
        print("Error: No obstacles defined.");
        return;
    }

    var totalWeight = 0;
    for (var i = 0; i < obstacles.length; i++) {
        totalWeight += obstacles[i].spawnChance;
    }

    if (totalWeight === 0) {
        print("Error: Total spawnChance is 0.");
        return;
    }

    print("Spawn Chances:");
    for (var i = 0; i < obstacles.length; i++) {
        var weight = obstacles[i].spawnChance;
        var prefab = obstacles[i].prefab;
        var percent = ((weight / totalWeight) * 100).toFixed(2);
        var prefabName = prefab ? prefab.name : "Unnamed Prefab";

        print("Prefab " + i + " (" + weight + " weight, " + prefabName + "): " + percent + "%");
    }
}
