import connection from "../../db/config.js"
import bcrypt from 'bcrypt'

export const register = async (req, resp) => {
    const db = connection
    const { name, email, password, phone, interest } = req.body
    const has_pass = await bcrypt.hash(password, 10)
    console.log("has_pass", has_pass);
    if (!name && !email && !password && !phone && !interest) {
        console.log("all filds are requide");
        return resp.status(500).json({ message: "All Filds are required", success: false })
    }
    const registerSQL = "INSERT INTO users (name,email,password,phone,interest) VALUES (?,?,?,?,?)"
    db.query(registerSQL, [name, email, has_pass, phone, interest], (err, result) => {
        if (err) {
            console.log({ "error": err });
            return resp.status(500).json({ message: "server error", success: false })
        } else {
            console.log("user created");
            resp.status(200).json({ message: "Register Succesfully", success: true })
        }
    })
}

export const login = async (req, resp) => {
    const db = connection
    const { email, password } = req.body
    if (!email && !password) {
        return resp.status(500).json({ message: "email and password must be required" })
    }
    else {
        const checkEmail = "select * from users where email =?"
        db.query(checkEmail, [email], async (err, result) => {
            if (err) {
                console.log("error ", err);
                resp.status(500).json({ message: "user not found", success: false })
            } else {
                console.log("result if email check", result);
                const user = await bcrypt.compare(password, result[0].password)
                console.log("user", user);
                if (!user) {
                    resp.status(401).json({ message: "password is invalid " })
                } else {
                    resp.status(200).json({ message: "login succsussfully", success: true, data: result[0] })
                }


            }
        })
    }

}