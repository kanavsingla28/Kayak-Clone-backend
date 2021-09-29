const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config()

const connect = ()=>{
    return mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.10pqn.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`)
}
app.use(express.json());
//------------- City Schema Start -------------//
const citySchema = new mongoose.Schema({
    city:{type: String, required:true},
    state:{type:String, required:true}
},{
    versionKey:false,
    timestamps:true
})
const City = mongoose.model("city",citySchema)
//------------- City Schema End -------------//
//------------- Cars Schema Start -------------//
const carsSchema = new mongoose.Schema({
    car_name:{type: String, required:true},
    car_image:{type:String, required:true},
    passangers:{type:Number, required:true},
    large_bags:{type:Number, required:true},
    doors:{type:String, required:true},
    transmission:{type:String, required:true},
    air_conditioner:{type:Boolean, required:true},
    diesel:{type:Boolean, required:true},
    price:{type:Number, required:true},
    traveller_img:{type:String, required:true},
    city:{type:mongoose.Schema.Types.ObjectId, ref:"city" , required:true}    
},{
    versionKey:false,
    timestamps:true
})
const Cars = mongoose.model("car",carsSchema)
//------------- Cars Schema End -------------//


app.get("/",(req,res)=>{
    res.send({"All Endpoints":"/",
    "All Cities":"/cities"
    })
})

//------------- City CRUD OPERATIONS Start -------------//
// Get All cities
app.get("/cities", async (req,res)=>{
    const cities = await City.find().lean().exec();
    return res.status(200).send(cities);
})
// Create new city
app.post("/cities", async (req,res)=>{
    const city = await City.create(req.body);
    return res.status(201).send(city);
})
// Get City by Id
app.get("/cities/:id", async(req,res)=>{
    const city = await City.findById(req.params.id).lean().exec();
    return res.status(200).send(city);
})
// Update City by Id
app.patch("/cities/:id", async(req,res)=>{
    const city = await City.findByIdAndUpdate(req.params.id,req.body,{new:true});
    return res.status(200).send(city);
})
// Delete City by Id
app.delete("/cities/:id", async(req,res)=>{
    const city = await City.findByIdAndDelete(req.params.id);
    return res.status(200).send(`City with id ${req.params.id} deleted`)
})
//------------- City CRUD OPERATIONS End -------------//



//------------- Car CRUD OPERATIONS Start -------------//
// Get All cars
app.get("/cars", async (req,res)=>{
    const cars = await Cars.find().lean().exec();
    return res.status(200).send(cars);
})
// Create new Car
app.post("/cars", async (req,res)=>{
    const cardata = await Cars.create(req.body);
    return res.status(201).send(cardata);
})
// Get Car by Id
app.get("/cars/:id", async(req,res)=>{
    const cardata = await Cars.findById(req.params.id).lean().exec();
    return res.status(200).send(cardata);
})
// Get Car by City
app.get("/cars/city/:city", async(req,res)=>{
    const cardata = await Cars.find({city:{$eq:req.params.city}}).populate({
        path:"city",
        select:["city","state"]
    }).lean().exec();
    return res.status(200).send(cardata);
})
// Update Car by Id
app.patch("/cars/:id", async(req,res)=>{
    const cardata = await Cars.findByIdAndUpdate(req.params.id,req.body,{new:true});
    return res.status(200).send(cardata);
})
// Delete Car by Id
app.delete("/cars/:id", async(req,res)=>{
    const cardata = await Cars.findByIdAndDelete(req.params.id);
    return res.status(200).send(`Car with id ${req.params.id} deleted`)
})
//------------- Car CRUD OPERATIONS End -------------//


//-------------  CRUD OPERATIONS Start -------------//


//-------------  CRUD OPERATIONS End -------------//

app.listen(process.env.PORT , async ()=>{
    await connect();
    console.log(`App working on port ${process.env.PORT}`);
})