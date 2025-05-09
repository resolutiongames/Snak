//@input Physics.ColliderComponent foodCollider
//@input int speedAmount = 40; {"min":1, "max":100, "step":1}
//@input int maxTimerDuration = 5.0; {"min":1, "max":100, "step":1}
//@input float minimumSpawnDistance;

script.foodCollider.onOverlapEnter.add(function (e) {
    let item = e.overlap.collider.getSceneObject();
    let snakeComponent = item.getParent().getParent().getComponent("Component.ScriptComponent");

    if (snakeComponent) {
        let object = script.getSceneObject();
        spawnManager.MoveToRandomPosition(object, script.minimumSpawnDistance);
        global.PlayPowerUpSFX();

        snakeComponent.api.ApplySpeedBoost(script.speedAmount, script.maxTimerDuration);
    }
});


