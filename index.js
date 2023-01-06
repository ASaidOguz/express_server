
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const flash=require('express-flash')
const session=require('express-session')
var pg=require('pg')
const LocalStrategy=require('passport-local').Strategy
const bcrypt=require('bcryptjs')

require('dotenv').config()

const passport = require("passport");
var conString=process.env.CONSTRING
var client= new pg.Client(conString)
//Initilazing the database 
client.connect(function(err){
  if(err){
    return console.log("could not connect postgres!",err)
  }
})
app.enable('trust proxy');
//Initialize the passport for auth checks 
initialize(passport,
 name=> getUserByName(name),
  id=>getUserById(id)
  )

//Adding cors origin and setting credentials true to receiving connection...  
app.use(cors({ 
    origin:["https://escrow-app-five.vercel.app/","https://vercel.com"],//<== location of the react app we r connecting!!
    credentials:true, 
    methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD', 'DELETE'],
    exposedHeaders: ["set-cookie"],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token']
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




app.post("/login",(req, res) => {
  res.header("Access-Control-Allow-Origin", "https://escrow-app-five.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash:true
  })(req, res);
}
)


app.post("/register",async(req,res,next)=>{
  res.header("Access-Control-Allow-Origin", "https://escrow-app-five.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
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
  res.header("Access-Control-Allow-Origin", "https://escrow-app-five.vercel.app/");
  res.header("Access-Control-Allow-Methods", "GET, POST");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

 client.query('SELECT * FROM blockchain_table', (error, result) => {
    if (error) {
      console.error('Error querying the database: ' + error.stack);
      res.status(500).send({ error: 'Error querying the database' });
      return;
    }
    res.send(result.rows);
  });
});

app.post("/send", checkAuthenticated,(req, res,next) => {
  res.header("Access-Control-Allow-Origin", "https://escrow-app-five.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
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





app.post("/updateapprove", checkAuthenticated,(req, res,next) => {
  res.header("Access-Control-Allow-Origin", "https://escrow-app-five.vercel.app");
  res.header("Access-Control-Allow-Methods", "GET, POST");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
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
function checkAuthenticated(req,res,next){
  if(req.isAuthenticated()){
    next()
  }else{
    res.redirect('/login')
  }
}



function initialize(passport,getUserByName,getUserById){
    const authenticateUser=async (name,password,done)=>{
       const user= await getUserByName(name)
       console.log(user)
       if(user===null){
        return done(null,false,{message:'No user with such name'})
       }
       try {
         
        if(await bcrypt.compare(password,user.hashedpassword)){
           return done(null,user)
        }else{
           return done(null,false,{message:'password incorrect!'})
        }
       } catch(error)  {
        return done(error)
       }
    }
   passport.use(new LocalStrategy({usernameField:'name'},authenticateUser))
   passport.serializeUser((user,done)=>done(null,user.id))
   passport.deserializeUser((id,done)=>{
   return done(null,getUserById(id))})
}

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
