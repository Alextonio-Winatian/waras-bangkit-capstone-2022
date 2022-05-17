const express = require("express")
const mysql = require("mysql")
const app = express();

app.use(express.json());

const port = process.env.port || 8080;
app.listen(port, ()=>{
	console.log(`Waras REST API listening on port ${port}`);
});

app.get("/", async (req, res)=> {
	res.json({ status: "Waras APP READY!!"})
});

app.get("/:tbuserwaras", async (req, res)=>{
	const query = "SELECT * FROM tbuserwaras WHERE name= ?";
	pool.query(query, [req.params.tbuserwaras], (error, result)=>{
		if (!result[0]) {
			res.json({ status: "Not found!"});
		} else {
			req.json(result[0]);
		} 
	});
});

const pool = mysql.createPool({
	user: "root",
	password: "war140522",
	database: "dbwaras",
	socketPath: "/cloudsql/db-capstone-waras:asia-southeast2:waras-sql",
});

app.post("/", async (req, res)=>{
	const data = {
		username: req.body.username,
		full_name: req.body.full_name,
		email: req.body.email,
		password: req.body.password,
		telephone: req.body.telephone,
		date_of_birth: req.body.date_of_birth,
		created_at: req.body.created_at,
		updated_at: req.body.updated_at,
	}
	const query = "INSERT INTO breeds VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
	pool.query(query, Object.values(data), (error)=>{
		if (error){
			res.json({ status: "failure", reason: error.code });
		} else {
			res.json({ status: "success", data: data });
		}
	});
});
