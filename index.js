
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const flash=require('express-flash')
const session=require('express-session')
var pg=require('pg')
const bcrypt=require('bcrypt')
require('dotenv').config()
const initializePassport=require('./passport-config');
const passport = require("passport");




var conString=process.env.CONSTRING
var client= new pg.Client(conString)
//Initilazing the database 
client.connect(function(err){
  if(err){
    return console.log("could not connect postgres!",err)
  }
})

//Initialize the passport for auth checks 
initializePassport(passport,
 name=> getUserByName(name),
  id=>getUserById(id)
  )

//Adding cors origin and setting credentials true to receiving connection...  
app.use(cors({ 
  origin:["http://localhost:3000","https:/vercel.com/dashboard"],//<== location of the react app we r connecting!!
  credentials:true
}));
app.use(express.json());
app.use(flash())
app.use(session({
  secret:process.env.SESSION_SECRET,
  resave:false,
  saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())



/* const pool = new Pool({
    user: 'postgres',
    host: `${process.env.HOST}`,
    database: 'blockchain',
    password: `${process.env.POSTGRES_PASS}`,
    port: 5432,
  }); */
/*   pool.query('SELECT * FROM blockchain_table', (error, result) => {
    if (error) {
      console.error('Error querying the database: ' + error.stack);
      return;
    }
  
    console.log(result.rows);

  
  }); */

 /*  client.query('SELECT * FROM blockchain_table',function(err,result){
    if(err){
      console.log("err on querying",err)
    }
    console.log(result.rows)

    client.end();
  }) */
app.get("/users",(req,res)=>{
  res.json(users)
})
app.post("/login",passport.authenticate('local',{
  successRedirect:'/getarchive',
  failureRedirect:'/login',
  failureFlash:true
}))
app.post("/register",async(req,res)=>{
  try {
    const hashedpassword=await bcrypt.hash(req.body.password,10)
    console.log("hashed password:",hashedpassword)
    const user={ id:Date.now().toString(),name:req.body.name,hashedpassword:hashedpassword}
    //users.push(user)
    WritingUsers(user)
    res.send({ success: true });
    //res.redirect("/login")
  } catch (error) {
    console.log(error)
    res.redirect("/register")
  }
  
})




app.get("/getarchive",checkAuthenticated,(req, res) => {
 client.query('SELECT * FROM blockchain_table', (error, result) => {
    if (error) {
      console.error('Error querying the database: ' + error.stack);
      res.status(500).send({ error: 'Error querying the database' });
      return;
    }
    res.send(result.rows);
  });
});

app.post("/send", checkAuthenticated,(req, res) => {
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





app.post("/updateapprove", checkAuthenticated,(req, res) => {
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
  client.query(sql,value).then(result=>{
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
function checkAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    next()
  }else{
    res.redirect('/login')
  }
}



app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
