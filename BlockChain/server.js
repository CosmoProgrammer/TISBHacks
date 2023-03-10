const express = require('express'); 
const app = express(); 
const port = 7793
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
app.use(cors());
app.use(express.urlencoded({ extended: true })) 
app.use(express.json());

const { SupplyChain } = require('./SupplyChain')
const { UserChain } = require('./UserChain')

var SupplyChainInstance = new SupplyChain
var UserChainInstance = new UserChain

SupplyChainInstance.retrieveBlockChainFromFile('SupplyChain.json')

let id1 = UserChainInstance.addUser({username:'New Bakery', password:'bakery123', 'deposit':20})
let id2 = UserChainInstance.addUser({username:"Peril Farm", password: 'farm123','deposit':10})
let id3 = UserChainInstance.addUser({username: "Mariata's Rice Refinary", password: 'refining123', 'deposit':10})

app.get('/login/:cred', (req, res) => {   
    var tcreds = req.params.cred
    var creds = JSON.parse(tcreds)
    console.log(creds)
    console.log(creds.password)
    //res.send('The Blockchain serverside is working')
    if (UserChainInstance.verifyUser(creds.username, creds.password)) {
        console.log('Login successful')
        res.send('true')
    }
    else{
        console.log(creds)
        console.log("Login failed")
        res.send('false')
    }
})

/*app.get('/getItem', (req, res) => {
    var item = JSON.parse(req.body.item)
})

app.get('/sendItem/:item/:func', (req, res) =>{
    var itemTemp = req.params.item
    var funcTemp = req.params.func
    var funcToBeSent = JSON.stringify(funcTemp)
    var item = JSON.stringify(itemTemp)
    console.log(funcToBeSent)
    res.send(funcToBeSent)
    console.log(item)
})*/

app.get("/getitem/:id", (req, res) => {
    //console.log("HERE")
    //console.log(req.params.id)
    const id = req.params.id;
    const item = SupplyChainInstance.findItem(id);
    if (!item) {
      return res.status(404).send("Item not found");
    }
    res.send(item);
  });  

app.post("/combine/:ids/:details", (req, res) => {
    let ids =  req.params.ids.split(',');
    let details = JSON.parse(req.params.details)
    details.clocation = details.location
    details.compliance = {}
    details.compliance.temperature = details.temperature
    details.compliance.moisture = details.moisture
    console.log(details)
    let idtemp = SupplyChainInstance.combineItems(details, ...ids)
    //console.log(SupplyChainInstance.chain)
    console.log(SupplyChainInstance.getItemsAtLocation('New Bakery'))
    SupplyChainInstance.saveBlockChainToFile('SupplyChain.json')
    res.send("['Done']")
})

app.post("/convert/:id/:details", (req, res) => {
    let id =  JSON.parse(req.params.id);
    let details = JSON.parse(req.params.details)
    details.clocation =  details.location
    details.compliance={}
    details.compliance.temperature = details.temperature
    details.compliance.moisture = details.moisture
    console.log(id,details)
    SupplyChainInstance.convertItem(details, id)
    SupplyChainInstance.saveBlockChainToFile('SupplyChain.json')
    res.send("['Done']")
})

app.post("/add/:details", (req, res) => {
    let details = JSON.parse(req.params.details)
    console.log("ADD")
    details.clocation =  details.location
    details.compliance={}
    details.compliance.temperature = details.temperature
    details.compliance.moisture = details.moisture
    console.log(details)
    SupplyChainInstance.addItem(details)
    SupplyChainInstance.saveBlockChainToFile('SupplyChain.json')
    res.send("['Done']")
})

app.post("/ship/:id/:details", (req, res) => {
    let id =  JSON.parse(req.params.id);
    let details = JSON.parse(req.params.details)
    SupplyChainInstance.changeItemLocation(id,details)
    SupplyChainInstance.saveBlockChainToFile('SupplyChain.json')
    res.send("['Done']")
})

app.post("/sell/:id", (req, res) => {
    let id =  JSON.parse(req.params.id);
    SupplyChainInstance.changeItemLocation(id,'false')
    SupplyChainInstance.saveBlockChainToFile('SupplyChain.json')
    res.send("['Done']")
})

app.get("/location/:user", (req, res) => {
    let user = req.params.user
    let items = SupplyChainInstance.getItemsAtLocation(user)
    let itemids = []
    for (let i = 0; i < items.length; i++){
        itemids.push(items[i].id)
    }
    //let details = SupplyChainInstance.getItemsDetails(itemIds)
    console.log(itemids)
    res.send(itemids)
})


app.listen(port, () => { console.log(`Listening at http://localhost:${port}`) });