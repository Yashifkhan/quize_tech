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

export const oneVsOneQuizeSubmit = (req, resp) => {
    const { matchId, quizId, userId, time, quize_type, questions } = req.body;
    if (!matchId) return resp.status(400).json({ success: false, message: "matchId required" });

    const db = connection;

    const getQuizQuestions = "SELECT * FROM questions WHERE quiz_id = ?";

    db.query(getQuizQuestions, [quizId], (err, result) => {
        if (err) return resp.status(500).json({ success: false, message: "Server error" });

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
            [
                matchId,
                userId,
                totalQuestions,
                correctAnswers,
                totalQuestions - correctAnswers,
                correctAnswers,
                percentage,
                parseInt(time),
                quize_type
            ],
            (err, submissionRes) => {
                if (err) {
                    console.log("Insert error:", err);
                    return resp.status(500).json({ success: false, message: "Insert error" });
                }

                const submissionId = submissionRes.insertId;

                const answersValues = detailedResults.map(r => [
                    submissionId,
                    r.questionId,
                    r.userAnswer,
                    r.correctAnswer,
                    r.isCorrect ? 1 : 0,
                    1
                ]);

                const insertAnswersQuery = `
                    INSERT INTO one_vs_one_question_answers
                    (submission_id, question_id, user_answer, correct_answer, is_correct, time_spent)
                    VALUES ?
                `;

                db.query(insertAnswersQuery, [answersValues], (err2) => {
                    if (err2) {
                        console.log(err2);
                        return resp.status(500).json({ success: false, message: "Answer insert error" });
                    }

                    const checkSubmissions = `
                        SELECT * FROM one_vs_one_submissions 
                        WHERE match_id = ?
                        ORDER BY id ASC
                    `;

                    db.query(checkSubmissions, [matchId], (err3, submissions) => {
                        if (err3)
                            return resp.status(500).json({ success: false, message: "Check failed" });

                        if (submissions.length < 2) {
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

                        const p1 = submissions[0];
                        const p2 = submissions[1];

                        let winnerId = 0;
                        if (p1.score > p2.score) winnerId = p1.user_id;
                        else if (p2.score > p1.score) winnerId = p2.user_id;

                        const updateMatch = `
                            UPDATE one_vs_one_matches
                            SET winner_id = ?, status = 'completed', completed_at = NOW()
                            WHERE id = ?
                        `;

                        db.query(updateMatch, [winnerId, matchId], () => {
                            return resp.status(200).json({
                                success: true,
                                waiting: false,
                                message: "Match completed",
                                matchId,
                                winnerId,
                                results: {
                                    player1: {
                                        userId: p1.user_id,
                                        score: p1.score,
                                        percentage: p1.percentage
                                    },
                                    player2: {
                                        userId: p2.user_id,
                                        score: p2.score,
                                        percentage: p2.percentage
                                    }
                                }
                            });
                        });
                    });
                });
            }
        );
    });
};
