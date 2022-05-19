const express = require("express")
const mysql = require("mysql")
const bcrypt = require("bcrypt")

const app = express();

app.use(express.json());

const port = process.env.port || 8080;
app.listen(port, ()=>{
	console.log(`Waras REST API listening on port ${port}`);
});

app.get("/", async (req, res)=> {
	res.json({ status: "Waras APP READY!!"})
});

app.get("/users", async (req, res)=>{
	const query = "SELECT * FROM tbuserwaras";
	pool.query(query, (error, result)=>{
		res.json(result);
	});
});

app.get("/users/:id", async (req, res)=>{
	const query = "SELECT * FROM tbuserwaras WHERE id= ?";
	pool.query(query, [req.params.id], (error, result)=>{
		if (!result[0]) {
			res.json({ status: "Not found!"});
		} else {
			res.json(result[0]);
		} 
	});
});

const pool = mysql.createPool({
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	socketPath: process.env.INSTANCE_CONNECTION_NAME,
});

app.post("/register", async (req, res)=>{
	try {
	const hashedPassword = await bcrypt.hash(req.body.password, 10)
	const created_at = new Date().toISOString();
    	const updatedAt = created_at;
	const data = {
		username: req.body.username,
		full_name: req.body.full_name,
		email: req.body.email,
		password: hashedPassword,
		telephone: req.body.telephone,
		date_of_birth: req.body.date_of_birth,
		created_at: created_at,
		updated_at: updatedAt,
	}
	//DATABASE
	const query = "INSERT INTO tbuserwaras ( username, full_name,  email, password, telephone, date_of_birth, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
	pool.query(query, Object.values(data), (error)=>{
	if (error){
		res.json({ status: "failure", reason: error.code });
	} else {
		res.json({ status: "success", data: data });
	}
	});
  } catch {
    res.json({ status: error.code });  
    }
});

app.post('/login', async (req, res) => {
	let username = req.body.username;
	let password = req.body.password;
	const query = `SELECT * FROM tbuserwaras WHERE username = '${username}'`;
	try {
	pool.query(query, async(error, result)=>{
		if (result == null) {  
			res.json({ status: "User not found!", reason: error.code});
		}
	if(await bcrypt.compare(password, result[0].password)) {
		res.json({ status: "Success"});
	} else {
		res.json({ status: "Incorrect Username and/or Password!" });
	}
	});
} catch {
res.json({status: "Please enter Username and Password!", reason: 500});
}
});
