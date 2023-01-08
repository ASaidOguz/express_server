
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
var pg=require('pg')
const bcrypt=require('bcryptjs')
app.use(express.json())
require('dotenv').config()
var conString=process.env.CONSTRING
var client= new pg.Client(conString)
const jwt=require('jsonwebtoken')
//Initilazing the database 
client.connect(function(err){
  if(err){
    return console.log("could not connect postgres!",err)
  }
})

app.use(cors())


/* app.post("/login",(req, res) => {
 

  
) */


app.post("/register",async(req,res)=>{
  
  try {
    const hashedpassword=await bcrypt.hash(req.body.password,10)
    console.log("hashed password:",hashedpassword)
    const user={ id:Date.now().toString(),name:req.body.name,hashedpassword:hashedpassword}
    //users.push(user)
    WritingUsers(user)
    const jwt=generateToken(user)
    res.status(200).send({jwt:jwt});
    //res.redirect("/login")
  } catch (error) {
    console.log(error)
    res.redirect("/register")
  }
  
})




app.get('/getarchive',authanticateToken,(req, res) => {
 client.query('SELECT * FROM blockchain_table', (error, result) => {
    if (error) {
      console.error('Error querying the database: ' + error.stack);
      res.status(500).send({ error: 'Error querying the database' });
      return;
    }
    res.send(result.rows);
  });
});

app.post("/send",(req, res) => {
  console.log("Req body:",req.body.chain)
  const { chain,address, arbiter, beneficiary,value,isApproved } = req.body;
  let amount=value
  console.log(`POST values:,
  Chain:${chain},
  Contract address:${address},
  arbiter:${arbiter},
  beneficiary:${beneficiary},
  value:${amount}
  isApproved:${isApproved}`)
  const sql='INSERT INTO blockchain_table (chain,contract_address,arbiter,beneficiary,amount,isApproved) VALUES ($1, $2,$3,$4,$5,$6)';
  const values = [chain,address,arbiter,beneficiary,amount,isApproved];
  client.query(sql, values, (error, result) => {
    if (error) {
      console.error('Error inserting into the database: ' + error.stack);
      res.status(500).send({ error: 'Error inserting into the database' });
      return;
    }
    res.send({ success: true });
  });
});



 async function WritingUsers(user){
  const{id,name,hashedpassword}=user
  const sql='INSERT INTO users (id,name,hashedpassword) VALUES ($1, $2,$3)';
  const values=[id,name,hashedpassword]
  client.query(sql,values,(error,result)=>{
    if(error){
      console.error('Error inserting into the database: ' + error.stack);
     
      return;
    }
    
  })
}





app.post("/updateapprove",(req, res,next) => {
  
  const { address } = req.body;
  console.log(`POST values:,
  Contract address:${address},`)
  const sql='UPDATE "blockchain_table" SET "isapproved"=$1 where "contract_address"=$2';
  const values = [true,address];
  client.query(sql, values, (error, result) => {
    if (error) {
      console.error('Error inserting into the database: ' + error.stack);
      res.status(500).send({ error: 'Error inserting into the database' });
      return;
    }
    res.send({ success: true }); 
  });
});

async function getUserByName(name){
   const sql='SELECT * FROM users where "name"=$1';
   const value=[name]
   
    return client.query(sql,value)
    .then(result=>{
      return result.rows[0]
    })
    .catch(err=>console.log(err))
      
    //Whats the difference between these 2 query types ??????? Check down below !!!
      
      
           /*   (error,result)=>{
    if(error){
      console.log("Error in getting the value by name",error)
      return
    }
    console.log("User:",result.rows[0])
    return result.rows[0]
   }) */
}

async function getUserById(id){
  const sql='SELECT * FROM users where "id"=$1';
  const value=[id]
  return client.query(sql,value).then(result=>{
       return result.rows[0]
    })
    .catch(err=>console.log(err))
    
    /* ,(error,result)=>{
    if(error){
      console.log("Error getting user by Id",error)
    }
    console.log("By id:",result.rows[0])
    return result.rows[0]
  }) */
}


function authanticateToken(req,res,next){
  const authHeader=req.headers['authorization']

  const token=authHeader&&authHeader.split(' ')[1]

  if(token==null) return res.sendStatus(401)

  jwt.verify(token,process.env.ACCESS_SECRET_TOKEN,(err,user)=>{
      if(err) return res.sendStatus(403)
      req.user=user
      next()
  })
}

function generateToken(user){
  return  acces_token=jwt.sign(user,process.env.ACCESS_SECRET_TOKEN)
}



app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
