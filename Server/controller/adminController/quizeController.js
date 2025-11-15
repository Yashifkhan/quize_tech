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


export const getQuiz=(req,resp)=>{
    const db=connection
    const categorySQL="SELECT * FROM category"
    const quizeSQL="SELECT * FROM quizs"
    const questionSQl="SELECT * FROM questions"
    db.query(categorySQL,(err,result)=>{
        if(err){
            return resp.status(500).json({message:"sesrver error ",success:false})
        }else{
            const quizeSQL="SELECT * FROM quizs"
            db.query(quizeSQL,(err,quizResult)=>{
                if(err){
                    return resp.status(500).json({message:"server error",success:false})
                }
                else{
                    console.log("quizResult",quizResult);
                    const quizeIds=quizResult.map((q)=>q.id)
                      const questionSQl="SELECT * FROM questions where quiz_id=?"
                      db.query(questionSQl,[quizeIds],(err,questioResult)=>{
                        if(err){
                            resp.status(500).json({message:"server error",success:false})
                        }else{
                            resp.status(200).json({message:"quize are get succesfully",success:true,data:{question:questioResult,quize:quizResult,category:result}})
                        }
                      })
                    
                    

                }
            }
        )

        }
    })

}