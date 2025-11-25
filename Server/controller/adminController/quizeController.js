import connection from "../../db/config.js";

export const createQuiz = (req, resp) => {
    const db = connection;
    const { catagoryData, quizeData, questionsData } = req.body;

    if (!catagoryData || !quizeData || !questionsData) {
        return resp.status(500).json({ message: "all fields are required", success: false });
    }

    const catagorySql = "INSERT INTO category (category_name,topic_name,description) VALUES (?,?,?)";

    db.query(catagorySql,
        [catagoryData.category_name, catagoryData.topic_name, catagoryData.description],
        (err, result) => {

            if (err) {
                return resp.status(500).json({ message: "server error", success: false });
            }

            const catDataId = result.insertId;

            const quizSql = "INSERT INTO quizs (title,category_id,created_by,difficulty) VALUES (?,?,?,?)";
            db.query(quizSql, [quizeData.title, catDataId, quizeData.created_by, quizeData.difficulty],
                (err, result2) => {

                    if (err) {
                        return resp.status(500).json({ message: "server error", success: false });
                    }

                    const quizId = result2.insertId;

                    const questionSql = `
                INSERT INTO questions 
                (quiz_id, question_text, option_1, option_2, option_3, option_4, correct_option, difficulty, created_by)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

                    let insertedCount = 0;
                    let hasError = false;

                    questionsData.forEach((question) => {
                        db.query(
                            questionSql,
                            [
                                quizId,
                                question.question_text,
                                question.option_1,
                                question.option_2,
                                question.option_3,
                                question.option_4,
                                question.correct_option,
                                question.difficulty,
                                quizeData.created_by
                            ],
                            (err, resultQ) => {

                                if (err && !hasError) {
                                    hasError = true;
                                    return resp.status(500).json({ message: "Error inserting question", success: false });
                                }

                                insertedCount++;

                                // When all questions are inserted, send success response
                                if (insertedCount === questionsData.length && !hasError) {
                                    return resp.status(200).json({ message: "Quiz created successfully", success: true });
                                }
                            }
                        );
                    });
                });
        });
};

export const getQuiz = (req, resp) => {
    const db = connection;
    const categorySQL = "SELECT * FROM category";
    db.query(categorySQL, (err, categories) => {
        if (err) {
            return resp.status(500).json({ message: "server error", success: false });
        }
        const quizSQL = "SELECT * FROM quizs";
        db.query(quizSQL, (err, quizzes) => {
            if (err) {
                return resp.status(500).json({ message: "server error", success: false });
            }
            const quizIds = quizzes.map(q => q.id);

            if (quizIds.length === 0) {
                return resp.status(200).json({
                    message: "no quizzes found",
                    success: true,
                    data: []
                });
            }

            const questionSQL = "SELECT * FROM questions WHERE quiz_id IN (?)";
            db.query(questionSQL, [quizIds], (err, questions) => {
                if (err) {
                    return resp.status(500).json({ message: "server error", success: false });
                }

                // Group questions by quiz_id
                const groupedQuestions = {};
                questions.forEach(q => {
                    if (!groupedQuestions[q.quiz_id]) {
                        groupedQuestions[q.quiz_id] = [];
                    }
                    groupedQuestions[q.quiz_id].push(q);
                });

                // Attach questions to each quiz
                const finalData = quizzes.map(quiz => ({
                    ...quiz,
                    questions: groupedQuestions[quiz.id] || [],
                    category: categories.filter(c => c.id === quiz.category_id)
                }));

                return resp.status(200).json({
                    message: "quizzes fetched successfully",
                    success: true,
                    data: finalData
                });
            });
        });
    });
};

export const updateQuiz = (req, resp) => {
    const db = connection;
    const { quiz_id, catagoryData, quizeData, questionsData } = req.body;

    if (!quiz_id || !catagoryData || !quizeData || !questionsData) {
        return resp.status(400).json({ message: "All fields are required", success: false });
    }

    // 🔹 1️⃣ UPDATE CATEGORY
    const updateCategorySql = `
        UPDATE category
        SET category_name = ?, topic_name = ?, description = ?
        WHERE id = ?
    `;

    db.query(
        updateCategorySql,
        [
            catagoryData.category_name,
            catagoryData.topic_name,
            catagoryData.description,
            catagoryData.id // ✔ correct category id
        ],

        (err) => {
            if (err) {
                console.log("CATEGORY UPDATE ERROR:", err);
                return resp.status(500).json({ message: "Error updating category", success: false });
            }

            // 🔹 2️⃣ UPDATE QUIZ
            const updateQuizSql = `
                UPDATE quizs
                SET title = ?, difficulty = ?, category_id = ?
                WHERE id = ?
            `;

            db.query(
                updateQuizSql,
                [
                    quizeData.title,
                    quizeData.difficulty,
                    catagoryData.id, // ✔ category id must come from category table
                    quiz_id
                ],

                (err) => {
                    if (err) {
                        console.log("QUIZ UPDATE ERROR:", err);
                        return resp.status(500).json({ message: "Error updating quiz", success: false });
                    }

                    // 🔹 3️⃣ QUESTIONS PROCESS (UPDATE + INSERT + DELETE)
                    const updateQ = `
                        UPDATE questions
                        SET question_text=?, option_1=?, option_2=?, option_3=?, option_4=?,
                            correct_option=?, difficulty=?, status=?
                        WHERE id=? AND quiz_id=?
                    `;

                    const insertQ = `
                        INSERT INTO questions
                        (quiz_id, question_text, option_1, option_2, option_3, option_4, correct_option, difficulty, created_by)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `;

                    const deleteQ = `DELETE FROM questions WHERE id=? AND quiz_id=?`;

                    let done = 0;
                    let error = false;

                    // If no questions, return success
                    if (questionsData.length === 0) {
                        return resp.status(200).json({
                            success: true,
                            message: "Quiz updated successfully"
                        });
                    }

                    questionsData.forEach(q => {
                        // 🗑 DELETE QUESTION
                        if (q.delete === true) {
                            db.query(deleteQ, [q.id, quiz_id], callback);
                        }

                        // ✏ UPDATE QUESTION
                        else if (q.id) {
                            db.query(
                                updateQ,
                                [
                                    q.question_text,
                                    q.option_1,
                                    q.option_2,
                                    q.option_3,
                                    q.option_4,
                                    q.correct_option,
                                    q.difficulty,
                                    q.status ?? 1,
                                    q.id,
                                    quiz_id
                                ],
                                callback
                            );
                        }

                        // ➕ INSERT NEW QUESTION
                        else {
                            db.query(
                                insertQ,
                                [
                                    quiz_id,
                                    q.question_text,
                                    q.option_1,
                                    q.option_2,
                                    q.option_3,
                                    q.option_4,
                                    q.correct_option,
                                    q.difficulty,
                                    quizeData.created_by
                                ],
                                callback
                            );
                        }
                    });

                    function callback(err) {
                        if (err && !error) {
                            console.log("QUESTION UPDATE ERROR:", err);
                            error = true;
                            return resp.status(500).json({ message: "Error updating questions", success: false });
                        }

                        done++;
                        if (done === questionsData.length && !error) {
                            return resp.status(200).json({
                                success: true,
                                message: "Quiz updated successfully"
                            });
                        }
                    }
                }
            );
        }
    );
};

// export const submitQuiz=(req,resp)=>{
//     const db=connection
//     const {quizId,userId,time,questions,quize_type}=req.body

//     if(!quizId || !userId || !time || !questions){
//         return resp.status(500).json({message:"all filds are required"})
//     }

//     const quizSql="select * from questions where quiz_id=?"
//     db.query(quizSql,[quizId],(err,org_questions)=>{
//         if (err) return resp.status(500).json({message:"quize id is not valid",success:true})

//        let score = 0;
//        let  total_org_question=org_questions.length
//        let total_user_question=questions.length
//        let wrong_questions=[]

// const orgMap = {};
// for (let oq of org_questions) {
//     orgMap[oq.id] = oq.correct_option;
// }
// for (let uq of questions) {
//     let correct = orgMap[uq.questionId];
//     if (correct && uq.userAns === correct) {
//         score++;
//     }else{
//         console.log("uq-->>>",uq);
//         console.log("correct ans",correct);
//         wrong_questions.push(
//             {
//                 attempt_id:'',
//                 question_id:uq.questionId,
//                 user_answer:uq.userAns,
//                 correct_answer:correct,

//             }
//         )
//     }
// }
// let total_unattempted = total_org_question - total_user_question;

// // time conversion
// let [mins, secs] = time.split(":").map(Number);
// let timeInSeconds = mins * 60 + secs;
// if (timeInSeconds === 0) timeInSeconds = 1;

// // time factor
// let maxTime = 45;
// console.log("time in second",timeInSeconds);

// let timeFactor = (maxTime - timeInSeconds)/maxTime;
// // if (timeFactor > 1) timeFactor = 1;



// // percentage
// let percentage = (score / total_org_question) * 100;

// // accuracy
// let accuracy = percentage*timeFactor

// console.log("accuracy",accuracy);
// // round
// const finalAccuracy = Number(accuracy.toFixed(2));
// percentage = Number(percentage.toFixed(2));
// let rank=1

// let coin=0
// if(score=== total_org_question){
//     if(quize_type === "easy") coin=1
//     else if (quize_type === "midium")  coin=3
//     else coin =5

// }else{
//     coin=0
// }



// const user_overView_score={
//     total_question:total_org_question,
//     unattempt:total_unattempted,
//     attempt:total_user_question,
//     score:score,
//     accuracy:finalAccuracy,
//     time:time,
//     percentage:percentage,
//     rank:rank,
//     coin:coin
// }

// console.log("user_overView_score",user_overView_score);

// resp.status(200).json({message:"user score",success:true ,data:user_overView_score})
// const saveQuize=`insert into quiz_attempts (quiz_id,user_id,rank,score,total_questions,correct_answers,time_taken,total_unattempted,percentage,accuracy)
//  VALUES (?,?,?,?,?,?,?,?,?,?)`
// db.query(saveQuize,[quizId,userId,rank,score,total_org_question,score,time,total_unattempted,percentage,finalAccuracy],(err,result)=>{
//     if(err) return resp.status(500).json({message:"server eror",success:false})
//         const atemptId=result.insertId
//     const question=wrong_questions.map((q)=>q)
//         db.query(`insert into quiz_attempt_answers (attempt_id,question_id,user_answer,correct_answer)
//             values (?,?,?,?)` ,[atemptId,question.questionId,question.userAns,question.correct_answer],(err,result)=>{
//                 if(err)return resp.status(500).json({message:"quize is not submit",success:false})
//                 const updateCoin="update coin users where id=?"
//             db.query(updateCoin,[,userId,coin],(err,result)=>{
//                 if(err) return resp({message:"quize not submit",success:false})
//                     return resp.status(200).json({message:"quize are submited",success:true,data:user_overView_score})

//             })    

//             })
// })
//     })




// }


export const submitQuiz = async (req, resp) => {
    const db = connection;
    const { quizId, userId, time, questions, quize_type } = req.body;
    if (!quizId || !userId || !time || !questions) {
        return resp.status(400).json({ message: "All fields are required", success: false });
    }

    const quizSql = "SELECT * FROM questions WHERE quiz_id = ?";
    db.query(quizSql, [quizId], async (err, org_questions) => {
        if (err) return resp.status(500).json({ message: "Server error", success: false });
        if (org_questions.length === 0) return resp.status(404).json({ message: "Quiz not found", success: false });

        let score = 0;
        let total_org_question = org_questions.length;
        let total_user_question = questions.length;
        let wrong_questions = [];

        // Create map for quick lookup
        const orgMap = {};
        for (let oq of org_questions) {
            orgMap[oq.id] = oq.correct_option;
        }
        // Check answers
        for (let uq of questions) {
            let correct = orgMap[uq.questionId];
            if (correct && uq.userAns === correct) {
                score++;
            } else {
                wrong_questions.push({
                    question_id: uq.questionId,
                    user_answer: uq.userAns || null,
                    correct_answer: correct
                });
            }
        }

        let total_unattempted = total_org_question - total_user_question;

        // Time conversion
        let [mins, secs] = time.split(":").map(Number);
        let timeInSeconds = mins * 60 + secs;
        if (timeInSeconds === 0) timeInSeconds = 1;

        // Time factor calculation (ensure it's between 0 and 1)
        let maxTime = 45;
        let timeFactor = Math.max(0, Math.min(1, (maxTime - timeInSeconds) / maxTime));

        // Percentage
        let percentage = (score / total_org_question) * 100;

        // Accuracy
        let accuracy = percentage * timeFactor;

        // Round values
        const finalAccuracy = Number(accuracy.toFixed(2));
        const finalPercentage = Number(percentage.toFixed(2));

        // Rank (you may want to implement proper ranking logic)
        let rank = await calculateUserRank(resp, score, time)

        // Coin calculation
        let coin = 0;
        if (score === total_org_question) {
            if (quize_type === "easy") coin = 1;
            else if (quize_type === "medium") coin = 3;
            else coin = 5;
        }

        const user_overView_score = {
            quizId: quizId,
            userId: userId,
            total_question: total_org_question,
            unattempt: total_unattempted,
            attempt: total_user_question,
            score: score,
            accuracy: finalAccuracy,
            time: time,
            percentage: finalPercentage,
            rank: rank,
            coin: coin
        };

        // Insert quiz attempt
        const saveQuizSql = `INSERT INTO quiz_attempts 
            (quiz_id, user_id, rank, score, total_questions, correct_answers, time_taken, total_unattempted, percentage, accuracy)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        db.query(saveQuizSql, [quizId, userId, rank, score, total_org_question, score, time, total_unattempted, finalPercentage, finalAccuracy], (err, result) => {
            if (err) return resp.status(500).json({ message: "Failed to save quiz attempt", success: false });
            const attemptId = result.insertId;
            // Insert ALL attempted questions (both correct and wrong answers)
            if (questions.length > 0) {
                const insertAnswersSql = `INSERT INTO quiz_attempt_answers (attempt_id, question_id, user_answer, correct_answer) VALUES ?`;
                // Map all questions with their answers
                const answersValues = questions.map(q => [
                    attemptId,
                    q.questionId,
                    q.userAns || null,
                    orgMap[q.questionId]
                ]);

                db.query(insertAnswersSql, [answersValues], (err) => {
                    if (err) {
                        console.error("Error inserting answers:", err);
                        return resp.status(500).json({
                            message: "Quiz saved but failed to save answers",
                            success: false
                        });
                    }

                    console.log(`Inserted ${answersValues.length} answers for attempt_id: ${attemptId}`);

                    // Update user coins
                    updateUserCoins(db, userId, coin, resp, user_overView_score);
                });
            } else {
                // No questions attempted, proceed to update coins
                updateUserCoins(db, userId, coin, resp, user_overView_score);
            }
        }
        );
    });
};

// Helper function to update coins
function updateUserCoins(db, userId, coin, resp, user_overView_score) {
    if (coin > 0) {
        const updateCoinSql = "UPDATE users SET coins = coins + ? WHERE id = ?";

        db.query(updateCoinSql, [coin, userId], (err) => {
            if (err) {
                console.error("Error updating coins:", err);
                return resp.status(500).json({
                    message: "Quiz saved but failed to update coins",
                    success: false
                });
            }

            return resp.status(200).json({
                message: "Quiz submitted successfully",
                success: true,
                data: user_overView_score
            });
        });
    } else {
        // No coins to update
        return resp.status(200).json({
            message: "Quiz submitted successfully",
            success: true,
            data: user_overView_score
        });
    }
}

// calculate the user Rank 
const calculateUserRank = (resp, score, time) => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT score, time_taken
            FROM quiz_attempts
            ORDER BY score DESC, time_taken ASC
        `;

        connection.query(sql, (err, result) => {
            if (err) return reject(err);

            console.log("result", result);

            // ➤ FIX: Add current user data if it's not present
            if (!result.find(u => u.score == score && u.time_taken == time)) {
                result.push({ score, time_taken: time });
            }

            // Assign rank
            const ranked = result
                .sort((a, b) => {
                    if (b.score !== a.score) return b.score - a.score;
                    return a.time_taken.localeCompare(b.time_taken);
                })
                .map((u, index) => ({
                    ...u,
                    rank: index + 1
                }));

            console.log("score", score);
            console.log("time", time);
            console.log("ranked", ranked);

            // Find rank of current user
            const myRank = ranked.find(u =>
                u.score == score &&
                u.time_taken == time
            );

            console.log("myRank", myRank);

            resolve(myRank ? myRank.rank : null);
        });
    });
};

export const reviewQuiz = (req, resp) => {
    const db = connection
    const { userId, quizId } = req.params
    if (!userId && !quizId) {
        resp.status(400).json({ message: "id is required" })
    } else {
        const getQuizData = "select id from quiz_attempts where quiz_id=? AND user_id=?"
        db.query(getQuizData, [quizId, userId], (err, quizAttemptId) => {
            if (err) return resp.status(400).json({ message: "quize is not found", success: false })
            console.log("quizAttemptId", quizAttemptId);
            const quiz = quizAttemptId[quizAttemptId.length - 1]
            if (quiz?.id) {
                const sql = "select * from quiz_attempt_answers where attempt_id=?"
                db.query(sql, [quiz.id], (err, quizAns) => {
                    if (err) return resp.status(400).json({ message: "quiz is not found", success: false, error: err })
                    return resp.status(200).json({ message: "quize data", success: true, data: quizAns })

                })
            }


        })
    }
}