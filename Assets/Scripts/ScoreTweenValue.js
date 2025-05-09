// @input string ScorePrefix
// @input Component.Text3D scoreText
//@input Component.ScriptComponent TweenValue
//@input float minScoreDuration
//@input float maxScoreDuration

script.api.TweenScore = function (scoreToTweenTo) {
    script.TweenValue.api.time = calculateDuration(scoreToTweenTo);
    script.TweenValue.api.setEnd(scoreToTweenTo);
    global.tweenManager.startTween(script.getSceneObject(), "tween_value");
    global.PlayScoreTweenSFX();
}

function calculateDuration(score) {
    const scaledDuration = score / 100;
    const duration = Math.max(script.minScoreDuration, Math.min(script.maxScoreDuration, scaledDuration));
    return duration;
}

script.api.GetTweenDuration = function () {
    return script.TweenValue.api.time;
}

script.api.UpdateScoreText = function (currentScoreValue) {
    script.scoreText.text = script.ScorePrefix + " " + currentScoreValue;
}

script.api.IsPlaying = function () {
    return global.tweenManager.isPlaying(script.getSceneObject(), "tween_value");
}

script.api.DoScorePunchScale = function (score) {
    script.api.UpdateScoreText(score);
    global.tweenManager.startTween(script.getSceneObject(), "punch_scale");
}
