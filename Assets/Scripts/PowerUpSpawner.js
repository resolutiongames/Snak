//@input Asset.ObjectPrefab speedPowerUp
//@input SceneObject PrefabsParent
//@input int maxInstances = 256 {"min":1, "max":1000, "step":1}
//@input float minimumSpawnDistance;

let prefabInstances = [];

script.api.MoveAllInstancesToRandomPositions = function() {
    for (let i = 0; i < prefabInstances.length; i++) {
        let prefabInstance = prefabInstances[i];
        spawnManager.MoveToRandomPosition(prefabInstance, prefabInstance.minimumSpawnDistance, 50);
    }
}


Awake();

function Awake() {
    SpawnPowerUps();
    global.GameStarted.add(script.api.MoveAllInstancesToRandomPositions);
}


function SpawnPowerUps() {
    for (let i = 0; i < script.maxInstances; i++) {
        let powerUpInstance = script.speedPowerUp.instantiate(script.PrefabsParent);
        prefabInstances.push(powerUpInstance);
    }
}