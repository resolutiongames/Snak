//@input SceneObject snake
//@input bool log

const coroutineModule = require('Coroutine');
const CoroutineManager = coroutineModule.CoroutineManager;
const waitForEndOfFrame = coroutineModule.waitForEndOfFrame;

const coroutineManager = new CoroutineManager(script);

global.spawnManager = {
    // List to store spawned object positions
    spawnedPositions: [],  // To hold the spawn positions

    AddSpawnPosition: function(newPosition) {
        // Store the position to prevent overlap next time
        this.spawnedPositions.push(newPosition);
    },

    RemoveSpawnPosition: function(oldPosition) {
        // Remove old position from the list
        let index = this.spawnedPositions.findIndex(pos => pos.distance(oldPosition) <= 0);
        if (index !== -1) {
            this.spawnedPositions.splice(index, 1);
        }
    },

    distanceBetween: function(pos1, pos2) {
        return pos1.distance(pos2) * global.scale;
    },

    ClearSpawnPositions: function() {
        print("Clearing spawnPositions");
        this.spawnedPositions.length = 0;
    },

    IsValidSpawnPosition: function(newPos, minDistance) {
        // Check distance from snake
        if (this.distanceBetween(newPos, script.snake.getTransform().getWorldPosition()) < 40) {
            return false;
        }

        for (let i = 0; i < this.spawnedPositions.length; i++) {
            if (this.distanceBetween(newPos, this.spawnedPositions[i]) < minDistance) {
                return false; // Too close to another object
            }
        }

        return true; // Valid spawn position
    },

    MoveToRandomPosition: function(objectToMove, minimumSpawnDistance, padding = 80) {
        coroutineManager.startCoroutine(this.MoveToRandomPositionRoutine, objectToMove, minimumSpawnDistance, padding)
    },

    MoveToRandomPositionRoutine : function*(objectToMove, minimumSpawnDistance, padding = 80) {

        spawnManager.RemoveSpawnPosition(objectToMove.getTransform().getLocalPosition());
        objectToMove.getTransform().getSceneObject().enabled = false;

        let validPositionFound = false;
        let position;
        let maxAttempts = 100;
        let attempts = 0;

        while (!validPositionFound && attempts < maxAttempts) {
            position = global.GetRandomPositionWithPadding(padding);
            if (spawnManager.IsValidSpawnPosition(position, minimumSpawnDistance)) {
                validPositionFound = true;
            }
            attempts++;
        }

        if (validPositionFound) {
            objectToMove.getTransform().setLocalPosition(position);
            objectToMove.getTransform().getSceneObject().enabled = true;
            spawnManager.AddSpawnPosition(position);
        } else {
            Log("Max attempts reached — could not place object: " + objectToMove.name);
        }

        return validPositionFound;
    }
};

function Log(message) {
    if(script.log) {
        print(message);
    }
}


