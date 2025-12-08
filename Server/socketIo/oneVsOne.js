import connection from "../db/config.js";

let waitingPlayers = {};
// Store waiting player based on quiz_id

export const OneVsOne = (io) => {
    io.on("connection", (socket) => {
        socket.on("join_1v1", async ({ user_id, quiz_id }) => {
            if (!waitingPlayers[quiz_id]) {
                waitingPlayers[quiz_id] = {
                    socket,
                    user_id
                };
                socket.emit("waiting_for_opponent");
                console.log("Player waiting for quiz", quiz_id, ":", socket.id);
                return;
            }
            
            const playerA = waitingPlayers[quiz_id]; 
            const playerB = { socket, user_id };     

            delete waitingPlayers[quiz_id];

            const roomId = `room_${playerA.socket.id}_${playerB.socket.id}`;

            // both join room
            playerA.socket.join(roomId);
            playerB.socket.join(roomId);

            console.log("Matched in room:", roomId);
            connection.query("SELECT quiz_time from quizs where id= ?", [quiz_id], (err, result) => {
                if (err) {
                    console.log("DB Error:", err);
                    return;
                } console.log("result of get quize time", result);

                const quizTimeString = result[0]?.quiz_time || "00:30:00";

                const [hours, minutes, seconds] = quizTimeString.split(":").map(Number);

                const totalSeconds = hours * 3600 + minutes * 60 + seconds;

                const quizTime = totalSeconds;

                io.to(roomId).emit("start_match", {
                    roomId,
                    quiz_id,
                    quiz_time: quizTime,
                    players: [
                        { id: playerA.user_id, socket: playerA.socket.id },
                        { id: playerB.user_id, socket: playerB.socket.id }
                    ]
                });
            })
        });
    });
};


export const oneVsOneQuizeSubmit=(req,resp)=>{
    const {quizId,userId,time,quize_type,questions}=req.body
    console.log("quizId",quizId);
    console.log("userId",userId);
    console.log("time",time);
    console.log("quize_type",quize_type);
    console.log("questions",questions);
    const db=connection

    const getQuizQuestions="SELECT * FROM questions where quiz_id=?"
    db.query(getQuizQuestions,[quizId],(err,result)=>{
        if(err) return resp.status(500).json({message:"server error ",success:false})
            console.log("result of get quiz",result);
    })
    
    
    
    
    


}