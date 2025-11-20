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

export const submitQuiz=(req,resp)=>{
    const db=connection
    const {quizId,userId,time,questions}=req.body

    console.log("quizId",quizId);
    console.log("userId",userId);
    console.log("time",time);
    console.log("questions",questions);

    if(!quizId || !userId || !time || !questions){
        return resp.status(500).json({message:"all filds are required"})
    }

    const quizSql="select * from questions where quiz_id=?"
    db.query(quizSql,[quizId],(err,org_questions)=>{
        if (err) return resp.status(500).json({message:"quize id is not valid",success:true})
            console.log("org question",org_questions);
            
    })
    
    
    
    
}
