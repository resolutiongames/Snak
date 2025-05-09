// @input SceneObject[] controller
// @input SceneObject head
// @input SceneObject headRenderMeshVisuals
// @input SceneObject bodyPrefab
// @input SceneObject tailPrefab
// @input Physics.ColliderComponent headCollider
// @input float jawSpeed
// @input float maxJawAngleRadians
// @input float speedBonusFactor {"min":0, "max":10, "step":0.25}

// @input float speed
// @input float speedPerSegment

// @input float segmentDistance

// @input float lengthBodyBit

// @input SceneObject foodManager
// @input float foodEffectMultiplier

// @input bool selfIntersection
// @input int segmentLossOnHit

// @input SceneObject playArea
// @input float playAreaOuterRadius
// @input Component.ScriptComponent gameManager

// @input SceneObject camera

// @input SceneObject mainMenu

// @input SceneObject boundaryIndicatorX
// @input SceneObject boundaryIndicatorY
// @input SceneObject boundaryIndicatorZ

// @input float spawnImmunityDuration;

// @input Asset.Material boundaryMaterial

// @input float minDeathAnimationTimePerSegment
// @input float maxDeathAnimationTimePerSegment
// @input float maxDeathAnimationDuration

//@input Component.ScriptComponent flicker;


let controlHand = -1;
let controller = [
    script.controller[0].getComponent("Component.ScriptComponent"),
    script.controller[1].getComponent("Component.ScriptComponent")
];

let bodyBits = [];
script.api.bodyBits = bodyBits;

let direction = new vec3(0, 0, 1);
let positions = [];

let jawSpeed = script.jawSpeed;
let jawMesh = script.headRenderMeshVisuals.getComponent("Component.RenderMeshVisual")

let currentFood = 0.0;


let initialSegmentCount = 10;


//Speed Boost
let speedBoostEvent = null;
let currentSpeed = script.speed;

let spawnImmunity = 0.0;
let deathTimer = -1.0;
let deathSegmentDelay = 0.0;

let boundaryIndicatorXTransform = script.boundaryIndicatorX.getTransform();
let boundaryIndicatorYTransform = script.boundaryIndicatorY.getTransform();
let boundaryIndicatorZTransform = script.boundaryIndicatorZ.getTransform();



function clamp(value, min, max) {
    if (value > max) return max;
    else if (value < min) return min;
    return value;
}

function inverseLerp(min, max, value) {
    return (value - min) / (max - min);
}

function getFurthestRaySphereIntersection(rayOrigin, rayDir, sphereCenter, sphereRadius) {
    let oc = rayOrigin.sub(sphereCenter);
    let a = rayDir.dot(rayDir); // Should be 1 if rayDir is normalized
    let b = 2.0 * oc.dot(rayDir);
    let c = oc.dot(oc) - (sphereRadius * sphereRadius);

    let discriminant = (b * b) - (4 * a * c);

    if (discriminant < 0) return null; // No intersection

    let sqrtDisc = Math.sqrt(discriminant);
    let t1 = (-b - sqrtDisc) / (2.0 * a);
    let t2 = (-b + sqrtDisc) / (2.0 * a);

    // We want the furthest intersection, so we pick the larger t
    let tFurthest = Math.max(t1, t2);

    if (tFurthest < 0) return rayOrigin;

    return rayOrigin.add(rayDir.uniformScale(tFurthest));
}

function start() {
    spawnImmunity = script.spawnImmunityDuration;
    deathTimer = -1.0;
    script.headCollider.enabled = false;

    let boundaryScale = global.boundary.boundaryMaximum.sub(global.boundary.boundaryMinimum);
    let maxBoundaryScale = Math.max(boundaryScale.x, boundaryScale.y, boundaryScale.z);

    script.boundaryIndicatorX.getTransform().setWorldScale(new vec3(maxBoundaryScale, 1, maxBoundaryScale));
    script.boundaryIndicatorY.getTransform().setWorldScale(new vec3(maxBoundaryScale, 1, maxBoundaryScale));
    script.boundaryIndicatorZ.getTransform().setWorldScale(new vec3(maxBoundaryScale, 1, maxBoundaryScale));

    script.boundaryMaterial.mainPass.WorldCenter = script.gameManager.GetPlayAreaWorldCenter();

    script.playArea.getTransform().setWorldPosition(new vec3(0, 0, 0));
    script.head.getTransform().setWorldPosition(new vec3(0, 0, -100.0));

    script.headCollider.getTransform().setLocalPosition(new vec3(0, 0, 0));

    script.head.getTransform().setWorldPosition(script.gameManager.GetPlayAreaWorldCenter());
    script.playArea.getTransform().setWorldPosition(script.gameManager.GetPlayAreaWorldCenter());


    direction = (new vec3(2.5, 1.2, 1)).normalize();
    let rotation = quat.lookAt(direction, vec3.up());
    script.head.getTransform().setWorldRotation(rotation);

    currentSpeed = script.speed;

    let requiredPositions = 5 + Math.ceil((initialSegmentCount * script.lengthBodyBit * global.scale) / (script.segmentDistance * global.scale));
    positions = [];
    let currentPos = script.head.getTransform().getWorldPosition().sub(script.playArea.getTransform().getWorldPosition())
    for (let i = 0; i < requiredPositions; i ++) {
        positions.push(currentPos.sub(direction.uniformScale(script.segmentDistance * global.scale * i)));
    }

    for (let i = 0; i < initialSegmentCount; i ++) {
        addBodyBit();
    }

    for (let i = 0, count = bodyBits.length; i < count; i ++) {
        bodyBits[i].getTransform().setWorldPosition(script.head.getTransform().getWorldPosition().sub(direction.uniformScale(i * script.lengthBodyBit * global.scale)));
        bodyBits[i].getTransform().setWorldRotation(rotation);
    }

    let otherScript = script.foodManager.getComponent("Component.ScriptComponent");
    if (!otherScript) return;
    print("StartEvent");
}

function updateSnake() {
    let deltaTime = getDeltaTime();

    if (deathTimer > 0.0) {
        deathTimer -= deltaTime;
        if (deathTimer < 0.0) {
            DestroyLastBodyBit();
            deathTimer = deathSegmentDelay;
            return;
        }

        if (bodyBits.length === 0) deathCleanup();

        return;
    }

    if (spawnImmunity > 0) {
        spawnImmunity -= deltaTime;
        if (spawnImmunity < 0) script.headCollider.enabled = true;
    }

    updateHead();
    UpdateJaw(deltaTime);
    updatePositions();
    updateBody();
}

function updateHead() {
    let input = direction;

    // Switch between hand for control. If we already started controlling with one hand then attempting to steer with
    // the other will be ignored. A new hand can only be used when the previous hand's pinch is released.
    if (controlHand === -1 || controller[controlHand].api.pinchState === 0) {
        for (let i = 0; i < 2; i ++) {
            if (controller[i].api.pinchState === 1) controlHand = i;
        }
    }
    if (controlHand !== -1) input = controller[controlHand].api.control;

    // Turning speed is determined by movement speed.
    let turnSpeedModifier = (currentSpeed + (script.speedPerSegment * (bodyBits.length - initialSegmentCount))) / currentSpeed;

    // Smoothly interpolate to teh new control direction to prevent a sudden turn, making a nice, fluid looking tail.
    let newDir = input.normalize();
    if (input.length >= .25) direction = vec3.lerp(direction, newDir, getDeltaTime() * 5.0 * turnSpeedModifier).normalize();

    let rotation = quat.lookAt(direction.normalize(), vec3.up());
    script.head.getTransform().setWorldRotation(rotation);

    let speed = currentSpeed * getDeltaTime() * global.scale;
    let movement = direction.uniformScale(speed);

    let newPos = script.head.getTransform().getWorldPosition();
    newPos = newPos.add(movement);
    script.head.getTransform().setWorldPosition(newPos);

    checkBounds();
    ScrollPlayspace(movement);
}

function UpdateJaw(deltaTime) {
    let jawVal = jawMesh.getBlendShapeWeight("Close");
    jawVal += (deltaTime * jawSpeed);

    if (jawVal >= 1.0) {
        jawSpeed *= -1;
        jawVal = 1.0;
    }
    else if (jawVal < 0.0) {
        jawSpeed *= -1;
        jawVal = 0.0;
    }

    jawMesh.setBlendShapeWeight("Close", jawVal);
}

function ScrollPlayspace(movement) {
    let snakeToCenter = script.head.getTransform().getWorldPosition().sub(script.gameManager.GetPlayAreaWorldCenter());
    let length = clamp(snakeToCenter.length, 0, script.playAreaOuterRadius * global.scale);
    length = inverseLerp(0, script.playAreaOuterRadius * global.scale, length);

    length = Math.pow(length, 4);

    script.playArea.getTransform().setWorldPosition(script.playArea.getTransform().getWorldPosition().add(snakeToCenter.uniformScale(-1 * length * global.scale)));
}

script.headCollider.onCollisionEnter.add(function (e) {
    print("Dead snake :(. Collided with " + e.collision.collider.getSceneObject().name);
    death();
});


script.api.Eat = function(scoreAmount){
    let foodManager = script.foodManager.getComponent("Component.ScriptComponent");
    foodManager.EatFood();
    if(global.resetHungerTimer != null) {
        global.resetHungerTimer();
    }

    let scoreToAdd = CalculateScore(scoreAmount);
    global.scoreManager.AddScore(scoreToAdd);

    currentFood += script.foodEffectMultiplier;
    if (currentFood < 1.0) return;

    while (currentFood > 1.0) {
        addBodyBit();
        currentFood -= 1.0;
    }
}


function CalculateScore(scoreAmount) {
    let baseSpeed = script.speed;
    // Calculate speed multiplier
    let speedMultiplier = 1.0;
    if (currentSpeed > baseSpeed) {
        let speedRatio = (currentSpeed - baseSpeed) / baseSpeed; // normalize the difference
        speedMultiplier += speedRatio * script.speedBonusFactor; // keeps it controlled
    }
    // print("Current: " + currentSpeed + " | Base: " + baseSpeed + " | Multiplier: " + speedMultiplier + " | BonusFactor: " + script.speedBonusFactor);
    return Math.round(scoreAmount * speedMultiplier);
}

script.api.IncreaseSpeed = function(speedValue){
    currentSpeed += speedValue;
}

script.api.DecreaseSpeed = function(speedValue){
    currentSpeed -= speedValue;
}

script.api.ResetSpeed = function(){
    currentSpeed = script.speed;
}

script.api.ApplySpeedBoost = function(amount, duration) {
    if (!speedBoostEvent) {
        script.api.IncreaseSpeed(amount);
        speedBoostEvent  = script.createEvent("DelayedCallbackEvent");
        speedBoostEvent .bind(function () {
            script.api.DecreaseSpeed(amount);
            speedBoostEvent  = null;
        });
    }

    speedBoostEvent.reset(duration);
};

function ResetSpeedPowerUp(){
    if(speedBoostEvent) {
        print("Reset SpeedPowerUp");
        speedBoostEvent.cancel();
        speedBoostEvent = null; // Reset timer reference.
        script.api.ResetSpeed();
    }
    else {
        print("No Speed boost to Reset");
    }
}

function updateBody() {
    if (bodyBits === null || bodyBits.length === 0) return;

    let firstPos = positions[0].add(script.playArea.getTransform().getWorldPosition());
    let distanceHeadToFirstNode = script.head.getTransform().getWorldPosition().sub(firstPos).length;

    let bodyOffset = 6 * global.scale;

    for (let i = 0; i < bodyBits.length; i ++) {
        let lengthToThisBit = (i + 0.5) * script.lengthBodyBit * global.scale;
        lengthToThisBit = lengthToThisBit - distanceHeadToFirstNode;
        lengthToThisBit = lengthToThisBit + bodyOffset;
        let nodeCount = lengthToThisBit / (script.segmentDistance * global.scale);

        if (nodeCount === 0) return;

        let nodeIndex = Math.floor(nodeCount);
        let lerpVal = nodeCount % 1.0;

        if (nodeIndex + 1 >= positions.length || !positions[nodeIndex] || !positions[nodeIndex + 1]) continue; // Skip if the positions are not valid

        let posA = positions[nodeIndex].add(script.playArea.getTransform().getWorldPosition());
        let posB = positions[nodeIndex + 1].add(script.playArea.getTransform().getWorldPosition());

        let pos = vec3.lerp(posA, posB, lerpVal);
        bodyBits[i].getTransform().setWorldPosition(pos);

        let rotation = quat.lookAt(posB.sub(posA).normalize(), vec3.up());
        bodyBits[i].getTransform().setWorldRotation(rotation);
    }
}

function updatePositions() {
    while (true) {
        let firstPos = positions[0];

        let currentPos = script.head.getTransform().getWorldPosition().sub(script.playArea.getTransform().getWorldPosition());
        let diff = currentPos.sub(firstPos);

        if (diff.length < script.segmentDistance * global.scale) return;

        positions.unshift(firstPos.add(diff.normalize().uniformScale(script.segmentDistance * global.scale)));
        positions.pop();
    }
}

function addBodyBit() {
    // Add the tail first, otherwise a normal segment. New segments are inserted at the top of the list so the tail gets
    // pushed to the bottom.
    let newObject = bodyBits.length !== 0 ? script.getSceneObject().copyWholeHierarchy(script.bodyPrefab) : script.getSceneObject().copyWholeHierarchy(script.tailPrefab);

    // Body segments have colliders, disabled by default. If we have self intersection enabled, switch it on. We do it
    // before adding the segment so the existing segment closest to the head gets switched on, leaving the newly added
    // segment we're about to add without collisions, because it leads to false-positives.
    if (bodyBits.length !== 0) {
        bodyBits[0].getComponent("Component.ColliderComponent").enabled = script.selfIntersection;
    }

    newObject.getTransform().setWorldPosition(new vec3(0, 0, 0));
    newObject.setParent(script.getSceneObject());
    newObject.enabled = true;
    newObject.getComponent("Component.ColliderComponent").enabled = false;
    bodyBits.unshift(newObject);

    // With a new length of snake, we need to recalculate how many positions to keep track of to move the body through
    // in order to create a nice trail.
    let totalLength = (bodyBits.length * script.lengthBodyBit * global.scale);
    let requiredPositions = 5 + Math.ceil(totalLength / (script.segmentDistance * global.scale));

    for (let i = positions.length; i < requiredPositions; i ++) {
        positions.push(positions[positions.length - 1]);
    }

    // Each new segment beyond the initial size should increment the speed.
    if (bodyBits.length > initialSegmentCount) currentSpeed += script.speedPerSegment;
}

function checkBounds() {
    let headPos = script.playArea.getTransform().getInvertedWorldTransform().multiplyPoint(script.head.getTransform().getWorldPosition());//script.head.getTransform().getLocalPosition();

    script.boundaryMaterial.mainPass.WorldCenter = script.head.getTransform().getWorldPosition();

    if (
        headPos.x < global.boundary.boundaryMinimum.x || headPos.x >= global.boundary.boundaryMaximum.x ||
        headPos.y < global.boundary.boundaryMinimum.y || headPos.y >= global.boundary.boundaryMaximum.y ||
        headPos.z < global.boundary.boundaryMinimum.z || headPos.z >= global.boundary.boundaryMaximum.z
    ) death();


    // Set each of the x, y and z boundary planes depending on where the snake is.
    boundaryIndicatorXTransform.setLocalPosition(new vec3(
        (headPos.x < 0.0 ? global.boundary.boundaryMinimum.x : global.boundary.boundaryMaximum.x),
        (global.boundary.boundaryMaximum.y - global.boundary.boundaryMinimum.y) / 2,
        (global.boundary.boundaryMaximum.z - global.boundary.boundaryMinimum.z) / 2
    ));

    boundaryIndicatorYTransform.setLocalPosition(new vec3(
        (global.boundary.boundaryMaximum.x - global.boundary.boundaryMinimum.x) / 2,
        (headPos.y < 0.0 ? global.boundary.boundaryMinimum.y : global.boundary.boundaryMaximum.y),
        (global.boundary.boundaryMaximum.z - global.boundary.boundaryMinimum.z) / 2
    ));

    boundaryIndicatorZTransform.setLocalPosition(new vec3(
        (global.boundary.boundaryMaximum.x - global.boundary.boundaryMinimum.x) / 2,
        (global.boundary.boundaryMaximum.y - global.boundary.boundaryMinimum.y) / 2,
        (headPos.z < 0.0? global.boundary.boundaryMinimum.z : global.boundary.boundaryMaximum.z)
    ));
}

script.api.LoseSegment = function (segmentsToLose) {
    if (bodyBits.length > (segmentsToLose + 3)) {
        bodyBits = bodyBits.reverse();
        for(let i = 0, count = segmentsToLose; i < count; i ++) {
            bodyBits.pop().destroy();
        }
        bodyBits = bodyBits.reverse();
        print("losing segment")
    }
    else
    {
        for(let i = 0, count = bodyBits.length; i < count; i ++) {
            bodyBits[i].destroy();
        }
        bodyBits.length = 0;
        positions.length = 0;

        ResetSpeedPowerUp();

        start();
        global.EndGame();
        print("Died because too hungry")
    }
};

function death() {
    deathTimer = 2.0;
    deathSegmentDelay = script.maxDeathAnimationDuration / bodyBits.length;
    if (deathSegmentDelay > script.maxDeathAnimationTimePerSegment) deathSegmentDelay = script.maxDeathAnimationTimePerSegment;
    if (deathSegmentDelay < script.minDeathAnimationTimePerSegment) deathSegmentDelay = script.minDeathAnimationTimePerSegment;
    script.flicker.StartFlicker();
    global.StopGameMusic();
    global.PlayObstacleHitSFX();
}

function DestroyLastBodyBit() {
    bodyBits.pop().destroy();
    global.PopSFX();
}

function deathCleanup() {
    if (bodyBits.length > (script.segmentLossOnHit + 3)) {
        bodyBits = bodyBits.reverse();
        for(let i = 0, count = script.segmentLossOnHit; i < count; i ++) {
            bodyBits.pop().destroy();
        }
        bodyBits = bodyBits.reverse();
        return;
    }


    for(let i = 0, count = bodyBits.length; i < count; i ++) bodyBits[i].destroy();
    bodyBits.length = 0;
    positions.length = 0;
    global.PlayObstacleHitSFX();

    ResetSpeedPowerUp();

    start();
    global.EndGame();
}


let startEvent = script.createEvent("OnStartEvent");
startEvent.bind(start);

let updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(updateSnake);