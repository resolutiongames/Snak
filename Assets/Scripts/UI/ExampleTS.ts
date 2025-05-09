@component
export class ExampleTS extends BaseScriptComponent {
    @input
    private debug: boolean = false;


    @input()
    @showIf("debug")
    @widget(new SliderWidget(0, 1, 0.1)) // https://developers.snap.com/lens-studio/features/scripting/custom-script-ui
    private debugFloatVar: number = 0.0;
    // [SerializeField] private float floatVar = 0.0f;


    // private sceneObject: SceneObject;


    onAwake() {
        // GameObject equivalent
        this.sceneObject = this.getSceneObject();


        // GetComponent<AudioComponent>() in unity
        const audioComponent = this.sceneObject.getComponent("Component.AudioComponent");


        this.createEvent("OnStartEvent").bind(() => {
            this.onStart();
        })


        // You need to add () => {} so that context is passed
        this.createEvent("UpdateEvent").bind((eventData) => {
            this.onUpdate(eventData);
        });
    }


    private onStart() {
    }


    private onUpdate(eventData: UpdateEvent) {
        // delta t:
        const dt = eventData.getDeltaTime();
    }
}