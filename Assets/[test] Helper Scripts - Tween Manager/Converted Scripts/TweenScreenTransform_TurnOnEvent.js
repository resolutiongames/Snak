// @input SceneObject sceneObjectReference
// @input string tweenName
// @input bool playAutomatically = true
// @input int loopType = 0 {"widget":"combobox", "values":[{"label":"None", "value":0}, {"label":"Loop", "value":1}, {"label":"Ping Pong", "value":2}, {"label":"Ping Pong Once", "value":3}]}
// @ui {"widget":"separator"}
// @input int type = 0 {"widget":"combobox", "values":[{"label":"Position", "value":0}, {"label":"Scale", "value":1}, {"label":"Rotation", "value":2}, {"label":"Anchors", "value":3}, {"label":"Offsets", "value":4}]}
// @input int movementType = 0 {"widget": "combobox", "values": [{"label": "From / To", "value": 0}, {"label": "To", "value": 1}, {"label":"From", "value": 2}, {"label":"Offset", "value": 3}]}
// @input int anchorsParam = 0 {"label" : "Rect Parameter", "widget":"combobox", "values":[{"label":"Bounds", "value":0}, {"label":"Size", "value":1}, {"label":"Center", "value":2}], "showIf": "type", "showIfValue": 3}
// @input int offsetsParam = 0 {"label" : "Rect Parameter", "widget":"combobox", "values":[{"label":"Bounds", "value":0}, {"label":"Size", "value":1}, {"label":"Center", "value":2}], "showIf": "type", "showIfValue": 4}
// @ui {"widget":"separator"}
// @ui {"widget" : "label", "label" : "Start Value:", "showIf": "movementType", "showIfValue": 0}
// @ui {"widget" : "label", "label" : "To Value:", "showIf": "movementType", "showIfValue": 1}
// @ui {"widget" : "label", "label" : "From Value:", "showIf": "movementType", "showIfValue": 2}
// @ui {"widget" : "label", "label" : "Offset Value:", "showIf": "movementType", "showIfValue": 3}
// @input vec3 startPosition = {0, 0, 0} {"showIf": "type", "showIfValue": 0, "label": "    Position"}
// @input vec3 startScale = {1, 1, 1} {"showIf": "type", "showIfValue": 1, "label": "    Scale"}
// @input float startRotation = 0 {"showIf": "type", "showIfValue": 2, "label": "    Rotation"}
// @ui {"widget":"group_start", "label":"Rectangle Parameters", "showIf": "type", "showIfValue": 3}
// @input vec4 startAnchorsBounds = {-1, 1, -1, 1}   {"label": "Bounds",  "showIf": "anchorsParam", "showIfValue": 0}
// @input vec2 startAnchorsSize = {1, 1}   {"label": "Size",  "showIf": "anchorsParam", "showIfValue": 1}
// @input vec2 startAnchorsCenter = {0, 0}   {"label": "Center",  "showIf": "anchorsParam", "showIfValue": 2}
// @ui {"widget":"group_end"}
// @ui {"widget":"group_start", "label":"Rectangle Parameters", "showIf": "type", "showIfValue": 4}
// @input vec4 startOffsetsBounds = {-1, 1, -1, 1}   {"label": "Bounds",  "showIf": "offsetsParam", "showIfValue": 0}
// @input vec2 startOffsetsSize = {1, 1}   {"label": "Size",  "showIf": "offsetsParam", "showIfValue": 1}
// @input vec2 startOffsetsCenter = {0, 0}   {"label": "Center",  "showIf": "offsetsParam", "showIfValue": 2}
// @ui {"widget":"group_end"}
// @ui {"widget":"group_start", "label":"End Value:", "showIf": "movementType", "showIfValue": 0}
// @input vec3 endPosition = {0, 0, 0} {"showIf": "type", "showIfValue": 0, "label": "Position"}
// @input vec3 endScale = {1, 1, 1} {"showIf": "type", "showIfValue": 1, "label": "Scale"}
// @input float endRotation = 0 {"showIf": "type", "showIfValue": 2, "label": "Rotation"}
// @ui {"widget":"group_start", "label":"Rectangle Parameters", "showIf": "type", "showIfValue": 3}
// @input vec4 endAnchorsBounds = {-1, 1, -1, 1}   {"label": "Bounds",  "showIf": "anchorsParam", "showIfValue": 0}
// @input vec2 endAnchorsSize = {2, 2} {"label": "Size",  "showIf": "anchorsParam", "showIfValue": 1}
// @input vec2 endAnchorsCenter = {0, 0}  {"label": "Center",  "showIf": "anchorsParam", "showIfValue": 2}
// @ui {"widget":"group_end"}
// @ui {"widget":"group_start", "label":"Rectangle Parameters", "showIf": "type", "showIfValue": 4}
// @input vec4 endOffsetsBounds = {-1, 1, -1, 1}  {"label": "Bounds",  "showIf": "offsetsParam", "showIfValue": 0}
// @input vec2 endOffsetsSize = {2, 2}  {"label": "Size",  "showIf": "offsetsParam", "showIfValue": 1}
// @input vec2 endOffsetsCenter = {0, 0}   {"label": "Center",  "showIf": "offsetsParam", "showIfValue": 2}
// @ui {"widget":"group_end"}
// @ui {"widget":"group_end"}
// @ui {"widget":"separator"}
// @input bool additive {"showIf":"movementType", "showIfValue": 3}
// @ui {"widget":"label", "label":"(Use on Loop)", "showIf": "movementType", "showIfValue": 3}
// @input float time = 1.0
// @input float delay = 0.0
// @ui {"widget":"separator"}
// @input string easingFunction = "Quadratic" {"widget":"combobox", "values":[{"label":"Linear", "value":"Linear"}, {"label":"Quadratic", "value":"Quadratic"}, {"label":"Cubic", "value":"Cubic"}, {"label":"Quartic", "value":"Quartic"}, {"label":"Quintic", "value":"Quintic"}, {"label":"Sinusoidal", "value":"Sinusoidal"}, {"label":"Exponential", "value":"Exponential"}, {"label":"Circular", "value":"Circular"}, {"label":"Elastic", "value":"Elastic"}, {"label":"Back", "value":"Back"}, {"label":"Bounce", "value":"Bounce"}]}
// @input string easingType = "Out" {"widget":"combobox", "values":[{"label":"In", "value":"In"}, {"label":"Out", "value":"Out"}, {"label":"In / Out", "value":"InOut"}]}
script.createEvent("TurnOnEvent").bind(function() { require("TweenScreenTransform_wrapped")(script)})