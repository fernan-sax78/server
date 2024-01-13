import { io } from "./utils/socketServer.js";
import { server } from "./app.js";
import { IP_SERVER , DB_PASSWORD, DB_USER, HOST,  PORT } from "./constants.js";
import mongoose from "mongoose";



const mongoDbURL = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@${HOST}/?retryWrites=true&w=majority`;
mongoose.connect(mongoDbURL)
.then(
    server.listen(PORT , () => {
    console.log('####################');
    console.log('##### API REST #####');
    console.log('####################');
    console.log(`http://${IP_SERVER}:${PORT}/api`);

    io.sockets.on("connection", (socket) => {
        console.log('USER CONNECTED');

       socket.on("disconnect" , () => {
        console.log('USER DISCONNECTED');
       }) 

       socket.on("subscribe" , (room) => {
        socket.join(room);
       })

       socket.on("unsubscribe", (room) => {
        socket.leave(room);
      })
    })
  }))
.catch(error => console.log(error));


