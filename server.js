const express = require('express');
const bodyParser= require('body-parser')
// const ConMongdbSession = require('connect-mongodb-session')(session);
var session = require('express-session'); 
const app = express();

//upload
// app.use(express.static('public'))
const path = require('path')
const multer = require('multer');
let alert = require('alert'); 
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const { ObjectId } = require('mongodb');
app.use(session({secret: 'laoruafromsouthside',saveUninitialized: true,resave: true,cookie:{
        maxAge: 2*60*1000 
    }  }));

const MongoClient = require('mongodb').MongoClient

const connectionString = 'mongodb+srv://huynqgcs210462:turtle0310@turtle.8c4ufaj.mongodb.net/'

// (0) CONNECT: server -> connect -> MongoDB Atlas 
MongoClient.connect(connectionString, { useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to Database')
        
        const db = client.db('star-wars-quotes')
        const quotesCollection = db.collection('quotes')
        const accUser = db.collection('acc_User')
        const Admin = db.collection('admin')
        const Product = db.collection('product')
        
        app.use(session({secret: 'laoruafromsouthside',
        saveUninitialized: false,
        resave: false,cookie:{expires:600000}, 
        accUser: accUser}));

        //
        
        
        // To tell Express to EJS as the template engine
        app.set('view engine', 'ejs') 
        
        // Make sure you place body-parser before your CRUD handlers!
        app.use(bodyParser.urlencoded({ extended: false }))

        // To make the 'public' folder accessible to the public
        app.use(express.static('public'))

        // To teach the server to read JSON data 
        app.use(bodyParser.json())

        //
        app.use(cookieParser())

        //
        const storage = multer.diskStorage({
            destination:(req,file,cb)=>{
                cb(null,'public/images')
            },
            filename:(req,file,cb)=>{
                cb(null,Date.now()+path.extname(file.originalname))
            }
        })
        const upload = multer({storage: storage})
        //Route

        app.get('/user', (req, res) => {
            db.collection('product').find().toArray()
                .then(results => {
                    console.log(results)
                    res.render('User.ejs', { product: results })
                })
                .catch(/* ... */)
        })

        app.get('/admin', (req, res) => {
            db.collection('product').find().toArray()
                .then(results => {
                    res.render('Admin.ejs', { product: results })
                })
                .catch(/* ... */)
        })

        app.get('/login', (req, res) => {
            res.render('login')
        })
        app.get('/loginAdmin', (req, res) => {
            res.render('login_admin')
        })
        app.get('/register', (req, res) => {
            res.render('register')
        })
        app.get('/addnew', (req, res) => {
            res.render('Addnew')
        })

       app.get('/', (req, res) => {res.render('index')});
        


        // (1b) CREATE: client -> index.ejs -> data -> SUBMIT 
        // -> post -> '/quotes' -> collection -> insert -> result
         


        app.post('/register',async (req, res) => {
            accUser.insertOne(req.body)
            .then(result => {
                console.log(result)
                res.redirect('/login')
            })
            .catch(error => console.error(error))
        })

        app.post('/upload',upload.single('img'),async (req, res) => {
            alert(req.file.filename)
            res.redirect('/addnew')
        })

        app.post('/Addnew',async (req, res) => {
            Product.insertOne(req.body)
            .then(result => {
                console.log(result)
                res.redirect('/addnew')
            }) 
            .catch(error => console.error(error))
        })
       
        app.post('/login',async (req, res) => {
            try {
                const check = await accUser.findOne({email:req.body.email})
            
                if(check){
                    const result = req.body.password===check.password
                    if(result){
                        res.redirect('/User')
                    }
                    else{
                        
                        res.redirect('/login')
                    }
                }
            } catch (error) {
                res.render('/login')
            }
            
        })

        app.post('/login_admin',async (req, res) => {
            try {
                const check = await Admin.findOne({email:req.body.email})
            
                if(check){
                    const result = req.body.password===check.password
                    if(result){
                        res.redirect('/admin')
                    }
                    else{
                        
                        res.redirect('/loginAdmin')
                    }
                }
            } catch (error) {
                res.render('/login')
            }
            
        })

        app.get('/Find', async (req, res) => {
            res.render('Find')
        })
        
        app.post('/Find', async (req, res) => {
            const check = await Product.findOne({name:req.body.id})
            console.log(check)
            if(check){
                db.collection('product').find({name:req.body.id}).toArray()
                .then(results => {
                    // console.log(results)
                    res.render('Result.ejs', { product: results })
                })
                .catch(/* ... */) 
            } 
            else{
                console.log("Wrong")
            }
        }) 
        // server -> listen -> port -> 3000
        app.listen(3000, function() {
            console.log('listening on 3000')
        })

})
    
    