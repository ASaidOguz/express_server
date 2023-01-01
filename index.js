
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const { Pool} = require('pg');
var pg=require('pg')
require('dotenv').config()

app.use(cors());
app.use(express.json());

var conString=process.env.CONSTRING
var client= new pg.Client(conString)

client.connect(function(err){
  if(err){
    return console.log("could not connect postgres!",err)
  }
})


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


app.get("/getarchive", (req, res) => {
 // const { address } = req.params;
 client.query('SELECT * FROM blockchain_table', (error, result) => {
    if (error) {
      console.error('Error querying the database: ' + error.stack);
      res.status(500).send({ error: 'Error querying the database' });
      return;
    }

    res.send(result.rows);

   

  });
});

app.post("/send", (req, res) => {
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

app.post("/updateapprove", (req, res) => {
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



app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
