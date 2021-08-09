# Go fishing
Fishing game made with **React.js**, Typescript and Redux.

## Game scenes
Game scenes are called processes.
They:
- are React components that render few/no JSX, and whose job is to add/remove event listeners and process local data relative to this scene, or game scope global data.
- represent an instant in the game where only a set of actions are possible.
- cannot be executed simultaneously. The current scene is set by dispatching the `SET_GAME_PROCESS` action.
- are of type `GameProcessComponent<Props>`

**To add a new process**, add a new property to the interfaces/game.ts/GameProcess enum; create a new GameProcessComponent in Game/processes/MyNewProcess, import it in Game/index.tsx and add a `case MY_NEW_PROCESS_TYPE:` clause to the currentProcess switch. 

## Tutorial
Go fishing provides the player useful instructions on how to play.

### Tutorial entries
A **tutorial entry** represents a group of instructions that explain a particular game scene or situation.
These entries can be easily added using the **LoadTutorial** component.

**To add a new tutorial entry**, add a new property to the interfaces/game.ts/TutorialEntry enum;
`enum TutorialEntry { MY_NEW_TUTORIAL_ENTRY = 'MY_NEW_TUTORIAL_ENTRY }`
Create a new TutorialEntryComponent in Game/tutorial/MY_NEW_TUTORIAL_ENTRY **(it is important to name the file the same way as the enum).
In your new component, return a **<Tutorial />** component

### The Tutorial component
The tutorial component is the default export from Game/tutorial/index.tsx. It marks the provided tutorial entry as completed in redux and localStorage (so that a same tutorial entry cannot be seen twice), and also provides common styles to all tutorial entries. It lets you choose what JSX you want to return with **render props**.
#### Props
##### render
A function that lets you return your own JSX.
Its param is an object of type `EntryProps` that has several properties:
- **modalStyles:** an imported sass style module for if you want to render a modal
- **onComplete** a function that you must execute when this tutorial entry is considered completed.
##### entry
A property of the TutorialEntry enum that this component will mark as completed.
##### afterComplete?
To execute a callback function after tutorial entry was completed, use this optional prop.

### The LoadTutorial component
Checks if provided TutorialEntry is yet to complete. If so, lazy loads corresponding component in Game/tutorial/MY_TUTORIAL_ENTRY.
#### Props
##### entry
A property of the TutorialEntry enum that this component checks.
##### onLoad?
To execute a callback function right after the TutorialEntryComponent was successfully loaded, use this optional prop.
**NB:** when executing a setState function inside this callback, always make a check that the state is not already set, to prevent an infinite render loop. 
##### afterComplete?
To execute a callback function after tutorial entry was completed, use this optional prop. **Do not forget to pass down this prop to the Tutorial component as well:** `<Tutorial afterComplete={afterComplete} />`
##### dependencies?
To require other tutorial entries to be completed before rendering this one, pass this prop. It takes an array of `TutorialEntry` enum properties.
##### fallback?
A ReactNode rendered while TutorialEntryComponent is loading. Defaults to a spinner; to render nothing, use `<LoadTutorial fallback={null} />`