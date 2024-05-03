require('dotenv').config();
const multer = require('multer');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const {v4 : uuid} = require('uuid');
const app = express();
const cors = require('cors');
const cloudinary = require('cloudinary').v2;

app.use(express.json());
app.use(cors);
app.listen(3001,()=>{
    console.log("server running on port 3001");
})

const db = new sqlite3.Database("wellnessz.db");

//Tables Creation
db.serialize(()=>{
    db.run(`CREATE TABLE IF NOT EXISTS item(
        id VARCHAR PRIMARY KEY NOT NULL,
        title VARCHAR,
        description VARCHAR,
        tag VARCHAR,
        image VARCHAR
    );`);
    db.run("CREATE TABLE IF NOT EXISTS images (imagePath VARCHAR PRIMARY KEY, imageUrl VARCHAR UNIQUE)");
})

//cloudinary settings
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true,
  });

//cloudinary settings completed

//uploading image into cloudinary
const uploadFile = async(filepath)=>{
    let result = null 
    try{
       let data = new Promise((resolve,reject)=>{
                 db.get(`SELECT * FROM images WHERE imagePath= ?`,[filepath],(err,row)=>{
                    if(err){
                        reject(err);
                    }else{
                        resolve(row);
                    }
                })
       });
       data = await data;
       console.log(data);
       if(data == null){
        const url = await cloudinary.uploader.upload(filepath);
        console.log(url);
        result = url.secure_url;
        db.run(`INSERT INTO images (imagePath,imageUrl) VALUES(?,?)`,[filepath,result],(err)=>{
            if(err){
                console.log(err);
            }else{
                console.log("updated");
            }
        })
       }else{
         result = data.imageUrl;
       }
       console.log(result);
       return result
    }
    catch(error) { 
        console.log(error.message);
    }
}
//end of uploading image

//multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads'); // Store uploaded files in the 'uploads' directory
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
  
const upload = multer({ storage: storage });



app.get("/", async (request, response) => {
    let { limit, offset, keyword, tag } = request.query;
    console.log(limit, offset, keyword, tag);
    
    // Default values if parameters are not provided
    limit = limit ? parseInt(limit) : 10;
    offset = offset ? parseInt(offset) : 0;
    keyword = keyword || '';
    tag = tag || '';

    console.log(limit, offset, keyword, tag);
    db.all(`SELECT * FROM item WHERE (title LIKE '%' || ? || '%' OR description LIKE '%' || ? || '%') AND tag LIKE '%' || ? || '%' LIMIT ? OFFSET ?`, [keyword, keyword, tag, limit, offset], (err, row) => {
        if (err) {
            response.send(err);
        } else {
            response.send(row);
        }
    });
});


app.post("/",upload.single('image'),async(request,response)=>{
    const {title,description,tag} = request.body;
    const id =uuid();
    await uploadFile(request.file.path);
    const imageUrl = await uploadFile(request.file.path);
    db.run(`INSERT INTO item (id,title,description,tag, image) VALUES(?,?,?,?,?)`,[id,title,description,tag,imageUrl],(err)=>{
        if(err){
            return response.status(400).send({"message":"Failed to insert the data"});
        
        }else{
            return response.status(200).send({"message":"Data added"});
        }
    })
})

app.delete("/",async(request,response)=>{
    db.run(`DELETE FROM item`,(err)=>{
        if(err){
            return response.status(400).send(err);
        }else{
            return response.status(200).send({"message":"Items Deleted"});
        }
    });
});

module.exports = db;