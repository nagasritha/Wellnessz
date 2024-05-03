const { query } = require("express")

THEME : WellnessZ Assignment-> Make a Rest API using Nodejs + SQL

USED TECHNOLOGIES:
 
 * Nodejs
 * SQLite

THIRD PARTY PACKAGES : 

* express
* sqlite3
* multer
* cors
* uuid
* cloudinary
* dotenv

TABLE SCHEMA:

item : 
        id VARCHAR PRIMARY KEY NOT NULL,
        title VARCHAR,
        description VARCHAR,
        tag VARCHAR,
        image VARCHAR
images : 
        imagePath VARCHAR PRIMARY KEY, 
        imageUrl VARCHAR UNIQUE


APIs-1

Method: post,
url : https://wellnessz-y8cg.onrender.com,
body-format : File,
body-content : title,description,tag,image 

RESPONSE:

SUCCESS CASE:
{"message":"Data added"}

FAILURE CASE:
{"message":"Failed to insert the data"}

API-2

url : https://wellnessz-y8cg.onrender.com
method : GET   
query  : keyword , tag , limit, offset 

NOTE:
query params are optional