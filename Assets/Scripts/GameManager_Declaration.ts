export interface GameManager extends ScriptComponent {
    SetPlayAreaWorldCenter: (zValue) => void;
    GetPlayAreaWorldCenter: () => vec3;
    SavePlayAreaWorldCenter: () => void;
    StartGame: () => void;
}