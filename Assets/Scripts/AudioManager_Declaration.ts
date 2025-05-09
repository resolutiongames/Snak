export interface AudioManager extends ScriptComponent {
    UpdateBackgroundMusicVolume: () => void;
    UpdateSFXMusicVolume: () => void;
    GetBackgroundMusicVolume: () => number;
    GetSFXVolume: () => number;
    SaveSettings: () => void;
}