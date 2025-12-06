import connection from "../db/config.js";

let waitingPlayers = {};  
// Store waiting player based on quiz_id

export const OneVsOne = (io) => {
    console.log("socket function executed");

    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        socket.on("join_1v1", ({ user_id, quiz_id }) => {
            console.log("JOIN:", socket.id, "QUIZ:", quiz_id);

            // If no one waiting for this quiz → add player
            if (!waitingPlayers[quiz_id]) {
                waitingPlayers[quiz_id] = {
                    socket,
                    user_id
                };

                socket.emit("waiting_for_opponent");
                console.log("Player waiting for quiz", quiz_id, ":", socket.id);
                return;
            }

            // Someone already waiting with SAME quiz_id → match
            const playerA = waitingPlayers[quiz_id];  // stored player
            const playerB = { socket, user_id };      // current player

            // Clear waiting
            delete waitingPlayers[quiz_id];

            const roomId = `room_${playerA.socket.id}_${playerB.socket.id}`;

            // both join room
            playerA.socket.join(roomId);
            playerB.socket.join(roomId);

            console.log("Matched in room:", roomId);

            // Send start match
            io.to(roomId).emit("start_match", {
                roomId,
                quiz_id,
                players: [
                    { id: playerA.user_id, socket: playerA.socket.id },
                    { id: playerB.user_id, socket: playerB.socket.id }
                ]
            });
        });
    });
};
