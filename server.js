const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const connect = ()=>{
    return mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.10pqn.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`);
}
app.use(cors());
app.use(express.json());
//------------- Users Schema Start -------------//
const userSchema = new mongoose.Schema({
    first_name:{type:String, required:true},
    last_name:{type:String, required:true},
    email:{type:String, required:true},
    password:{type:String, required:true},
    phone_num:{type:String, required:true}
},{
    versionKey:false,
    timestamps:true
});
const User = new mongoose.model("user",userSchema);
//------------- Users Schema End -------------//

//------------- City Schema Start -------------//
const citySchema = new mongoose.Schema({
    city:{type: String, required:true},
    state:{type:String, required:true},
    pickup_address:{type:String, required:false}
},{
    versionKey:false,
    timestamps:true
});
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
});
const Cars = mongoose.model("car",carsSchema)
//------------- Cars Schema End -------------//


//------------- Trips Schema Start -------------//
const tripSchema = mongoose.Schema({
    car:  {type: mongoose.Schema.Types.ObjectId, ref:"car", required:true},
    user: {type: mongoose.Schema.Types.ObjectId, ref:"user", required:true},
    pick_up_date:{type: Date, required:true},
    drop_off_date:{type:Date, required:true}
},{
    versionKey:false,
    timestamps:true
});
const Trip = mongoose.model("trip",tripSchema);
//------------- Trips Schema End -------------//

app.get("/",(req,res)=>{
    res.send({"All Endpoints":"/",
    "Users":{
        "POST: User Sign Up":{
            "Endpoint":"/user/signup",
            "Demo Body":{
                "first_name":"Kanav",
                "last_name":"Singla",
                "email":"name@gmail.com",
                "password":"123",
                "phone_num":"9987654321"
            }
        },
        "POST: User Login" : {
            "Endpoint":"/user/login",
            "Demo Body":{
                "email":"name@gmail.com",
                "password":"123"
            }
        }
    },
    "Cities":{
        "GET: All Cities":"/cities",
        "GET: Search City name":"/cities?name=<city name>"
    },
    "Cars":{
        "GET: All cars":"/cars",
        "GET: Cars by City":"/cars/city/<city id>"
    },
    "Trips":{
        "POST: New Trip":{
            "Endpoint": "/trips",
            "Demo Body":{
                "car":"615584d6c1a3375b584fe0f2",
                "user":"6157380d303421fdb80a1ad8",
                "pick_up_date":"2021-10-02",
                "drop_off_date":"2021-10-07"
            }
        },
        "GET: Trips by user id": "/trips/<User Id>"
    }
    
    });
})
//------------- Trip CRUD OPERATIONS Start -------------//
// Get Trip by user id
app.get("/trips/:userid", async (req,res)=>{
    const trip = await Trip.find({user:{$eq:req.params.userid}}).populate("car").populate({
        path:"user",
        select:["first_name","last_name","phone_num"]
    }).lean().exec();
    return res.status(200).send(trip);
})
// Create new Trip
app.post("/trips", async (req,res)=>{
    const trip = await Trip.create(req.body);
    return res.status(201).send(trip);
});
//------------- Trip CRUD OPERATIONS End -------------//


//------------- User CRUD OPERATIONS Start -------------//
// Create new User
app.post("/user/signup", async (req,res)=>{
    if(req.body.first_name===undefined ||
        req.body.last_name===undefined ||
        req.body.email===undefined ||
        req.body.password===undefined ||
        req.body.phone_num===undefined){
            return res.send({"status":"error","details":"Some Field missing from body"})
        }
    const existingUser = await User.find({email:{$eq:req.body.email}})
    if(existingUser.length==0){
        const user = await User.create(req.body);
        return res.status(201).send({"status":"OK","user":user});
    }else{
        return res.status(201).send({"status":"error","details":"User Already Exists"});
    }
});
app.post("/user/login", async(req,res)=>{
    const existingUser = await User.find({$and:[{email:{$eq:req.body.email}} ,{password:{$eq:req.body.password}}]})
    if(existingUser.length!=0){
        return res.status(201).send({
            "status":"OK",
            "details":"user authenticated",
            "user_id":existingUser[0]._id,
            "user_name":existingUser[0].first_name + " " + existingUser[0].last_name,
            "user_phone_num":existingUser[0].phone_num,
            "user_email":existingUser[0].email
        });
    }else{
        return res.status(201).send({"status":"error","details":"Invalid Credentials"});
    }
});
//------------- User CRUD OPERATIONS End -------------//

//------------- City CRUD OPERATIONS Start -------------//
// Get All cities
app.get("/cities", async (req,res)=>{
    let cities;
    let searchName = req.query.name;
    if(req.query.name!==undefined){
        // searchName below to convert first character to uppercase
        let finalName = searchName.slice(0,1).toUpperCase() + searchName.slice(1);
        cities = await City.find({city:{$regex:finalName}}).lean().exec();
    }else{
        cities = await City.find().lean().exec();
    }
    return res.status(200).send(cities);
});
// Create new city
app.post("/cities", async (req,res)=>{
    const city = await City.create(req.body);
    return res.status(201).send(city);
});
// Get City by Id
app.get("/cities/:id", async(req,res)=>{
    const city = await City.findById(req.params.id).lean().exec();
    return res.status(200).send(city);
});
// Update City by Id
app.patch("/cities/:id", async(req,res)=>{
    const city = await City.findByIdAndUpdate(req.params.id,req.body,{new:true});
    return res.status(200).send(city);
});
// Delete City by Id
app.delete("/cities/:id", async(req,res)=>{
    const city = await City.findByIdAndDelete(req.params.id);
    return res.status(200).send(`City with id ${req.params.id} deleted`)
});
//------------- City CRUD OPERATIONS End -------------//



//------------- Car CRUD OPERATIONS Start -------------//
// Get All cars
app.get("/cars", async (req,res)=>{
    const cars = await Cars.find().lean().exec();
    return res.status(200).send(cars);
});
// Create new Car
app.post("/cars", async (req,res)=>{
    const cardata = await Cars.create(req.body);
    return res.status(201).send(cardata);
});
// Get Car by Id
app.get("/cars/:id", async(req,res)=>{
    const cardata = await Cars.findById(req.params.id).lean().exec();
    return res.status(200).send(cardata);
});
// Get Car by City
app.get("/cars/city/:city", async(req,res)=>{
    const cardata = await Cars.find({city:{$eq:req.params.city}}).populate({
        path:"city",
        select:["city","state","pickup_address"]
    }).lean().exec();
    return res.status(200).send(cardata);
});
// Update Car by Id
app.patch("/cars/:id", async(req,res)=>{
    const cardata = await Cars.findByIdAndUpdate(req.params.id,req.body,{new:true});
    return res.status(200).send(cardata);
});
// Delete Car by Id
app.delete("/cars/:id", async(req,res)=>{
    const cardata = await Cars.findByIdAndDelete(req.params.id);
    return res.status(200).send(`Car with id ${req.params.id} deleted`)
});
//------------- Car CRUD OPERATIONS End -------------//


//-------------  CRUD OPERATIONS Start -------------//


//-------------  CRUD OPERATIONS End -------------//

app.listen(process.env.PORT , async ()=>{
    await connect();
    console.log(`App working on port ${process.env.PORT}`);
});