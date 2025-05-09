//@input Physics.ColliderComponent foodCollider
//@input float pushStrength

script.foodCollider.onOverlapStay.add(function (e) {
    if(e.overlap.collider.getSceneObject().name.includes("Snake")) return;
    Depenetrate(script.getSceneObject().getParent(), e.overlap.collider.getSceneObject());
});


function Depenetrate(objectToMove) {
    let pushStrength = script.pushStrength;
    if (!objectToMove) {
        print("Depenetrate: Missing objectToMove");
        return;
    }

    let minBound = global.boundary.boundaryMinimum;
    let maxBound = global.boundary.boundaryMaximum;

    var objTransform = objectToMove.getTransform();
    var objectPos = objTransform.getWorldPosition();

    // Calculate center of the boundary (midpoint between min and max)
    var center = minBound.add(maxBound).uniformScale(0.5);

    // Calculate direction toward the center of the boundary
    var direction = center.sub(objectPos);

    // If we're very close to the center, generate a random direction to break the deadlock
    if (direction.length < 0.001) {
        direction = new vec3(Math.random() - 0.5, 0, Math.random() - 0.5).normalize();
    } else {
        direction = direction.normalize(); // Otherwise, normalize the direction to push inward
    }
    // Apply push strength to the direction
    var moveStep = direction.uniformScale(pushStrength);
    var newPosition = objectPos.add(moveStep);

    // Clamp the new position to stay within the bounds (no margin)
    var clampedPosition = clampVector(newPosition, minBound, maxBound);

    // Set the object's world position to the clamped position
    objTransform.setWorldPosition(clampedPosition);
}

function clampVector(vec, minVec, maxVec) {
    return new vec3(
        Math.max(minVec.x, Math.min(vec.x, maxVec.x)),
        Math.max(minVec.y, Math.min(vec.y, maxVec.y)),
        Math.max(minVec.z, Math.min(vec.z, maxVec.z))
    );
}