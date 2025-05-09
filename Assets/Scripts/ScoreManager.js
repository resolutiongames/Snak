var eventModule = require("./EventModule");
global.ScoreAdded = new eventModule.EventWrapper();

global.scoreManager = {
    totalScore: 0,

    AddScore: function(scoreAmount) {
        this.totalScore += scoreAmount;
        global.ScoreAdded.trigger(scoreAmount);
    },

   ResetScore: function() {
       this.totalScore = 0;
    },

}

script.SaveScorePopUpSetting = function(isEnabled) {
    global.saveManager.SaveScorePopUpSetting(isEnabled);
    print("Saving Score Pop up " + isEnabled);
}

script.GetScorePopUpSetting = function() {
    return global.saveManager.GetScorePopUpSetting();
}