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

const pool = mysql.createPool({
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	socketPath: process.env.INSTANCE_CONNECTION_NAME,
});

//GET USER ALL DATA
app.get("/users", async (req, res)=>{
	const query = "SELECT * FROM tbuserwaras";
 	pool.query(query, (error, result)=>{
		res.json(result); 
	});
});

//GET DIAGNOSE ALL DATA
app.get("/diagnoses", async (req, res)=>{
	const query = "SELECT * FROM tbdiagnose";
 	pool.query(query, (error, result)=>{
		res.json(result); 
	});
});

//GET USER DATA BY ID
app.get("/users/:id", async (req, res)=>{
	const query = "SELECT * FROM tbuserwaras WHERE id= ?";
	pool.query(query, [req.params.id], (error, result)=>{
		if (!result[0]) {
			res.json({status: "Error", message: "User Not found!"});
		} else {
			res.json(result[0]);
		} 
	});
});

//GET DIAGNOSE DATA BY ID
app.get("/diagnoses/:id", async (req, res)=>{
	const query = "SELECT * FROM tbdiagnose WHERE id_diagnose= ?";
	pool.query(query, [req.params.id], (error, result)=>{
		if (!result[0]) {
			res.json({status: "Error", message: "User Not found!"});
		} else {
			res.json(result[0]);
		} 
	});
});

//POST REGISTER DATA TO DB
app.post("/register", async (req, res)=>{
	try {
		const hashedPassword = await bcrypt.hash(req.query.password, 10)
		const created_at = new Date().toISOString();
  		const updatedAt = created_at;
		const data = {
			username: req.query.username,
			full_name: req.query.full_name,
			email: req.query.email,
			password: hashedPassword,
			telephone: req.query.telephone,
			date_of_birth: req.query.date_of_birth,
			created_at: created_at,
			updated_at: updatedAt,
		}
		const query1 = "INSERT INTO tbuserwaras ( username, full_name,  email, password, telephone, date_of_birth, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
		pool.query(query1, Object.values(data), (error)=>{
				if (error){
						res.json({status: "Error", message : "Username and/or Email already exists!" });
				} else {
						res.json({status: "Success", message : "User Created!" });
				}
		});
	  } catch {
		res.json({ status: "Error" });  
	  }
});

//VALIDATE LOGIN
app.post("/login", async (req, res) => {
		const username = req.query.username
		const password = req.query.password
		if (username == null || username == '' || password == ''|| password == null){
			return res.json({ status: "Error", message: "Please input username and/or password!"});
		} 
	 	 const query1 = `SELECT * FROM tbuserwaras WHERE username = '${username}'`;
		try {
			pool.query(query1, async(error, result)=>{
				if (!result[0]) {  
					return res.json({status: "Error", message: "User Not found!"});
				}
				if(await bcrypt.compare(password , result[0].password)) {
					res.json({status: "Success", data : result[0]});
				} else {
					res.json({status: "Error", message: "Incorrect Username and/or Password!"});
				}
			});
		} catch {
			res.json({status: "Error", reason: 500});
		}
});

//VALIDATE PASSWORD 
app.post("/users/changePassword", async (req, res) => {
	const username = req.query.username
	const password = req.query.password
	if (username == null || username == '' || password == ''|| password == null){
		return res.json({status: "Error", message: "Please input username and/or password"});
	} 
	const query1 = `SELECT * FROM tbuserwaras WHERE username = '${username}'`;
	try {
		pool.query(query1, async(error, result)=>{
			console.log(result)
			if (!result[0]) {  
				return res.json({status: "Error", message: "User Not found!"});
			}
			if(await bcrypt.compare(password , result[0].password)) {
				res.json({ status: "Success"});
			} else {
				res.json({ status: "Error", message : "Incorrect Password!"});
			}
			});
	} catch {
		res.json({status: "Error", reason: 500});
	}
});

//VALIDATE EMAIL
app.post("/email", async (req, res) => {
	const email = req.query.email
	if (email == null || email == ''){
		return res.json({ status: "Error", message: "Please input email!"});
	} 
	const query1 = `SELECT * FROM tbuserwaras WHERE email = '${email}'`;
	try {
		pool.query(query1, async(error, result)=>{
			if (!result[0]) {  
				return res.json({status: "Error", message: "User Not found!"});
			} else {
				res.json({ status: "Success", data : result[0]});
			}
		});
	} catch {
		res.json({status: "Error", reason: 500});
	}
});

//POST DIAGNOSE DATA TO DB
app.post("/diagnoses", async (req, res)=>{
	try {
		const created_at = new Date().toISOString();
		const data = {
			umur: req.query.umur,
			gender: req.query.gender,
			demam: req.query.demam,
			batuk: req.query.batuk,
			kelelahan: req.query.kelelahan,
			sakit_tenggorokan: req.query.sakit_tenggorokan,
			pilek: req.query.pilek,
			sesak_napas: req.query.sesak_napas,
			muntah: req.query.muntah,
			lama_hari_sembuh: req.query.lama_hari_sembuh,
			created_at: created_at,
			id_user: req.query.id_user,
		}
		const query1 = "INSERT INTO tbdiagnose (umur, gender, demam, batuk, kelelahan, sakit_tenggorokan, pilek, sesak_napas, muntah, lama_hari_sembuh, created_at, id_user) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
		pool.query(query1, Object.values(data), (error)=>{
			if (error){
				res.json({status: "Error", message : "Please fill correctly!"});
			} else {
				res.json({status: "Success", message : "Diagnose Created!" });
			}
		});
  } catch {
	res.json({ status: "Error" });  
    }
});

//UPDATE PASSWORD TO DB
app.put("/users/changePassword", async (req, res)=>{
	const username = req.query.username
	const hashedPassword = await bcrypt.hash(req.query.password, 10)
	let password = hashedPassword;
 	 let updated_at = new Date().toISOString();
	const query1 = `UPDATE tbuserwaras SET password ='${password}', updated_at='${updated_at}' WHERE username = '${username}'`;
	const query2 = `SELECT * FROM tbuserwaras WHERE username = '${username}'`;
	try {
		pool.query(query2, (error, result)=>{
			if (!result[0]) {  
				return res.json({status: "Error", message: "User Not found!"});
			}	
		pool.query(query1, (error, result)=>{
			res.json({status: "Succes", message: "Update Succes!"});		
		})	
		});
	} catch {
		res.json({status: "Error", reason: 500});
	}
});

//UPDATE ALL DATA TO DB
app.put("/users/:id", async (req, res)=>{
	let id = req.params.id;
	const hashedPassword = await bcrypt.hash(req.query.password, 10)
	let username = req.query.username;
	let full_name = req.query.full_name;
	let email = req.query.email;
	let password = hashedPassword;
	let telephone = req.query.telephone;
	let date_of_birth = req.query.date_of_birth;
	let updated_at = new Date().toISOString();
	const query1 = `UPDATE tbuserwaras SET username = '${username}', full_name ='${full_name}', email ='${email}', password ='${password}', telephone= '${telephone}', date_of_birth = '${date_of_birth}', updated_at='${updated_at}' WHERE id = ${id}`;
	const query2 = `SELECT * FROM tbuserwaras WHERE id= ${id}`;
	try {
		pool.query(query2, (error, result)=>{
			if (!result.length) {  
				return res.json({status: "Error", message: "User Not found!"});
			}
		pool.query(query1, (error, result)=>{
			if(error){
				return res.json({status: "Error", message: "Username, Full name or Email already exists!", reason: error.code });
			} else {
				res.json({status: "Succes", message: "Update Succes!"});
			}
		})	
		});
	} catch {
		res.json({status: "Error", reason: 500});
	}
});


//DELETE USER DATA FROM DB
app.delete("/users/:id", async (req, res)=>{
	const id = req.params.id
	const query1 = `SELECT * FROM tbuserwaras WHERE id= ${id}`;
	const query = `DELETE FROM tbuserwaras WHERE id= ${id}`;
		try {
			pool.query(query1, (error, result)=>{
				if (!result.length) {  
					return res.json({status: "Error", message: "User Not found!"});
				} else {
					pool.query(query, (error, result)=>{
						res.json({status: "Succes!"});
					})
				}
			});
		} catch {
			res.json({status: "Error", reason: 500});
		}
});
