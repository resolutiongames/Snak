// @input SceneObject camera;

// @input SceneObject thumbTip
// @input SceneObject indexTip

// @input float pinchEnter
// @input float pinchExit

// @input float minDistance
// @input float maxDistance

// @input int controlType = 0 {"widget": "combobox", "values": [{"label": "FULL", "value": 0}, {"label": "XZ_AXIS", "value": 1}, {"label": "XY_AXIS", "value": 2}, {"label": "YZ_AXIS", "value": 3}, {"label": "X_AXIS", "value": 4}, {"label": "Y_AXIS", "value": 5}, {"label": "Z_AXIS", "value": 6}, {"label": "SINGLE_AXIS_SELECT", "value": 7}]}
// @input string originType = 0 {"widget": "combobox", "values": [{"label": "CAMERA_LOOK", "value": 0}, {"label": "PINCH_POSITION_TO_CAMERA_POSITION", "value": 1}]}
// @input int space = 0 {"widget": "combobox", "values": [{"label": "WORLD", "value": 0}, {"label": "LOCAL", "value": 1}]}

// @input Component.ObjectTracking3D objectTracker
// @input float lostTrackingTimer = 2.0

// @input SceneObject gizmoRoot


script.api.ControlType = {
    FULL: 0,
    XZ_AXIS: 1,
    XY_AXIS: 2,
    YZ_AXIS: 3,
    X_AXIS: 4,
    Y_AXIS: 5,
    Z_AXIS: 6,
    SINGLE_AXIS_SELECT: 7
};

let OriginType = {
    CAMERA_LOOK: 0,
    PINCH_POSITION_TO_CAMERA_POSITION: 1
};

let Space = {
    WORLD: 0,
    LOCAL: 1
};


let originType = parseInt(script.originType);
script.api.controlType = parseInt(script.controlType);
let space = parseInt(script.space);
let camera = script.camera.getTransform();

// Calling .getTransform() is expensive, so always cache.
let thumbTipTransform = script.thumbTip.getTransform();
let indexTipTransform = script.indexTip.getTransform();

let gizmoRoot = script.gizmoRoot;
script.api.gizmoRootTransform = gizmoRoot.getTransform();


let basePos = new vec3(0, 0, 0);
script.api.control = new vec3(0, 0, 0);
script.api.pinchState = 0;



function clamp(value, min, max) {
    if (value > max) return max;
    else if (value < min) return min;
    return value;
}

function inverseLerp(min, max, value) {
    return (value - min) / (max - min);
}

function reset() {
    script.api.pinchState = 4;
    endPinch();

    print("Reset pinch controller");
}

function updateTransform() {
    let deltaTime = getDeltaTime();
    if (deltaTime === 0.0) return;

    let posA = thumbTipTransform.getWorldPosition();
    let posB = indexTipTransform.getWorldPosition();
    let diff = posA.sub(posB);
    let distance = diff.length;

    switch (script.api.pinchState) {
        case 0:
            if (distance <= script.pinchEnter && distance !== 0.0 && script.objectTracker.isTracking()) {
                basePos = posA.add(posB).div(new vec3(2.0, 2.0, 2.0));
                startPinch();
                script.api.pinchState = 1;
            }
            break;

        case 3:
            script.api.pinchState = 0;
            break;

        // After calling reset we have to deliberately unpinch before we can start again.
        case 4:
            if (distance > script.pinchExit && distance !== 0.0 && script.objectTracker.isTracking()) script.api.pinchState = 0;
            break;
        
        case 1:
        case 2:
            if (distance > script.pinchExit || !script.objectTracker.isTracking()) {
                endPinch();
                script.api.pinchState = 3;
            }
            else {
                updatePinch(posA, posB);
                script.api.pinchState = 2;
            }
            break;
        
    }
}

function startPinch() {
    script.api.gizmoRootTransform.setWorldPosition(basePos);
    gizmoRoot.enabled = true;
    
    // if we have the dual or single axis select, once it has made the axis selection it changes the control type to lock the selection. This will reset it at the start of a new pinch.
    if (script.api.controlType !== script.controlType) script.api.controlType = script.controlType;
    
    // Set the root's rotation if we have non-full control so we can lock direction to local positions.
    if (originType === OriginType.PINCH_POSITION_TO_CAMERA_POSITION) {
        let baseCamDir = basePos.sub(camera.getWorldPosition());
        baseCamDir.y = 0.0;
        baseCamDir = baseCamDir.normalize();
        let rotation = quat.lookAt(baseCamDir, vec3.up());
        script.api.gizmoRootTransform.setWorldRotation(rotation);
    }
    else {
        let forward = camera.getWorldRotation().multiplyVec3(vec3.forward());
        forward.y = 0.0;
        forward = forward.normalize();

        let rotation = quat.lookAt(forward, vec3.up());
        script.api.gizmoRootTransform.setWorldRotation(rotation);
    }
}

function endPinch() {
    gizmoRoot.enabled = false;
    script.api.control = new vec3(0, 0, 0);
}

function updatePinch(posA, posB) {
    if (!gizmoRoot.enabled) {
        script.api.control = vec3.zero();
        return;
    }
    
    let diff = posA.add(posB).div(new vec3(2, 2, 2));
    
    if (script.api.controlType !== script.api.ControlType.FULL) {
        let localPos = script.api.gizmoRootTransform.getInvertedWorldTransform().multiplyPoint(diff);
        
        if (script.api.controlType === script.api.ControlType.SINGLE_AXIS_SELECT) {
            if (diff.sub(basePos).length <= script.minDistance) return;
            
            if (Math.abs(localPos.x) > Math.abs(localPos.y)) {
                if (Math.abs(localPos.x) > Math.abs(localPos.z)) script.api.controlType = script.api.ControlType.X_AXIS;
                else script.api.controlType = script.api.ControlType.Z_AXIS;
            }
            else if (Math.abs(localPos.y) > Math.abs(localPos.z)) script.api.controlType = script.api.ControlType.Y_AXIS;
            else script.api.controlType = script.api.ControlType.Z_AXIS;
        }
        
        switch (script.api.controlType) {            
            case script.api.ControlType.XZ_AXIS:
                localPos.y = 0.0;
                break;
            
            case script.api.ControlType.XY_AXIS:
                localPos.z = 0.0;
                break;
            
            case script.api.ControlType.YZ_AXIS:
                localPos.x = 0.0;
                break;
            
            case script.api.ControlType.X_AXIS:
                localPos.y = 0.0;
                localPos.z = 0.0;
                break;
            
            case script.api.ControlType.Y_AXIS:
                localPos.x = 0.0;
                localPos.z = 0.0;
                break;
            
            case script.api.ControlType.Z_AXIS:
                localPos.x = 0.0;
                localPos.y = 0.0;
                break;
        }
        
        diff = script.api.gizmoRootTransform.getWorldTransform().multiplyPoint(localPos);
    }

    let direction = diff.sub(basePos);
    let multiplier = clamp(direction.length, script.minDistance, script.maxDistance);
    let clampedDistance = multiplier;
    multiplier = inverseLerp(script.minDistance, script.maxDistance, clampedDistance);
    direction = direction.normalize().uniformScale(multiplier);  
    
    
    if (space === Space.WORLD) script.api.control = direction;
    else script.api.control = script.api.gizmoRootTransform.getWorldRotation().invert().multiplyVec3(direction);
    
    if (!direction.equal(vec3.zero())) direction = direction.normalize();
}

// Run on frame update
let updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(updateTransform);

script.createEvent("OnDisableEvent").bind(reset);