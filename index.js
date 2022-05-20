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
			res.json({ status: "User Not found!"});
		} else {
			res.json(result[0]);
		} 
	});
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
					res.json({ status: "Username already exists!", reason: error.code });
				} else {
					res.json({ status: "success" });
				}
		});
  } catch {
	res.json({ status: "Error" });  
    }
});

app.post("/login", async (req, res) => {
    let user = req.body.username;
    let pass = req.body.password;
    if (user == null || user == '' || pass == ''|| pass == null){
        return res.json({ status: "Please input username and password"});
    } 
  const query = `SELECT * FROM tbuserwaras WHERE username = '${user}'`;
    try {
            pool.query(query, async(error, result)=>{
                if (!result[0]) {  
                    return res.json({ status: "User not found!"});
                }
                if(await bcrypt.compare(pass , result[0].password)) {
                    res.json({ status: "Success", data : result[0]});
                } else {
                    res.json({ status: "Incorrect Username and/or Password!" });
                }
            });
        } catch {
            res.json({status: "Error", reason: 500});
        }
});

app.put("/users/:id", async (req, res)=>{
	let id = req.params.id;
	const hashedPassword = await bcrypt.hash(req.body.password, 10)
	let username = req.body.username;
	let full_name = req.body.full_name;
	let email = req.body.email;
	let password = hashedPassword;
	let telephone = req.body.telephone;
	let date_of_birth = req.body.date_of_birth;
  let updated_at = new Date().toISOString();
	const query = `UPDATE tbuserwaras SET username = '${username}', full_name ='${full_name}', email ='${email}', password ='${password}', telephone= '${telephone}', date_of_birth = '${date_of_birth}', updated_at='${updated_at}' WHERE id = ${id}`;
	const query1 = `SELECT * FROM tbuserwaras WHERE id= ${id}`;
	try {
		pool.query(query1, (error, result)=>{
			if ( result.length == 0 ) {  
				return res.json({ status: "User not found!"});
			}
		pool.query(query, (error, result)=>{
			if(error){
				return res.json({ status: "Username, Full name or Email already exists!", reason: error.code });
			} else {
				res.json({ status: "Update Succes!"});
			}
		})	
		});
	} catch {
		res.json({status: "Error", reason: 500});
	}
});

app.put("/users/:id/password", async (req, res)=>{
	let id = req.params.id;
	const hashedPassword = await bcrypt.hash(req.body.password, 10)
	let password = hashedPassword;
  	let updated_at = new Date().toISOString();
	const data = {
		password: password,
		updated_at: updated_at,
	}
	const query = `UPDATE tbuserwaras SET  password ='${password}', updated_at='${updated_at}' WHERE id = ${id}`;
	const query1 = `SELECT * FROM tbuserwaras WHERE id= ${id}`;
	try {
		pool.query(query1, (error, result)=>{
			if ( result.length == 0 ) {  
				return res.json({ status: "User not found!"});
			} 
		pool.query(query, (error, result)=>{
			res.json({ status: "Update Succes!", data: data});		
		})	
		});
	} catch {
		res.json({status: "Error", reason: 500});
	}
});

app.delete("/users/:id", async (req, res)=>{
	const id = req.params.id
	const query1 = `SELECT * FROM tbuserwaras WHERE id= ${id}`;
	const query = `DELETE FROM tbuserwaras WHERE id= ${id}`;
		try {
			pool.query(query1, (error, result)=>{
				if (result.length == 0) {  
					return res.json({ status: "User not found!"});
				} else {
					pool.query(query, (error, result)=>{
						res.json({ status: "Succes!"});
					})
				}
			});
		} catch {

			res.json({status: "Error", reason: 500});
		}
});
