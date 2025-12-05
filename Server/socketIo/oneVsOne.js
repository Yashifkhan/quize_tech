import connection from "../db/config.js";

export const OneVsOne = (io) => {
    console.log("socket function executed");
    
    io.on("connection", (socket) => {
        console.log("Socket connected :", socket.id);
        
        socket.on("join_1v1", () => {
            console.log("JOIN_1V1 RECEIVED FROM:", socket.id);
            socket.emit("waiting_for_opponent");
        });
  })
};
