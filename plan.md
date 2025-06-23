Race Condition When Joining a Room: There's a race condition in the handleJoinRoom function. If two players try to join a room with one spot left at the same time, they can both pass the check that verifies if the room is full. This could lead to one player being unexpectedly kicked out when the second player's request overwrites theirs.

No "New Game" Option: Once a game is over (win, lose, or draw), there is no way for the players in the same room to start a new game. They have to abandon the room and create a new one, which is not a great user experience.

State Desynchronization on Reconnect: The app uses Supabase subscriptions to receive real-time updates. However, if a user loses their connection and then reconnects, they won't get the current state of the game; they will only receive new updates from that point forward. This can leave their game board in a stale, incorrect state.

Stats Aren't Updated on Game End: The handleClick function determines the winner and ends the game, but it doesn't update the global win/loss/draw statistics. The stats are only loaded when the component mounts and there's a manual "Reset Stats" button, but they are not incremented automatically when a game finishes.
