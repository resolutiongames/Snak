// @input Component.ScriptComponent highestScoreTweenValue
// @input Component.ScriptComponent ScoreTextTweenValue

const coroutineModule = require('Coroutine');
const CoroutineManager = coroutineModule.CoroutineManager;
const coroutineManager = new CoroutineManager(script);
const waitForSeconds = coroutineModule.waitForSeconds;


script.createEvent("OnStartEvent").bind(Start);
script.api.scoreThisRound = -1;

Awake();

function Awake() {
    global.GameEnded.add(OnGameEnd);
    global.GameStarted.add(OnGameStarted);
}

function OnGameEnd() {
    script.api.scoreThisRound = global.scoreManager.totalScore;
    ShowScoreIfValid();
    coroutineManager.startCoroutine(UpdateScoreRoutine);
    script.highestScoreTweenValue.api.UpdateScoreText(global.saveManager.GetHighestScore());
}

function OnGameStarted() {
    global.StopScoreTweenSFX();
}

function Start() {
    script.api.scoreThisRound = -1
    ShowScoreIfValid();
    script.highestScoreTweenValue.api.UpdateScoreText(global.saveManager.GetHighestScore());
}

function ShowScoreIfValid() {
    if (script.api.scoreThisRound !== -1) {
        script.ScoreTextTweenValue.getSceneObject().enabled = true;
    }
    else script.ScoreTextTweenValue.getSceneObject().enabled = false;
}

function* UpdateScoreRoutine() {
    if(script.api.scoreThisRound > 0) {
        script.ScoreTextTweenValue.api.TweenScore(script.api.scoreThisRound);
    }
    else {
        script.ScoreTextTweenValue.api.UpdateScoreText(script.api.scoreThisRound);
    }
    let lastHighestScore = global.saveManager.GetHighestScore();
    if(script.api.scoreThisRound > lastHighestScore) {
        global.saveManager.SaveHighestScore(script.api.scoreThisRound);
    }
    yield* waitForSeconds(script.ScoreTextTweenValue.api.GetTweenDuration());
    global.StopScoreTweenSFX();
    UpdateHighestScore(lastHighestScore);
}

function UpdateHighestScore(lastHighestScore) {
    let scoreThisRound = script.api.scoreThisRound;
    if(scoreThisRound > lastHighestScore) {
        script.highestScoreTweenValue.api.DoScorePunchScale(global.saveManager.GetHighestScore());
        global.PlayHighScoreSFX();
    }
}