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
            
            connection.query("SELECT quiz_time from quizs where id = ?", [quiz_id], (err, result) => {
                if (err) {
                    console.log("DB Error:", err);
                    return;
                }
                
                const quizTimeString = result[0]?.quiz_time || "00:30:00";
                const [hours, minutes, seconds] = quizTimeString.split(":").map(Number);
                const totalSeconds = hours * 3600 + minutes * 60 + seconds;
                const quizTime = totalSeconds;

                // ✅ FIXED: Use SET syntax which is more reliable
                const createMatch = `
                    INSERT INTO one_vs_one_matches 
                    SET room_id = ?,
                        quiz_id = ?,
                        player1_id = ?,
                        player2_id = ?,
                        status = 'pending',
                        created_at = NOW()
                `;
                
                connection.query(createMatch, [roomId, quiz_id, playerA.user_id, playerB.user_id], (err, matchResult) => {
                    if (err) {
                        console.log("Match creation error:", err);
                        return;
                    }
                    
                    const matchId = matchResult.insertId;
                    
                    console.log("✅ Match created with ID:", matchId);

                    io.to(roomId).emit("start_match", {
                        roomId,
                        matchId,
                        quiz_id,
                        quiz_time: quizTime,
                        players: [
                            { id: playerA.user_id, socket: playerA.socket.id },
                            { id: playerB.user_id, socket: playerB.socket.id }
                        ]
                    });
                });
            });
        });
    });
};




export const oneVsOneQuizeSubmit = (req, resp) => {
    const { matchId, quizId, userId, time, quize_type, questions } = req.body;
    
    console.log("📝 Quiz submission received:", { matchId, userId, quizId });
    
    if (!matchId) return resp.status(400).json({ success: false, message: "matchId required" });
    if (!userId) return resp.status(400).json({ success: false, message: "userId required" });
    
    const db = connection;
    const getQuizQuestions = "SELECT * FROM questions WHERE quiz_id = ?";
    
    db.query(getQuizQuestions, [quizId], (err, result) => {
        if (err) {
            console.error("❌ Error fetching questions:", err);
            return resp.status(500).json({ success: false, message: "Server error" });
        }
        
        let correctAnswers = 0;
        const totalQuestions = questions.length;
        const detailedResults = questions.map(q => {
            const dbQ = result.find(d => d.id === q.questionId);
            if (!dbQ) return null;
            const isCorrect = q.userAns === dbQ.correct_option;
            if (isCorrect) correctAnswers++;
            return {
                questionId: q.questionId,
                questionText: dbQ.question_text,
                userAnswer: q.userAns,
                correctAnswer: dbQ.correct_option,
                isCorrect
            };
        }).filter(Boolean);

        const percentage = (correctAnswers / totalQuestions) * 100;

        const insertSubmission = `
            INSERT INTO one_vs_one_submissions
            (match_id, user_id, total_questions, correct_answers, wrong_answers, score, percentage, time_spent_total, quiz_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            insertSubmission,
            [matchId, userId, totalQuestions, correctAnswers, totalQuestions - correctAnswers, correctAnswers, percentage, parseInt(time), quize_type],
            (err, submissionRes) => {
                if (err) {
                    console.error("❌ Insert submission error:", err);
                    return resp.status(500).json({ success: false, message: "Insert error" });
                }
                
                const submissionId = submissionRes.insertId;
                console.log("✅ Submission saved with ID:", submissionId);
                
                const answersValues = detailedResults.map(r => [
                    submissionId, r.questionId, r.userAnswer, r.correctAnswer, r.isCorrect ? 1 : 0, 1
                ]);

                const insertAnswersQuery = `
                    INSERT INTO one_vs_one_question_answers 
                    (submission_id, question_id, user_answer, correct_answer, is_correct, time_spent) 
                    VALUES ?
                `;
                
                db.query(insertAnswersQuery, [answersValues], (err2) => {
                    if (err2) {
                        console.error("❌ Insert answers error:", err2);
                        return resp.status(500).json({ success: false, message: "Answer insert error" });
                    }
                    
                    console.log("✅ Answers saved");
                    
                    const checkSubmissions = `
                        SELECT * FROM one_vs_one_submissions 
                        WHERE match_id = ?
                        ORDER BY id ASC
                    `;
                    
                    db.query(checkSubmissions, [matchId], (err3, submissions) => {
                        if (err3) {
                            console.error("❌ Check submissions error:", err3);
                            return resp.status(500).json({ success: false, message: "Check failed" });
                        }
                        
                        console.log(`📊 Total submissions for match ${matchId}:`, submissions.length);
                        
                        if (submissions.length < 2) {
                            console.log("⏳ Waiting for second player...");
                            return resp.status(200).json({
                                success: true,
                                waiting: true,
                                message: "Your submission saved. Waiting for opponent.",
                                yourResult: {
                                    totalQuestions,
                                    correctAnswers,
                                    wrongAnswers: totalQuestions - correctAnswers,
                                    score: correctAnswers,
                                    percentage,
                                    detailedResults
                                }
                            });
                        }

                        // ✅ BOTH USERS SUBMITTED
                        console.log("🎮 Both players submitted! Calculating winner...");
                        
                        const p1 = submissions[0];
const p2 = submissions[1];

let winnerId = null;

if (p1.score > p2.score) {
    winnerId = p1.user_id;
} else if (p2.score > p1.score) {
    winnerId = p2.user_id;
} else {
    winnerId = "match Draw";
}

console.log("🏆 Winner ID:", winnerId || "Draw");

const updateMatch = `
    UPDATE one_vs_one_matches
    SET winner_id = ?, status = 'completed', completed_at = NOW()
    WHERE id = ?
`;

db.query(updateMatch, [winnerId, matchId], (updateErr) => {
    if (updateErr) {
        console.error("❌ Update match error:", updateErr);
        return resp.status(500).json({ success: false, message: "Update failed" });
    }

    console.log("✅ Match updated to completed");

    const getRoomId = "SELECT room_id FROM one_vs_one_matches WHERE room_id = ?";

    console.log("matchId -->>>", matchId);

    db.query(getRoomId, [matchId], (err4, matchData) => {
        if (err4) {
            console.error("❌ Room fetch error:", err4);
            return resp.status(500).json({ success: false, message: "Room fetch failed" });
        }

        console.log("matchData -->>", matchData);

        if (!matchData || matchData.length === 0) {
            console.error("❌ No match found with ID:", matchId);
            return resp.status(500).json({ success: false, message: "Match not found" });
        }

        if (!matchData[0].room_id) {
            console.error("❌ Room ID is null for match:", matchId);
            return resp.status(500).json({ success: false, message: "Room ID not found" });
        }

        const roomId = matchData[0].room_id;
        console.log("🚪 Room ID found:", roomId);

        const resultsData = {
            success: true,
            waiting: false,
            message: "Match completed",
            matchId,
            winnerId,
            isDraw: winnerId === null,
            results: {
                player1: {
                    userId: p1.user_id,
                    score: p1.score,
                    percentage: p1.percentage,
                    correctAnswers: p1.correct_answers,
                    wrongAnswers: p1.wrong_answers,
                    timeSpent: p1.time_spent_total,
                    user: null         // will fill after user fetch
                },
                player2: {
                    userId: p2.user_id,
                    score: p2.score,
                    percentage: p2.percentage,
                    correctAnswers: p2.correct_answers,
                    wrongAnswers: p2.wrong_answers,
                    timeSpent: p2.time_spent_total,
                    user: null         // will fill after user fetch
                }
            }
        };

        // ✔ FIXED USER FETCH LOGIC
        const userIds = submissions.map((u) => u.user_id);  // [p1Id, p2Id]

        const getUserData = "SELECT id, name, email, phone,coins FROM users WHERE id IN (?, ?)";

        db.query(getUserData, userIds, (errUser, userResult) => {
            if (errUser) {
                console.error("❌ User fetch error:", errUser);
                return resp.status(500).json({ message: "User fetch failed", success: false });
            }

            console.log("Fetched Users:", userResult);

            const player1User = userResult.find((u) => u.id === p1.user_id);
            const player2User = userResult.find((u) => u.id === p2.user_id);

            resultsData.results.player1.user = player1User || null;
            resultsData.results.player2.user = player2User || null;

            console.log("🧍 Player1 User:", player1User);
            console.log("🧍 Player2 User:", player2User);

            // SEND RESULTS TO ROOM
            const io = req.app.get("io");
            if (!io) {
                console.error("❌ Socket.io instance not found!");
                return resp.status(500).json({ success: false, message: "Socket not initialized" });
            }

            console.log("📢 Emitting 'match_completed' to room:", roomId);
            io.to(roomId).emit("match_completed", resultsData);

            console.log("✅ Results sent to both players");
            return resp.status(200).json(resultsData);
        });
    });
});

                    });
                });
            }
        );
    });
};


// export const oneVsOneQuizeSubmit = (req, resp) => {
//     const { matchId, quizId, userId, time, quize_type, questions } = req.body;
    
//     console.log("📝 Quiz submission received:", { matchId, userId, quizId });
    
//     if (!matchId) return resp.status(400).json({ success: false, message: "matchId required" });
//     if (!userId) return resp.status(400).json({ success: false, message: "userId required" });
    
//     const db = connection;
//     const getQuizQuestions = "SELECT * FROM questions WHERE quiz_id = ?";
    
//     db.query(getQuizQuestions, [quizId], (err, result) => {
//         if (err) {
//             console.error("❌ Error fetching questions:", err);
//             return resp.status(500).json({ success: false, message: "Server error" });
//         }
        
//         let correctAnswers = 0;
//         const totalQuestions = questions.length;
//         const detailedResults = questions.map(q => {
//             const dbQ = result.find(d => d.id === q.questionId);
//             if (!dbQ) return null;
//             const isCorrect = q.userAns === dbQ.correct_option;
//             if (isCorrect) correctAnswers++;
//             return {
//                 questionId: q.questionId,
//                 questionText: dbQ.question_text,
//                 userAnswer: q.userAns,
//                 correctAnswer: dbQ.correct_option,
//                 isCorrect
//             };
//         }).filter(Boolean);

//         const percentage = (correctAnswers / totalQuestions) * 100;

//         const insertSubmission = `
//             INSERT INTO one_vs_one_submissions
//             (match_id, user_id, total_questions, correct_answers, wrong_answers, score, percentage, time_spent_total, quiz_type)
//             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
//         `;

//         db.query(
//             insertSubmission,
//             [matchId, userId, totalQuestions, correctAnswers, totalQuestions - correctAnswers, correctAnswers, percentage, parseInt(time), quize_type],
//             (err, submissionRes) => {
//                 if (err) {
//                     console.error("❌ Insert submission error:", err);
//                     return resp.status(500).json({ success: false, message: "Insert error" });
//                 }
                
//                 const submissionId = submissionRes.insertId;
//                 console.log("✅ Submission saved with ID:", submissionId);
                
//                 const answersValues = detailedResults.map(r => [
//                     submissionId, r.questionId, r.userAnswer, r.correctAnswer, r.isCorrect ? 1 : 0, 1
//                 ]);

//                 const insertAnswersQuery = `
//                     INSERT INTO one_vs_one_question_answers 
//                     (submission_id, question_id, user_answer, correct_answer, is_correct, time_spent) 
//                     VALUES ?
//                 `;
                
//                 db.query(insertAnswersQuery, [answersValues], (err2) => {
//                     if (err2) {
//                         console.error("❌ Insert answers error:", err2);
//                         return resp.status(500).json({ success: false, message: "Answer insert error" });
//                     }
                    
//                     console.log("✅ Answers saved");
                    
//                     const checkSubmissions = `
//                         SELECT * FROM one_vs_one_submissions 
//                         WHERE match_id = ?
//                         ORDER BY id ASC
//                     `;
                    
//                     db.query(checkSubmissions, [matchId], (err3, submissions) => {
//                         if (err3) {
//                             console.error("❌ Check submissions error:", err3);
//                             return resp.status(500).json({ success: false, message: "Check failed" });
//                         }
                        
//                         console.log(`📊 Total submissions for match ${matchId}:`, submissions.length);
                        
//                         if (submissions.length < 2) {
//                             console.log("⏳ Waiting for second player...");
//                             return resp.status(200).json({
//                                 success: true,
//                                 waiting: true,
//                                 message: "Your submission saved. Waiting for opponent.",
//                                 yourResult: {
//                                     totalQuestions,
//                                     correctAnswers,
//                                     wrongAnswers: totalQuestions - correctAnswers,
//                                     score: correctAnswers,
//                                     percentage,
//                                     detailedResults
//                                 }
//                             });
//                         }

//                         // ✅ BOTH USERS SUBMITTED
//                         console.log("🎮 Both players submitted! Calculating winner...");
                        
//                         const p1 = submissions[0];
// const p2 = submissions[1];

// let winnerId = null;

// if (p1.score > p2.score) {
//     winnerId = p1.user_id;
// } else if (p2.score > p1.score) {
//     winnerId = p2.user_id;
// } else {
//     winnerId = "match Draw";
// }

// console.log("🏆 Winner ID:", winnerId || "Draw");

// const updateMatch = `
//     UPDATE one_vs_one_matches
//     SET winner_id = ?, status = 'completed', completed_at = NOW()
//     WHERE id = ?
// `;

// db.query(updateMatch, [winnerId, matchId], (updateErr) => {
//     if (updateErr) {
//         console.error("❌ Update match error:", updateErr);
//         return resp.status(500).json({ success: false, message: "Update failed" });
//     }

//     console.log("✅ Match updated to completed");

//     const getRoomId = "SELECT room_id FROM one_vs_one_matches WHERE room_id = ?";

//     console.log("matchId -->>>", matchId);

//     db.query(getRoomId, [matchId], (err4, matchData) => {
//         if (err4) {
//             console.error("❌ Room fetch error:", err4);
//             return resp.status(500).json({ success: false, message: "Room fetch failed" });
//         }

//         console.log("matchData -->>", matchData);

//         if (!matchData || matchData.length === 0) {
//             console.error("❌ No match found with ID:", matchId);
//             return resp.status(500).json({ success: false, message: "Match not found" });
//         }

//         if (!matchData[0].room_id) {
//             console.error("❌ Room ID is null for match:", matchId);
//             return resp.status(500).json({ success: false, message: "Room ID not found" });
//         }

//         const roomId = matchData[0].room_id;
//         console.log("🚪 Room ID found:", roomId);

//         const resultsData = {
//             success: true,
//             waiting: false,
//             message: "Match completed",
//             matchId,
//             winnerId,
//             isDraw: winnerId === null,
//             results: {
//                 player1: {
//                     userId: p1.user_id,
//                     score: p1.score,
//                     percentage: p1.percentage,
//                     correctAnswers: p1.correct_answers,
//                     wrongAnswers: p1.wrong_answers,
//                     timeSpent: p1.time_spent_total,
//                     user: null         // will fill after user fetch
//                 },
//                 player2: {
//                     userId: p2.user_id,
//                     score: p2.score,
//                     percentage: p2.percentage,
//                     correctAnswers: p2.correct_answers,
//                     wrongAnswers: p2.wrong_answers,
//                     timeSpent: p2.time_spent_total,
//                     user: null         // will fill after user fetch
//                 }
//             }
//         };

//         // ✔ FIXED USER FETCH LOGIC
//         const userIds = submissions.map((u) => u.user_id);  // [p1Id, p2Id]

//         const getUserData = "SELECT id, name, email, phone,coins FROM users WHERE id IN (?, ?)";

//         db.query(getUserData, userIds, (errUser, userResult) => {
//             if (errUser) {
//                 console.error("❌ User fetch error:", errUser);
//                 return resp.status(500).json({ message: "User fetch failed", success: false });
//             }

//             console.log("Fetched Users:", userResult);

//             const player1User = userResult.find((u) => u.id === p1.user_id);
//             const player2User = userResult.find((u) => u.id === p2.user_id);

//             resultsData.results.player1.user = player1User || null;
//             resultsData.results.player2.user = player2User || null;

//             console.log("🧍 Player1 User:", player1User);
//             console.log("🧍 Player2 User:", player2User);

//             // SEND RESULTS TO ROOM
//             const io = req.app.get("io");
//             if (!io) {
//                 console.error("❌ Socket.io instance not found!");
//                 return resp.status(500).json({ success: false, message: "Socket not initialized" });
//             }

//             console.log("📢 Emitting 'match_completed' to room:", roomId);
//             io.to(roomId).emit("match_completed", resultsData);

//             console.log("✅ Results sent to both players");
//             return resp.status(200).json(resultsData);
//         });
//     });
// });

//                     });
//                 });
//             }
//         );
//     });
// };