export interface ScoreManager extends ScriptComponent {
    EnableScorePopUp: () => void;
    DisableScorePopUp: () => void;
    GetScorePopUpSetting: () => boolean;
    SaveScorePopUpSetting: (isEnabled) => void;
}