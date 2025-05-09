// @input Asset.AudioTrackAsset[] highlightSoundClips
// @input string[] buttonText
// @input SceneObject gridMover
// @input SceneObject camera;
// @input float minDistanceToCamera
// @input float maxDistanceToCamera
// @input SceneObject scoreText
// @input Component.ScriptComponent highestScoreTweenValue
// @input Component.ScriptComponent ScoreTextTweenValue


script.api.scoreThisRound = -1;


function Start() {
    script.api.scoreThisRound = -1

    let gridTiles = script.gridMover.getComponent("Component.ScriptComponent").api.gridTiles;

    for (let i = 0, count = Math.min(script.highlightSoundClips.length, gridTiles[0].length); i < count; i ++) {
        let audioComponent = gridTiles[0][i].getComponent("AudioComponent");
        audioComponent.audioTrack = script.highlightSoundClips[i];

        let buttonLabel = gridTiles[0][i].getChild(1).getComponent("Component.Text3D");
        buttonLabel.text = script.buttonText[i];

        let buttonHandler = gridTiles[0][i].getComponent("Component.ScriptComponent");
        buttonHandler.api.index = i;
        buttonHandler.api.scriptMenuController = script;
    }

    resetScore();
    script.highestScoreTweenValue.api.UpdateScoreText(global.saveManager.GetHighestScore());

}

function resetScore() {
    if (script.api.scoreThisRound !== -1) {
        script.scoreText.enabled = true;
    }
    else script.scoreText.enabled = false;
}

function updateMenu() {
    let distanceToCamera = script.camera.getTransform().getWorldPosition().sub(script.getSceneObject().getParent().getTransform().getWorldPosition()).length;
    if (distanceToCamera < script.minDistanceToCamera || distanceToCamera > script.maxDistanceToCamera) {
        let forward = script.camera.getTransform().getWorldRotation().multiplyVec3(new vec3(0, 0, -1));
        forward.y = 0.0;
        forward = forward.normalize();

        forward = forward.uniformScale(((script.maxDistanceToCamera - script.minDistanceToCamera) * .5) + script.minDistanceToCamera);
        forward = forward.add(new vec3(0, -25, 0));

        script.getSceneObject().getParent().getTransform().setWorldPosition(script.camera.getTransform().getWorldPosition().add(forward));
    }

    script.gridMover.enabled = true;

    resetScore();
}

script.api.OnButtonPress = function(index) {
    switch (index) {
        case 0:
            global.StartGame();
            break;
        case 1:
            global.OpenSettingsMenu();
            break;
    }
}

script.createEvent("OnStartEvent").bind(Start);

var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(updateMenu);