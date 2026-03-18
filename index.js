import express from "express";
import pg from "pg";

const app = new express();
const port = 3000;

const db = new pg.Client({
    user: "hemeshwer",
    host: "localhost",
    database: "web_dev",
    password: "#", // use your database password here
    port: 5432
})

db.connect();

app.use(express.static("public"));
app.use(express.urlencoded({extended: true})); // used so that we can see inside the body of the post 


async function getPosts(){
    const response = await db.query("select * from posts");
    return response.rows;
}  

function getYear(){
    const date = new Date;
    return date.getFullYear();
}

app.get("/", async (req, res) => { 
    let editPost = "#";
    let deletePost = "#";
    const post = await getPosts();
    res.render("home.ejs", {posts: post, editPostValue: editPost, deletePostValue: deletePost, year: getYear()});
})

app.get("/writePost", (req, res)=>{
    let editPost = "#";
    let deletePost = "#";
    res.render("form.ejs", {editPostValue: editPost, deletePostValue: deletePost, year: getYear()});
})

app.post("/submit", async(req, res) =>{
    let editPost = "#";
    let deletePost = "#";
    const title = req.body.title;
    const content =  req.body.content;

    try{
        await db.query("insert into posts(title, content) values($1, $2)", [title, content]);
    }
    catch(error){
        console.log("failed to insert data into the database ", error.message);
    }

    const post = await getPosts();    
    res.render("home.ejs", {posts: post, editPostValue: editPost, deletePostValue: deletePost, year: getYear()}); // go back to home page
})  

app.get("/openPost/:id", async (req, res) => {
    let editPost = "editPost/"+req.params.id; // enabling the option to edit post when viewing a post
    let deletePost = "deletePost/"+req.params.id;
    const seacrhId = req.params.id; // this will fetch the id part from the request url .. this id part is the title that we will search from the array posts
    let postTitle, postContent, Idx;

    try{
        const response = await db.query("select * from posts where id = $1", [seacrhId]);
        postTitle = response.rows[0].title;
        postContent = response.rows[0].content;
    }
    catch(error){
        console.log("Failed to make query");
    }
    
    res.render("showPost.ejs", {title: postTitle, content: postContent, editPostValue: editPost, deletePostValue: deletePost, year: getYear()});
})

app.get("/openPost/editPost/:id", async(req, res) => {
    let editPost = "#";
    let deletePost = "#";
    let id = Number(req.params.id);
    let postDetails = [];
    try{
        const response = await db.query("select * from posts where id = $1", [id]);
        postDetails = response.rows; // this data will be an array always containing 1 row and so we need to use index 0 to get data form this array
    }
    catch(error){
        console.log("failed to fetch data from the database ", error.message);
    }

    res.render("editPost.ejs", {editPostValue: editPost, post: postDetails, deletePostValue: deletePost, year: getYear()})
})

app.post("/edit/:id", async (req, res)=>{
    let editPost = "#";
    let deletePost = "#";
    let id = Number(req.params.id);
    const newTitle = req.body.title.trim();
    const newContent = req.body.content.trim(); // trimming any unnecessary spaces

    try{   
        await db.query("update posts set title = $1, content = $2 where id = $3", [newTitle, newContent, id]);
    }
    catch(error){
        console.log("failed to update data in the database : ", error.message);
    }
    const post = await getPosts();
    res.render("home.ejs", {posts: post, editPostValue: editPost, deletePostValue: deletePost, year: getYear()});
})

app.get("/openPost/deletePost/:id", async(req, res)=>{
    let editPost = "#";
    let deletePost = "#";
    let id = Number(req.params.id);
    let postToDelete = [];
    try{
        const response = await db.query("select * from posts where id = $1", [id]);
        postToDelete = response.rows;
    }
    catch(error){
        console.log("failed to fetch data from the database : ", error.message);
    }
    res.render("deletePost.ejs", {post: postToDelete, editPostValue: editPost, deletePostValue: deletePost, year: getYear()});
})

app.post("/delete/:id", async(req, res) => {
    let editPost = "#";
    let deletePost = "#";
    let id = Number(req.params.id);
    try{
        await db.query("delete from posts where id = $1", [id]);
    }
    catch(error){
        console.log("failed to delete data from the database : ", error.message);
    }
    res.redirect("/");
})

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
})
