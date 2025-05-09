//@input string tweenName
//@input Physics.ColliderComponent foodCollider
//@input int scoreAmount;
//@input float minimumSpawnDistance;
//@input vec3 startScale;


let initialPosition = script.getSceneObject().getTransform().getLocalPosition()

script.api.IsEaten = false;


script.api.Reset = function(){
    script.getSceneObject().getTransform().setLocalScale(script.startScale);
    script.getSceneObject().getTransform().setLocalPosition(initialPosition);
    script.api.IsEaten = false;
    script.ToggleCollider(true);
}

script.api.ResetScale = function() {
    script.getSceneObject().getTransform().setLocalScale(script.startScale);
}

script.api.ResetWithoutPosition = function() {
    script.api.IsEaten = false;
    script.ToggleCollider(true);
}

script.api.Hide = function() {
    script.getSceneObject().getTransform().setLocalScale(new vec3(0, 0, 0));
    script.api.IsEaten = true;
    script.ToggleCollider(false);
}
script.Eat = function(){
    script.api.IsEaten = true;
}

script.GetWorldPosition = function(){
    return script.getSceneObject().getTransform().getWorldPosition();
}

script.ToggleCollider = function(state){
    script.foodCollider.enabled = state;
}

