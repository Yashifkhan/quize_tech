import connection from "../../db/config.js";
import Groq from "groq-sdk";

// manully create quize 
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
                console.log("error stage 1",err);
                
                return resp.status(500).json({ message: "server error", success: false ,error:err});
            }

            const catDataId = result.insertId;

            const quizSql = "INSERT INTO quizs (title,category_id,created_by,difficulty) VALUES (?,?,?,?)";
            db.query(quizSql, [quizeData.title, catDataId, quizeData.created_by, quizeData.difficulty],
                (err, result2) => {

                    if (err) {
                        console.log("error stage 2",err);
                        
                        return resp.status(500).json({ message: "server error", success: false,error:err });
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
                                    console.log("error stage 3");
                                    
                                    return resp.status(500).json({ message: "Error inserting question", success: false,error:err });
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

export const genrateQuize=async(req,resp)=>{
      console.log("ai 1 func call");
    //   console.log("req.body",req.body);
      
    const {category, topic, difficulty, count, instructions}=req.body
   

    if(!category || !topic || !difficulty || !count || !instructions){
        return resp.status(500).json({message:"server error",success:false})
    }
    const aiQuestions  = await generateQuestionsWithAI(category, topic, difficulty, count, instructions)
    // console.log("aiQuestions --->>> ",aiQuestions);
    resp.status(201).json({message:"quizs generate with ai ",success:true,data:aiQuestions})

}

// helper function of quize genrate with ai 
const generateQuestionsWithAI=async(category, topic, difficulty, count, instructions)=>{
     const Client = new  Groq({apiKey:process.env.GROQ_API_KEY})

       const prompt = `
Create ${count} MCQ questions.

Category: ${category}
Topic: ${topic}
Difficulty: ${difficulty}

Output JSON only:
[
  {
    "question": "",
    "options": { "a": "", "b": "", "c": "", "d": "" },
    "answer": "a"
  }
]

Rules:
- Output only valid JSON.
- No extra text.
- Answer must be one of: a, b, c, or d.
${instructions ? "Extra instructions: " + instructions : ""}
`;

// console.log("stage 2");
// console.log("avilable modal ",await Client.models.list());

    const resp=await Client.chat.completions.create({
        model:"llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
    })
    // console.log("stage 3");
    
    const data=resp.choices[0].message.content
    // console.log("ai gen quiestion -->>",JSON.parse(data));
    const result=JSON.parse(data)
    return result
    
}

// export const getQuiz = (req, resp) => {
//     const db = connection;
//     const { selectedDiff } = req.params;

//     const categorySQL = "SELECT * FROM category";
//     db.query(categorySQL, (err, categories) => {
//         if (err) {
//             return resp.status(500).json({ message: "server error", success: false });
//         }

//         let quizSQL = "SELECT * FROM quizs";

//         // If NOT "all", filter by difficulty
//         if (selectedDiff !== "all") {
//             quizSQL = `SELECT * FROM quizs WHERE difficulty = '${selectedDiff}'`;
//         }

//         db.query(quizSQL, (err, quizzes) => {
//             if (err) {
//                 return resp.status(500).json({ message: "server error", success: false });
//             }

//             const quizIds = quizzes.map(q => q.id);
//             if (quizIds.length === 0) {
//                 return resp.status(200).json({
//                     message: "no quizzes found",
//                     success: true,
//                     data: []
//                 });
//             }

//             const questionSQL = "SELECT * FROM questions WHERE quiz_id IN (?)";
//             db.query(questionSQL, [quizIds], (err, questions) => {
//                 if (err) {
//                     return resp.status(500).json({ message: "server error", success: false });
//                 }

//                 // Group questions by quiz_id
//                 const groupedQuestions = {};
//                 questions.forEach(q => {
//                     if (!groupedQuestions[q.quiz_id]) {
//                         groupedQuestions[q.quiz_id] = [];
//                     }
//                     groupedQuestions[q.quiz_id].push(q);
//                 });

//                 // Attach questions + category
//                 const finalData = quizzes.map(quiz => ({
//                     ...quiz,
//                     questions: groupedQuestions[quiz.id] || [],
//                     category: categories.filter(c => c.id == quiz.category_id)
//                 }));

//                 return resp.status(200).json({
//                     message: "quizzes fetched successfully",
//                     success: true,
//                     data: finalData
//                 });
//             });
//         });
//     });
// };

// create quize with ai  

export const getQuiz = (req, resp) => {
    const db = connection;
    const { selectedDiff, userId } = req.params;
    const { topic = "all", category = "all", search = "", page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const categorySQL = "SELECT * FROM category";

    db.query(categorySQL, (err, categories) => {
        if (err) return resp.status(500).json({ message: "server error", success: false });

        // ======= BASE FILTER QUERY =======
        let baseFilter = "FROM quizs WHERE 1=1";

        if (selectedDiff !== "all") {
            baseFilter += ` AND difficulty = '${selectedDiff}'`;
        }

        if (category !== "all") {
            const catObj = categories.filter(c => c.category_name === category);
            if (catObj.length > 0) {
                baseFilter += ` AND category_id IN (${catObj.map((cat) => cat.id)})`;
            }
        }

        if (topic !== "all") {
            const topicObj = categories.find(c => c.topic_name === topic);
            if (topicObj) {
                baseFilter += ` AND category_id = ${topicObj.id}`;
            }
        }

        if (search) {
            baseFilter += ` AND title LIKE '%${search}%'`;
        }

        // ======= COUNT QUERY (IMPORTANT FOR PAGINATION) =======
        const countSQL = `SELECT COUNT(*) AS total ${baseFilter}`;

        db.query(countSQL, (err, countResult) => {
            if (err) return resp.status(500).json({ message: "server error", success: false });

            const totalItems = countResult[0].total;
            const totalPages = Math.ceil(totalItems / limit);

            // ======= FINAL FETCH QUERY WITH PAGINATION =======
            const quizSQL = `SELECT * ${baseFilter} LIMIT ${limit} OFFSET ${offset}`;

            db.query(quizSQL, (err, quizzes) => {
                if (err) {
                    return resp.status(500).json({ message: "server error", success: false });
                }

                const quizIds = quizzes.map(q => q.id);
                if (quizIds.length === 0) {
                    return resp.status(200).json({
                        message: "no quizzes found",
                        success: true,
                        data: [],
                        totalItems,
                        totalPages,
                        page: Number(page),
                        limit: Number(limit)
                    });
                }

                const questionSQL = "SELECT * FROM questions WHERE quiz_id IN (?)";
                db.query(questionSQL, [quizIds], (err, questions) => {
                    if (err) return resp.status(500).json({ message: "server error", success: false });

                    const groupedQuestions = {};
                    questions.forEach(q => {
                        if (!groupedQuestions[q.quiz_id]) groupedQuestions[q.quiz_id] = [];
                        groupedQuestions[q.quiz_id].push(q);
                    });

                    const finalData = quizzes.map(quiz => ({
                        ...quiz,
                        questions: groupedQuestions[quiz.id] || [],
                        category: categories.filter(c => c.id == quiz.category_id)
                    }));

                    const attemptQuizSQL = "SELECT quiz_id FROM quiz_attempts WHERE user_id = ?";
                    db.query(attemptQuizSQL, [userId], (err, attemptedRows) => {
                        if (err) return resp.status(500).json({ message: "server error", success: false });

                        const attemptedSet = new Set(attemptedRows.map(row => row.quiz_id));

                        const finalResult = finalData.map(quiz => ({
                            ...quiz,
                            isAttempted: attemptedSet.has(quiz.id)
                        }));

                        return resp.status(200).json({
                            message: "quizzes fetched successfully",
                            success: true,
                            data: finalResult,
                            totalItems,
                            totalPages,
                            page: Number(page),
                            limit: Number(limit)
                        });
                    });
                });
            });
        });
    });
};

export const getAllQuizs = (req, resp) => {
    const db = connection;
    const { selectedDiff } = req.query
    // const selectedDiff="hard"

    const categorySQL = "SELECT * FROM category";
    db.query(categorySQL, (err, categories) => {
        if (err) {
            return resp.status(500).json({ message: "server error", success: false });
        }
console.log("selectedDiff",selectedDiff);

        let quizSQL = "SELECT * FROM quizs";

        // If NOT "all", filter by difficulty
        if (selectedDiff !== "all") {
            quizSQL = `SELECT * FROM quizs WHERE difficulty = '${selectedDiff}'`;
        }

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

                // Attach questions + category
                const finalData = quizzes.map(quiz => ({
                    ...quiz,
                    questions: groupedQuestions[quiz.id] || [],
                    category: categories.filter(c => c.id == quiz.category_id)
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

export const getReAttemptQuiz = (req, resp) => {
    const db = connection;
    const { userId, quizId, selectedReAtteQuiz } = req.params;

    if (!userId || !quizId)
        return resp.status(400).json({ message: "quiz id required", success: false });

    const getQuizIds = "SELECT * FROM quiz_attempts WHERE quiz_id=? AND user_id=?";
    
    db.query(getQuizIds, [quizId, userId], (err, result) => {
        if (err)
            return resp.status(500).json({ message: "server error", success: false, error: err });

        if (result.length === 0)
            return resp.status(404).json({ message: "no attempts found", success: false });

        // ---------------------------
        // SELECT ATTEMPT LOGIC 
        // ---------------------------

        let quiz;

        if (selectedReAtteQuiz === "null" || selectedReAtteQuiz === null) {
            // default → LAST ATTEMPT
            quiz = result[result.length - 1];
        } else {
            // user selected attempt number → return that attempt
            const index = Number(selectedReAtteQuiz);

            if (index < 0 || index >= result.length) {
                return resp.status(400).json({
                    message: "invalid attempt selection",
                    success: false
                });
            }

            quiz = result[index];
        }

        quiz.totalAttempt = result.length;

        // ------------------------------------------
        // 1. FETCH ALL QUESTIONS OF THIS QUIZ
        // ------------------------------------------
        const getQuestionsSQL = "SELECT * FROM questions WHERE quiz_id=? ORDER BY id ASC";

        db.query(getQuestionsSQL, [quizId], (err, questions) => {
            if (err)
                return resp.status(500).json({ message: "questions fetch error", success: false, error: err });

            quiz.questions = questions;   // attach questions to quiz object

            // ------------------------------------------
            // 2. FETCH USER ANSWERS FOR THIS ATTEMPT
            // ------------------------------------------
            const attemptId = quiz.id;
            const sqlAns = "SELECT * FROM quiz_attempt_answers WHERE attempt_id=?";

            db.query(sqlAns, [attemptId], (err, quizAns) => {
                if (err)
                    return resp.status(400).json({ message: "answers not found", success: false, error: err });

                quiz.quizAns = quizAns;

                return resp.status(200).json({
                    message: "re attempt quiz data",
                    success: true,
                    data: quiz
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

export const getQuizCategoryTopicname = (req, resp) => {
    const db = connection
    const sql = "SELECT id ,category_name from category"
    db.query(sql, (err, result) => {
        if (err) return resp.status(500).json({ message: "server eror " })
            const categoryNames=result.map((c)=>c.category_name)
        const uniqeResult= result.filter(
  (item, index, arr) =>
    index === arr.findIndex(x => x.category_name === item.category_name)
);
        
        
        // console.log(result);
        
        // console.log("uniq result",uniqeResult);
        
        resp.status(200).json({ message: "get quize for filter", data: uniqeResult, success: true })
    })
}

// RECOMMENDATION SYSTEM
export const recommendationQuiz = (req, resp) => {
    const db = connection;
    const { userId } = req.params;
    if (!userId) {
        return resp.status(400).json({ message: "userId is required", success: false });
    }
    const userData = { userId };
    // 1. USER INTEREST
    const getUserInterests = "SELECT interest FROM users WHERE id=?";
    db.query(getUserInterests, [userId], (err, interests) => {
        if (err) return resp.status(500).json({ message: "server error", success: false });
        userData.interest = interests[0]?.interest || null;
        // 2. USER AVG ACCURACY
        const getUserAvgAccuracy = `
            SELECT AVG(accuracy) AS avg_accuracy 
            FROM quiz_attempts 
            WHERE user_id=?
        `;

        db.query(getUserAvgAccuracy, [userId], (err, accuracy) => {
            if (err) return resp.status(500).json({ message: "server error", success: false });

            const userAvgAcc = Number(accuracy[0].avg_accuracy || 0).toFixed(2);
            userData.userAvgAcc = userAvgAcc;

            const getSkillLevel = acc => {
                const a = Number(acc);
                if (a < 50) return "beginner";
                if (a < 80) return "medium";
                return "advanced";
            };

            userData.userSkill = getSkillLevel(userAvgAcc);

            // 3. GET USER QUIZ IDs
            const quizIdsSql = "SELECT quiz_id FROM quiz_attempts WHERE user_id=?";
            db.query(quizIdsSql, [userId], (err, result) => {
                if (err) return resp.status(500).json({ message: "server error", success: false });

                const quizIdsList = result.map(q => q.quiz_id);
                if (quizIdsList.length === 0) {
                    return resp.json({
                        message: "No attempts quiz , show beginner quizzes",
                        success: true,
                        // data: [{ category: userData.interest, level: "easy" }]
                    });
                }

                // 4. GET CATEGORY IDs
                const getCatIds = `
                    SELECT id, category_id 
                    FROM quizs 
                    WHERE id IN (?)
                `;

                db.query(getCatIds, [quizIdsList], (err, catRows) => {
                    if (err) return resp.status(500).json({ message: "server error", success: false });

                    // Map QuizID → CategoryID
                    const map = {};
                    catRows.forEach(row => map[row.id] = row.category_id);

                    const finalCategoryIds = quizIdsList.map(qid => map[qid]);

                    // 5. GET CATEGORY NAMES
                    const getCatName = `
                        SELECT id, category_name 
                        FROM category 
                        WHERE id IN (?)
                    `;

                    db.query(getCatName, [finalCategoryIds], (err, catNames) => {
                        if (err) return resp.status(500).json({ message: "server error", success: false });

                        // Map CatID → CatName
                        const nameMap = {};
                        catNames.forEach(row => nameMap[row.id] = row.category_name);

                        // 6. GET ALL USER ATTEMPTS
                        const sqlAttempts = `
                            SELECT quiz_id, accuracy 
                            FROM quiz_attempts 
                            WHERE user_id = ?
                        `;

                        db.query(sqlAttempts, [userId], (err, userAttempts) => {
                            if (err) return resp.status(500).json({ message: "Error", success: false });

                            const categoryStats = {};

                            // Build category stats
                            userAttempts.forEach(attempt => {
                                const qid = attempt.quiz_id;
                                const accuracy = Number(attempt.accuracy);

                                const catId = map[qid];
                                const catName = nameMap[catId];

                                if (!catName) return;

                                if (!categoryStats[catName]) {
                                    categoryStats[catName] = {
                                        attempts: 0,
                                        totalAccuracy: 0
                                    };
                                }

                                categoryStats[catName].attempts++;
                                categoryStats[catName].totalAccuracy += accuracy;
                            });

                            // 7. CLASSIFY TOPICS
                            const topics = {};
                            const strongTopics = [];
                            const mediumTopics = [];
                            const weakTopics = [];

                            Object.keys(categoryStats).forEach(cat => {
                                const d = categoryStats[cat];
                                const avg = d.totalAccuracy / d.attempts;

                                let strength = "";
                                if (avg >= 70) strength = "strong";
                                else if (avg >= 40) strength = "medium";
                                else strength = "weak";

                                topics[cat] = {
                                    attempts: d.attempts,
                                    avgAccuracy: Number(avg.toFixed(2)),
                                    strength
                                };

                                if (strength === "strong") strongTopics.push(cat);
                                if (strength === "medium") mediumTopics.push(cat);
                                if (strength === "weak") weakTopics.push(cat);
                            });

                            userData.topics = topics;
                            userData.strongTopics = strongTopics;
                            userData.mediumTopics = mediumTopics;
                            userData.weakTopics = weakTopics;

                            // 8. FINAL QUIZ RECOMMENDATIONS
                            const getRecommendedQuizzes = userData => {
                                const finalList = [];

                                userData.weakTopics.forEach(t =>
                                    finalList.push({ category: t, level: "easy" })
                                );
                                userData.mediumTopics.forEach(t =>
                                    finalList.push({ category: t, level: "medium" })
                                );
                                userData.strongTopics.forEach(t =>
                                    finalList.push({ category: t, level: "hard" })
                                );

                                return finalList;
                            };
                            const recommended = getRecommendedQuizzes(userData);
                            // console.log("user sent this quize",recommended);
                            const categoryNames=recommended.map((q)=>q.category)
                            const difficultyList=recommended.map((q)=>q.level)                            
                           const getCatIdsSQL = `
    SELECT id, category_name 
    FROM category 
    WHERE category_name IN (?)
`;
db.query(getCatIdsSQL, [categoryNames], (err, catRows) => {
    if (err) return resp.status(500).json({ message: "server error", success:false });

    const conditions = [];

    catRows.forEach(cat => {
        const index = categoryNames.indexOf(cat.category_name);
        if (index !== -1) {
            const diff = difficultyList[index];
            conditions.push(`(category_id = ${cat.id} AND difficulty = '${diff}')`);
        }
    });

    if (conditions.length === 0) {
        return resp.json({
            message: "no matching quizzes",
            success: true,
            data: []
        });
    }

    const finalQuizSQL = `
        SELECT * FROM quizs 
        WHERE ${conditions.join(" OR ")}
    `;

    db.query(finalQuizSQL, (err, quizList) => {
        if (err) {
            console.log(err);
            return resp.status(500).json({ message: "server error", success:false });
        }

        if (quizList.length === 0) {
            return resp.json({
                message: "No quizzes found",
                success: true,
                data: []
            });
        }

        // Extract quiz IDs
        const quizIds = quizList.map(q => q.id);

        const questionSQL = `
            SELECT * FROM questions 
            WHERE quiz_id IN (?)
        `;

        db.query(questionSQL, [quizIds], (err, questionRows) => {
            if (err) {
                console.log(err);
                return resp.status(500).json({ message: "server error", success:false });
            }

            // Group questions by quiz
            const groupedQuestions = {};

            questionRows.forEach(q => {
                if (!groupedQuestions[q.quiz_id]) groupedQuestions[q.quiz_id] = [];
                groupedQuestions[q.quiz_id].push(q);
            });

            // Attach questions to quizzes
            const finalQuizData = quizList.map(q => ({
                ...q,
                questions: groupedQuestions[q.id] || []
            }));

            return resp.json({
                message: "Suggested quizzes",
                success: true,
                data: finalQuizData
            });
        });
    });
});


                            

                        });
                    });
                });
            });


            

        });
    });
};

export const getDashBoardData=(req,resp)=>{
    const db=connection
    console.log("das fun call");
    
    const data={}
    const getUser="select id from users where  NOT role = 'admin'"
    db.query(getUser,(err,result)=>{
        if(err) return resp.status(500).json({message:"server error" ,success:false,error:err})
            console.log("result",result);
        data.users=result.length
        const totalQuiz="select id from quizs"
        db.query(totalQuiz,(err,result)=>{
        if(err) return resp.status(500).json({message:"server error" ,success:false,error:err})
            console.log("total quize",result);
        data.TotalQuizs=result.length
        const mostAttempt="SELECT quiz_id, COUNT(*) AS total_attempts FROM quiz_attempts GROUP BY quiz_id ORDER BY total_attempts DESC LIMIT 1;"
        db.query(mostAttempt,(err ,attempQuiz)=>{
        if(err) return resp.status(500).json({message:"server error" ,success:false,error:err})
            console.log("attempQuiz",attempQuiz);
            
            const quizeID=attempQuiz[0].quiz_id
            const quizeInfo="select title from quizs where id=?"
            db.query(quizeInfo,[quizeID],(err,result)=>{
        if(err) return resp.status(500).json({message:"server error" ,success:false,error:err})
console.log("quize title",result);
        data.mostAttmptQuizs=result[0].title 
        const getTotalAttempts="select id from quiz_attempts"
        db.query(getTotalAttempts,(err,totalAttmp)=>{
                    if(err) return resp.status(500).json({message:"server error" ,success:false,error:err})
console.log("total attempts",totalAttmp);
                    data.totalAttempts=totalAttmp.length

                    
const lastFiveQuizzesQuery = `
  SELECT id, title, difficulty, category_id, created_at
  FROM quizs
  ORDER BY created_at DESC
  LIMIT 5
`;

db.query(lastFiveQuizzesQuery, (err, lastFive) => {
  if (err)
    return resp
      .status(500)
      .json({ message: "server error", success: false, error: err });

  // If no quiz found
  if (lastFive.length === 0) {
    data.lastFiveQuize = [];
    return resp.status(200).json({
      message: "dashboard data",
      success: true,
      data: data,
    });
  }

  // Extract all category_ids
  const catIds = lastFive.map((q) => q.category_id);

  const getCat =
    "SELECT id, category_name, topic_name FROM category WHERE id IN (?)";

  db.query(getCat, [catIds], (err, catRows) => {
    if (err)
      return resp
        .status(500)
        .json({ message: "server error", success: false, error: err });

    // Convert category results to quick lookup object
    const catMap = {};
    catRows.forEach((c) => {
      catMap[c.id] = {
        category_name: c.category_name,
        topic_name: c.topic_name,
      };
    });

    // Merge category data into quizzes
    const finalLastFive = lastFive.map((quiz) => {
      return {
        ...quiz,
        category_name: catMap[quiz.category_id]?.category_name || null,
        topic_name: catMap[quiz.category_id]?.topic_name || null,
      };
    });

    data.lastFiveQuize = finalLastFive;

    return resp.status(200).json({
      message: "dashboard data fetched successfully",
      success: true,
      data: data,
    });
  });
});

        })

            })
        })            

        })
            
        }) 

}


// user interst topic not use and this value in aarray in future  

// own write one by one step 
// (Starting point of recommendation system)
// export const recommendationQuiz=(req,resp)=>{
//     const db=connection
//     const {userId}=req.params
//     if(!userId){
//         return resp.status(400).json({message:"user Id is required",success:false,error:err})
//     }else{
//         const userData={}
//         // console.log("userid",userId);
//         userData.userId=userId
//         const getUserInterests="SELECT interest FROM users WHERE id=?"
//         db.query(getUserInterests,[userId],(err,interests)=>{
//             if(err) return resp.status(500).json({message:"server error",success:false,error:err})
//                 // console.log("interest category ",interests);
//             userData.interest=interests[0].interest
//             const getUserAvgAccuracy="select AVG(accuracy) AS avg_accuracy  from quiz_attempts where user_id=?"
//             db.query(getUserAvgAccuracy,[userId],(err,accuracy)=>{                
//                 if(err) return resp.status(500).json({message:"server error",success:false,error:err})
//                     const userAvgAcc=accuracy[0].avg_accuracy.toFixed(2)
//                 // console.log("user accuracy " ,userAvgAcc);
//                 userData.userAvgAcc=userAvgAcc
//                 const getSkillLavel=(userAvgAcc)=>{
//                     if(userAvgAcc < 50) return "beginer"
//                     else if(userAvgAcc < 80) return "medium";
//                     return "advanced"
//                 }
//                 userData.userSkill=getSkillLavel(userAvgAcc)
//             const quizIds = "SELECT quiz_id FROM quiz_attempts WHERE user_id=?";

// db.query(quizIds, [userId], (err, result) => {
//     if (err) return resp.status(500).json({ message: "server error", success: false });

//     const quizIdsList = result.map(q => q.quiz_id);

//     const getCatIds = "SELECT id, category_id FROM quizs WHERE id IN (?)";
//     db.query(getCatIds, [quizIdsList], (err, catRows) => {
//         if (err) return resp.status(500).json({ message: "server error", success: false });

//         // create map here
//         const map = {};
//         catRows.forEach(row => {
//             map[row.id] = row.category_id;
//         });

//         const finalCategoryIds = quizIdsList.map(qid => map[qid]);

//         const getCatName = "SELECT id, category_name FROM category WHERE id IN (?)";
//         db.query(getCatName, [finalCategoryIds], (err, catNames) => {
//             if (err) return resp.status(500).json({ message: "server error", success: false });

//             // create nameMap here
//             const nameMap = {};
//             catNames.forEach(row => {
//                 nameMap[row.id] = row.category_name;
//             });

//             // NOW run userAttempts query INSIDE this block
//             const sql = `
//                 SELECT quiz_id, accuracy
//                 FROM quiz_attempts
//                 WHERE user_id = ?
//             `;

//             db.query(sql, [userId], (err, userAttempts) => {
//                 if (err) return resp.status(500).json({ message: "Error", success: false });

//                 const categoryStats = {};

//                 userAttempts.forEach(attempt => {
//                     const quizId = attempt.quiz_id;
//                     const accuracy = Number(attempt.accuracy);

//                     // USE map and nameMap safely here
//                     const catId = map[quizId];
//                     const catName = nameMap[catId];

//                     if (!categoryStats[catName]) {
//                         categoryStats[catName] = {
//                             attempts: 0,
//                             totalAccuracy: 0
//                         };
//                     }

//                     categoryStats[catName].attempts += 1;
//                     categoryStats[catName].totalAccuracy += accuracy;
//                 });

//                 const topics = {};
//                 const strongTopics = [];
//                 const mediumTopics = [];
//                 const weakTopics = [];

//                 Object.keys(categoryStats).forEach(cat => {
//                     const data = categoryStats[cat];
//                     const avg = data.totalAccuracy / data.attempts;

//                     let strength = "";
//                     if (avg >= 70) strength = "strong";
//                     else if (avg >= 40) strength = "medium";
//                     else strength = "weak";

//                     topics[cat] = {
//                         attempts: data.attempts,
//                         avgAccuracy: Number(avg.toFixed(2)),
//                         strength
//                     };

//                     if (strength === "strong") strongTopics.push(cat);
//                     if (strength === "medium") mediumTopics.push(cat);
//                     if (strength === "weak") weakTopics.push(cat);
//                 });

//                 userData.topics = topics;
//                 userData.strongTopics = strongTopics;
//                 userData.mediumTopics = mediumTopics;
//                 userData.weakTopics = weakTopics;

//                 console.log("final user com data ",userData);

//                 function getRecommendedQuizzes(userData) {
//     const finalList = [];

//     userData.weakTopics.forEach(topic => {
//         finalList.push({ category: topic, level: "easy" });
//     });

//     userData.mediumTopics.forEach(topic => {
//         finalList.push({ category: topic, level: "medium" });
//     });

//     userData.strongTopics.forEach(topic => {
//         finalList.push({ category: topic, level: "hard" });
//     });

//     return finalList;
// }

                
//             const userShowThisQuizs=getRecommendedQuizzes(userData)
//                 return resp.json({message:"suggested question", success: true, data: userShowThisQuizs });
//             });
//         });
//     });
// });


                    
//             })
                
//         })
        
//     }
// }
