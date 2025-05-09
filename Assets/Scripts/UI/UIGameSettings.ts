import {Slider} from "SpectaclesInteractionKit/Components/UI/Slider/Slider";
import { ContainerFrame } from "SpectaclesInteractionKit/Components/UI/ContainerFrame/ContainerFrame"
import { GameManager } from '../GameManager_Declaration';
import { ScoreManager } from '../ScoreManager_Declaration';
import {ToggleButton} from "SpectaclesInteractionKit/Components/UI/ToggleButton/ToggleButton";

@component
export class UIGameSettings extends BaseScriptComponent {
    @input
    container: ContainerFrame

    //Background Music
    @input
    backgroundMusicSlider!: Slider;
    @input
    backgroundMusicVolumeText !: Text

    //SFX
    @input
    sfxMusicSlider!: Slider;
    @input
    sfxMusicVolumeText !: Text


    //World Center
    @input
    worldCenterSlider!: Slider;
    @input
    worldCenterSliderText !: Text


    //ScorePopUpToggle
    @input
    scorePopUpToggle!: ToggleButton;


    @typename
    AudioManager: keyof ComponentNameMap;
    @input('AudioManager')
    audioManager: any;

    @input('Component.ScriptComponent')
    gameManager: GameManager;

    @typename
    ScoreManager: keyof ComponentNameMap;
    @input('ScoreManager')
    scoreManager: ScoreManager;

    @input
    mainMenu: SceneObject;

    onAwake() {
        this.createEvent("OnStartEvent").bind(() => {
            this.OnStart()
        })

        this.createEvent("OnEnableEvent").bind(() => {
            this.OnEnable()
        })

        this.container.closeButton.onTrigger.add(() => {
            this.CloseSettings();
        })
        this.container.enableCloseButton(true);
    }

    private OnEnable() {
        this.container.enableCloseButton(true);
    }

    private CloseSettings(): void {
        this.gameManager.SavePlayAreaWorldCenter();
        this.audioManager.SaveSettings();
        this.scoreManager.SaveScorePopUpSetting(this.scorePopUpToggle.isToggledOn);

        this.mainMenu.enabled = true;
        this.getSceneObject().enabled = false;
    }

    private OnStart() {
        let backgroundMusicVolume = this.audioManager.GetBackgroundMusicVolume();
        this.backgroundMusicSlider.currentValue = backgroundMusicVolume;
        this.backgroundMusicVolumeText.text = backgroundMusicVolume.toFixed(1).toString();

        let sfxMusicVolume = this.audioManager.GetSFXVolume();
        this.sfxMusicSlider.currentValue = sfxMusicVolume;
        this.sfxMusicVolumeText.text = sfxMusicVolume.toFixed(1).toString();

        let worldAreaCenterZ = Math.abs(this.gameManager.GetPlayAreaWorldCenter().z);
        this.worldCenterSlider.currentValue = worldAreaCenterZ;
        this.worldCenterSliderText.text = worldAreaCenterZ.toString();


        let isScorePopUpEnabled = this.scoreManager.GetScorePopUpSetting();
        this.scorePopUpToggle.isToggledOn = isScorePopUpEnabled;


        this.backgroundMusicSlider.onValueUpdate.add((value) => {this.OnBackgroundMusicSlideValueChanged(value)});
        this.sfxMusicSlider.onValueUpdate.add((value) => {this.OnSFXMusicSlideValueChanged(value)});
        this.worldCenterSlider.onValueUpdate.add((value) => {this.OnWorldCenterValueChanged(value)});
    }

    private OnBackgroundMusicSlideValueChanged(number) {
        this.backgroundMusicVolumeText.text = number.toFixed(1).toString();
        this.audioManager.UpdateBackgroundMusicVolume(number);
    }

    private OnSFXMusicSlideValueChanged(number) {
        this.sfxMusicVolumeText.text = number.toFixed(1).toString();
        this.audioManager.UpdateSFXMusicVolume(number);
    }

    private OnWorldCenterValueChanged(number) {
        this.worldCenterSliderText.text = number.toString();
        this.gameManager.SetPlayAreaWorldCenter(number);
    }
}