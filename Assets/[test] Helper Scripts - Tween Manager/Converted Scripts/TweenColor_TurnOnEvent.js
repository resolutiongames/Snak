// @input SceneObject sceneObjectReference
// @input string tweenName
// @input bool playAutomatically = true
// @input int loopType = 0 {"widget":"combobox", "values":[{"label":"None", "value":0}, {"label":"Loop", "value":1}, {"label":"Ping Pong", "value":2}, {"label":"Ping Pong Once", "value":3}]}
// @ui {"widget":"separator"}
// @input int movementType = 0 {"widget": "combobox", "values": [{"label": "From / To", "value": 0}, {"label": "To", "value": 1}, {"label":"From", "value": 2}, {"label":"Offset", "value": 3}]}
// @input int colorProperty = 0 {"widget":"combobox", "values":[{"label":"Default", "value":0}, {"label":"Outline (Text Only)", "value":1}, {"label":"Drop Shadow (Text Only)", "value":2}, {"label":"Background (Text Only)", "value":3}]}
// @input vec4 start = {1,1,1,1} {"widget":"color", "showIf":"movementType", "showIfValue":0}
// @input vec4 end = {1,1,1,1} {"widget":"color", "showIf":"movementType", "showIfValue":0}
// @input vec4 to = {1,1,1,1} {"widget":"color", "showIf":"movementType", "showIfValue":1, "label":"End"}
// @input vec4 from = {1,1,1,1} {"widget":"color", "showIf":"movementType", "showIfValue":2, "label":"Start"}
// @input vec4 offset = {1,1,1,1} {"showIf":"movementType", "showIfValue":3}
// @input bool additive {"showIf":"movementType", "showIfValue": 3}
// @ui {"widget":"label", "label":"(Use on Loop)", "showIf": "movementType", "showIfValue": 3}
// @input bool recursive = false
// @input bool ignoreAlpha = false
// @input float time = 1.0
// @input float delay = 0.0
// @ui {"widget":"separator"}
// @input string easingFunction = "Quadratic" {"widget":"combobox", "values":[{"label":"Linear", "value":"Linear"}, {"label":"Quadratic", "value":"Quadratic"}, {"label":"Cubic", "value":"Cubic"}, {"label":"Quartic", "value":"Quartic"}, {"label":"Quintic", "value":"Quintic"}, {"label":"Sinusoidal", "value":"Sinusoidal"}, {"label":"Exponential", "value":"Exponential"}, {"label":"Circular", "value":"Circular"}, {"label":"Elastic", "value":"Elastic"}, {"label":"Back", "value":"Back"}, {"label":"Bounce", "value":"Bounce"}]}
// @input string easingType = "Out" {"widget":"combobox", "values":[{"label":"In", "value":"In"}, {"label":"Out", "value":"Out"}, {"label":"In / Out", "value":"InOut"}]}
script.createEvent("TurnOnEvent").bind(function() { require("TweenColor_wrapped")(script)})