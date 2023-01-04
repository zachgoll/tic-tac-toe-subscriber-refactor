This file walks through the steps required to build a tic tac toe game in a generic fashion. Each example implementation will follow the concepts outlined here, but depending on the library (or lack thereof) used, the implementation will look different. In other words, the Vanilla JS implementation will look different than the React implementation, but the core design will remain the same.

## Designing the Game State

One of the first considerations to make when building a new project is the "state" of the application.

### State concepts

When we talk about "state", this can reference many different things. In larger web applications, there are _generally_ two primary types of state:

1. **Client state** - This keeps track of user interactions in the browser. For example, if using Amazon, the user might add some search filters, toggle open a navigation menu, or click "next" to go to the next page of results. These are all examples of "client state".
2. **Database state** - This describes what data is stored in the DB at a point in time. Various user actions can change the database state. For example, if a user purchases an item on Amazon, that item will be stored in some sort of `orders` table in a database so that when a user logs in on another device, we can show them their past orders.

In larger web applications, keeping client and DB state in-sync is important and often facilitated via external state management libraries and/or query libraries (like [react-query](https://react-query-v3.tanstack.com/)).

### Tic Tac Toe State

In the context of a browser-based tic tac toe game, **we don't need a backend database**, so all we need to deal with is client-side state. This simplifies things a lot since we do not need to design a database model, which would add several additional steps.

There are many possible ways to approach this, but in efforts to replicate the existing subscriber code provided in the `/original` folder, I have identified a few pieces of state that we will need to keep track of.

- Scoreboard - keeps track of how many times a player has won the game
- Game - keeps track of the currently active game state

As you will see in the types below, `Scoreboard` can be _derived_ from a list of `Game` results, so we call this "derived state". When designing your state objects, it is usually best-practice to avoid storing "derived state", which will become more clear after reading through the example applications I have built.

Below is a brief outline of our "Game State". I have used TypeScript types to show this, but please note that not all of the examples use TypeScript.

```ts
// ------------
// SUPPORTING TYPES - these are not stored directly and are "helper" types we use to build the game state.
// -----------.

type Player = {
  id: number;
  name: string;
};

type Move = {
  playerId: number; // who made the move
  squareId: number; // from 1-9, represents square on game board
};

type Game = {
  player1: Player;
  player2: Player;
  moves: Move[];
};

// ---------------
// GAME STATE - the type below represents the state object we will keep in local storage
// ---------------

// We can derive various game statistics based on a list of Game objects
type GameState = {
  active: Game; // The current, in-progress game
  round: Game[]; // A list of games in the current "round" (for scorekeeping)
  history: Game[]; // A complete history of games played
};
```

The state design above will be stored in local storage so that results are persisted across browser refreshes. Additionally, since local storage is available across browser tabs, each player can have their own browser tab to play from.

## Application Logic and Design

### Vanilla JS Refactor

When building a game like Tic Tac Toe, it is generally a good idea to follow an MV\* design pattern, which is a variation of MVC (Model, View, Controller) and simply means, "Model, View, Whatever". This just means that in your app, you'll have one or more "models" that represent the data (like `Player`, `Move`, and `Game` as shown in the prior section), one or more "views" that are responsible for rendering the models to the browser, and finally, _something_ that ties the two together. Typically, this is called a "Controller", but depending on the library (i.e. React, Vue) you're using, you'll be following slightly different paradigms and this concept is not always useful.

If you really want to understand the MVC pattern, I suggest building (or reading through) a basic [Ruby on Rails application](https://rubyonrails.org/), which is a framework that strictly follows the MVC pattern.

For our purposes, we will be using the MV\* pattern loosely and it's primary purpose is to encourage a nice _separation of concerns_. It won't be perfect.

As you read through the files, here are the _rough_ assignments of responsibility:

- `app.js` - a small file that ties everything together and renders the UI
- `store.js` - the "Model" of MV\* that is responsible for saving and retrieving the current game state
- `view.js` - the "View" of MV\* that is responsible for manipulating DOM elements based on changes in state.
- `utils.js` - miscellaneous helper functions (no specific responsibility)

### Vanilla TypeScript, Alpine.js and React.js Refactors

I will not be spending much time explaining these as they are not the primary focus of the tutorial. That said, I have built them out as a reference for those who are interested in seeing the progression from vanilla => React.

I suggest reading through the code where I have left comments to explain non-obvious and/or important things.
