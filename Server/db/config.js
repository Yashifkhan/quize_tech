import mysql from 'mysql'
const connection=mysql.createConnection({
    host:"localhost",
    user:"root",
    database:"quizetech",
    password:"",
})

connection.connect((err)=>{
    if(err){
        console.log("db is not connect");
        
    }else{
        console.log("DB is connected");
        
    }
})

export default connection