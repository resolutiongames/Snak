import {ContainerFrame} from "../../SpectaclesInteractionKit/Components/UI/ContainerFrame/ContainerFrame";
import {GameManager} from "../GameManager_Declaration";
import {validate} from "../../SpectaclesInteractionKit/Utils/validate";
import {Interactable} from "../../SpectaclesInteractionKit/Components/Interaction/Interactable/Interactable";

@component
export class UIMainMenu extends BaseScriptComponent {
    @input
    container: ContainerFrame

    @input('Component.ScriptComponent')
    gameManager: GameManager;

    @input
    settingsMenu: SceneObject;

    @input
    playButton!: SceneObject
    @input
    settingsButton!: SceneObject

    @input
    interactionVisuals!: SceneObject


    private playButton_interactable: Interactable | null = null
    private settingsButton_interactable: Interactable | null = null


    onAwake() {
        const interactableTypeName = Interactable.getTypeName()
        this.playButton_interactable = this.playButton.getComponent(interactableTypeName);
        if (isNull(this.playButton_interactable)) {
            throw new Error("Interactable component not found.")
        }
        this.settingsButton_interactable = this.settingsButton.getComponent(interactableTypeName);

        this.createEvent("OnEnableEvent").bind(() => {
            this.OnEnable()
        })

        this.createEvent("OnStartEvent").bind(() => {
            this.OnStart()
        })
    }

    private OnEnable() {
        this.container.enableCloseButton(false);
        this.interactionVisuals.enabled = true;
    }

    private OnStart() {
        this.setupButtonCallbacks()
    }

    private setupButtonCallbacks() {
        validate(this.playButton_interactable)
        validate(this.settingsButton_interactable)
        this.playButton_interactable.onTriggerEnd.add(this.onPlayButtonPressed)
        this.settingsButton_interactable.onTriggerEnd.add(this.onSettingsButtonPressed)
    }

    private onPlayButtonPressed = (): void => {
        this.interactionVisuals.enabled = false;
        this.gameManager.StartGame();
    }

    private onSettingsButtonPressed = (): void => {
        this.settingsMenu.enabled = true;
        this.getSceneObject().enabled = false;
        print("opening settings");
    }
}
