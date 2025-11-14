import connection from "../../db/config.js";

export const createQuiz = (req, resp) => {
    const db = connection
    console.log("create quize function is executed");
    const { catagoryData, quizeData, questionsData } = req.body
    if (!catagoryData || !quizeData || !questionsData) {
        return resp.status(500).json({ message: "all filds are required", success: false })
    }
    const catagorySql = "INSERT INTO category (category_name,topic_name,description) VALUES (?,?,?)"

    db.query(catagorySql, [catagoryData.category_name, catagoryData.topic_name, catagoryData.description], (err, result) => {
        if (err) {
            return resp.status(500).json({ message: "server error", success: false })
        }else{
            console.log("category table data insert successfully",result);
            const catDataId=result?.insertId
            const quizesql="INSERT INTO quizs (title,category_id,created_by,difficulty) VALUES (?,?,?,?)"
            db.query(quizesql,[quizeData.title,catDataId,4,quizeData.difficulty],(err,result2)=>{
                if(err){
                    console.log("error 2",err);
                    
                     return resp.status(500).json({message:"server error",success:false})
                }else{
                  console.log("quize table data insert successfully",result2);
                  const quizId=result2?.insertId
                    const questionSql=`INSERT INTO  questions (quiz_id,question_text,option_1,option_2,option_3,option_4,correct_option,difficulty,created_by) 
                    VALUES (?,?,?,?,?,?,?,?,?) `
                    db.query(questionSql,[quizId,questionsData.question_text,questionsData.option_1,questionsData.option_2,
                        questionsData.option_3,questionsData.option_4,questionsData.correct_option,questionsData.difficulty,4],(err,result)=>{
                            if(err){
                                console.log("error3",err);
                                
                                return resp.status(500).json({message:"server eror",success:false})
                            }else{
                                resp.status(200).json({message:'quiz create successfully',success:true})
                            }
                        })
                }
            })
            
        }
    })




}