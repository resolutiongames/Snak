//@input Physics.ColliderComponent collider
//@input SceneObject target;

var collider = script.getSceneObject().getComponent("Component.Collider");


function onCollision(eventData) {
    //print("A Collision Detected with: ");// + eventData.otherObject.name);
    
    var otherScript = script.target.getComponent("Component.ScriptComponent");
    otherScript.api.onCollision(eventData);
    
}

script.collider.onCollisionEnter.add(onCollision);