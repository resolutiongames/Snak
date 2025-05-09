//@input vec3 defaultWorldCenter;
//@input number defaultAudioValue;
//@input bool defaultScorePopUp;
//@input bool clearStoreOnStart;


let store = global.persistentStorageSystem.store;
const scoreKey = 'HighestScore';
const worldCenterKey = 'WorldCenter';
const backgroundMusicKey = 'BackgroundMusicVolume';
const SFXKey = 'SFXVolume';
const scorePopUpKey = 'ScorePopUp';



global.saveManager = {
    SaveHighestScore: function(newHighestScore) {
        store.putInt(scoreKey, newHighestScore);
        print('Current Highest Score: ' + newHighestScore);
    },

    GetHighestScore: function() {
        return store.getInt(scoreKey);
    },

    ClearStore: function() {
      store.clear();
      print('Storage cleared');
    },

    SavePlayAreaWorldCenter: function(worldCenter) {
        store.putVec3(worldCenterKey, worldCenter);
        print('Current World Center: ' + worldCenter);
    },

    GetPlayAreaWorldCenter: function() {
        if(store.has(worldCenterKey)) {
            return store.getVec3(worldCenterKey);
        }
        else {
            return script.defaultWorldCenter;
        }
    },

    SaveSFXSettings: function(volume) {
        store.putFloat(SFXKey, volume);
        print('Saved SFX Volume' + volume);
    },

    GetSFXVolume: function() {
        if(store.has(SFXKey)) {
            return store.getFloat(SFXKey);
        }
        else {
            return script.defaultAudioValue;
        }
    },

    SaveBackgroundVolumeSettings: function(volume) {
        store.putFloat(backgroundMusicKey, volume);
        print('Saved background Volume' + volume);
    },

    GetBackgroundMusicVolume: function() {
        if(store.has(backgroundMusicKey)) {
            return store.getFloat(backgroundMusicKey);
        }
        else {
            return script.defaultAudioValue;
        }
    },

    SaveScorePopUpSetting: function(enabled) {
        store.putBool(scorePopUpKey, enabled);
        print('Saved Score PopUp ' + enabled);
    },

    GetScorePopUpSetting: function() {
        if(store.has(scorePopUpKey)) {
            return store.getBool(scorePopUpKey);
        }
        else {
            return script.defaultScorePopUp;
        }
    },
}

if(script.clearStoreOnStart) {
    global.saveManager.ClearStore();
}

// Check if we need to do this.
// store.onStoreFull = function () {
//     store.clear();
//     print('Storage cleared');
// };