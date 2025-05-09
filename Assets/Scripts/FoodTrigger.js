//@input Physics.ColliderComponent foodTrigger
//@input Component.ScriptComponent snakeComponent;
//@input SceneObject snakeHead;

let foodItemTypeName = requireType('Food');
let foodCurveItem = requireType('FoodCurveItem');

const coroutineModule = require('Coroutine');
const CoroutineManager = coroutineModule.CoroutineManager;
const coroutineManager = new CoroutineManager(script);
const waitForEndOfFrame = coroutineModule.waitForEndOfFrame;

script.foodTrigger.onOverlapEnter.add(function (e) {
    let foodObject = e.overlap.collider.getSceneObject();
    // Fetch the component
    let foodScript = foodObject.getComponent(foodCurveItem);
    if(!foodScript) {
        foodScript = foodObject.getComponent(foodItemTypeName);
    }
    if (foodScript) {
        global.PlayEatSFX();
        coroutineManager.startCoroutine(EatRoutine, foodScript, foodObject);
    }
});


function* EatRoutine(foodScript, foodObject) {
    let snakeComponent = script.snakeComponent;
    foodScript.ToggleCollider(false);
    global.tweenManager.stopTween(foodObject, "food_scale");
    let duration = 0.25;
    let elapsedTime = 0.0;

    let startPosition = foodScript.GetWorldPosition();

    let targetPosition = script.getSceneObject().getTransform().getWorldPosition();

    let targetScale = new vec3(0, 0, 0);

    while (elapsedTime < duration) {
        let t = elapsedTime / duration;
        let easedT = t * t * (3 - 2 * t); // smoothstep easing
        let newPosition = vec3.lerp(startPosition, targetPosition, easedT);
        foodObject.getTransform().setWorldPosition(newPosition);
        let newScale = vec3.lerp(foodScript.startScale, targetScale, easedT);
        foodObject.getTransform().setLocalScale(newScale);

        elapsedTime += getDeltaTime();
        yield waitForEndOfFrame;
    }

    foodObject.getTransform().setLocalScale(targetScale);

    snakeComponent.api.Eat(foodScript.scoreAmount);
    foodScript.Eat();
}
