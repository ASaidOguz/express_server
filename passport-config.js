const LocalStrategy=require('passport-local').Strategy
const bcrypt=require('bcrypt')

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

module.exports=initialize