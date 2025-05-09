// @input Component.AudioComponent backgroundMusic
// @input Component.AudioComponent eatSFX
// @input Component.AudioComponent powerUpSFX
// @input Component.AudioComponent obstacleHitSFX
// @input Asset.AudioTrackAsset[] eatSfxAudioTracks
// @input Asset.AudioTrackAsset[] obstacleHitSfxAudioTracks
// @input Component.AudioComponent scoreSFX
// @input Component.AudioComponent popSFX
// @input Asset.AudioTrackAsset newHighScoreSFX
// @input Asset.AudioTrackAsset scoreTweenSFX
// @input Asset.AudioTrackAsset gameMusic
// @input Asset.AudioTrackAsset menuMusic

script.UpdateBackgroundMusicVolume = function (value) {
    script.backgroundMusic.volume = value;
};

script.UpdateSFXMusicVolume = function (value) {
    script.eatSFX.volume = value;
    script.powerUpSFX.volume = value;
    script.obstacleHitSFX.volume = value;
    script.scoreSFX.volume = value;
    script.popSFX.volume = value;
};

Awake();

function Awake() {
    script.UpdateBackgroundMusicVolume(global.saveManager.GetBackgroundMusicVolume());
    script.UpdateSFXMusicVolume(global.saveManager.GetSFXVolume());
}

script.GetBackgroundMusicVolume = function () {
    return script.backgroundMusic.volume;
}

script.GetSFXVolume = function () {
    return script.eatSFX.volume; //picking any random one (make sure all SFX volume is the same)
}

script.SaveSettings = function() {
    global.saveManager.SaveSFXSettings(script.eatSFX.volume);
    global.saveManager.SaveBackgroundVolumeSettings(script.backgroundMusic.volume);
}


global.PlayGameMusic = function() {
    script.backgroundMusic.audioTrack = script.gameMusic;
    script.backgroundMusic.play(-1);
}

global.StopGameMusic = function() {
    script.backgroundMusic.stop(true);
}

global.PlayMenuMusic = function() {
    script.backgroundMusic.audioTrack = script.menuMusic;
    script.backgroundMusic.play(-1);
}

global.StopBackgroundMusic = function() {
    script.backgroundMusic.stop(true);
}

global.PlayEatSFX = function() {
    let eatSFX = script.eatSFX;
    let audioTrack = GetRandomSFX(script.eatSfxAudioTracks);
    if(audioTrack !== null) {
        eatSFX.audioTrack = audioTrack;
    }
    eatSFX.play(1);
}


global.PlayPowerUpSFX = function() {
    script.powerUpSFX.play(1);
}


global.PopSFX = function() {
    let popSFX = script.popSFX;
    popSFX.play(1);
}


global.PlayObstacleHitSFX = function() {
    let obstacleHitSFX = script.obstacleHitSFX;
    let audioTrack = GetRandomSFX(script.obstacleHitSfxAudioTracks);
    if(audioTrack !== null) {
        obstacleHitSFX.audioTrack = audioTrack;
    }
    obstacleHitSFX.play(1);
}

global.StopScoreTweenSFX = function() {
    script.scoreSFX.stop(true);
}

global.PlayScoreTweenSFX = function() {
    script.scoreSFX.audioTrack = script.scoreTweenSFX;
    script.scoreSFX.play(1);
}

global.PlayHighScoreSFX = function() {
    script.scoreSFX.audioTrack = script.newHighScoreSFX;
    script.scoreSFX.play(1);
}

function GetRandomSFX(sfxList) {
    if (sfxList.length > 0) {
        var randomIndex = Math.floor(Math.random() * sfxList.length);
        return sfxList[randomIndex];
    }
    return null; // Return null if the array is empty
}
