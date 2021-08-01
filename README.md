# Go fishing
Fishing game made with **React.js**, Typescript and Redux.

## Game scenes
Game scenes are called processes.
They:
- are React components that render few/no JSX, and whose job is to add/remove event listeners and process local data relative to this scene, or game scope global data.
- represent an instant in the game where only a set of actions are possible.
- cannot be executed simultaneously. The current scene is set by calling the `setCurrentProcess(NEW_PROCESS)` method.