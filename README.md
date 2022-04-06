# live-drawing

## About
Live drawing is a platform where you can start drawing on a canvas in real time with other users that are in the same room, there is also a chat where you can communicate with them. You will be able to to create a room and send the link to your friends in order to to play with them.   


## Technologies
All the client-side logic is made with vanilla Javascript, using the canvas API. 
Real time communcation is possible thanks to Socket.io
The server is running on NodeJS.
The views are rendered with ejs.
The fill color feature was made working with the pixel that data that canvas offer, applying the [Flood fill algorithm](https://en.wikipedia.org/wiki/Flood_fill).

## Demos
### Simulating multiple real-time users on multiple sessions.
![demo1](https://user-images.githubusercontent.com/44708451/161919672-e23746f4-e7e4-4612-abd6-1b3629711bea.gif)

### Single view.
![demo2](https://user-images.githubusercontent.com/44708451/161919690-da6ab250-5854-454d-981e-014003016d02.gif)
