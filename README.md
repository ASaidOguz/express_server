# ESCROW-STAKER DAPP Backend

Web3 escrow contract maker project where you can create typical escrow smart contract and deploy it and while your depoist waits it can gain interest thanks to proxy logic staker contract exist inside the contract 

- [x] Escrow contract logic  

    Contract owner 
    Arbiter
    Beneficiary
    Value

- [x] Escrow database 

    Elephantsql DB (Postgresql)
    Express server

- [x] Login Authentication made with JWT(json web token)
    
    Simple auth json web token implemented 

- [ ] Escrow contract staking 
   
    Implementing staker functionality where you can stake your eth if you want to get interest while your given work in progress

- [ ] Escrow staking interest mechanism 

    Using safe math library to create interest mechanism where user can get interest based on yearly interest values based in selection      

How to install 
Front end 
```
git clone https://github.com/ASaidOguz/escrow-app 
```

Backend

```
git clone https://github.com/ASaidOguz/express_server
```

to install dependencies please use 

```
npm install 
```
for backend and frontend folders 

after that use 
- ``node index`` 
to start backend express server 
Backend server works on localhost port 3042


- ``npm start``

to start frontend on localhost port 3000

LIVE DEMO ON : https://escrow-app-five.vercel.app/

cause of the Cors security please use the above link for live demo . 
