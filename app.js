
var express = require('express');
var path = require('path');
var app = express();
const fs = require('fs');
var session = require('express-session');
const { render } = require('ejs');
const { json } = require('express');
const books = JSON.parse( fs.readFileSync("public/books.json") ) ;
var currentUser ;
//module.exports const con = 5 ;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:'secret', resave:false, saveUninitialized:true}));

//users data json file
var UsersArray = {table: [{username:"admin",password:'123', wantRead:[]}]};
const path2 = './users.json';

try {
  if (fs.existsSync(path2)) {
    UsersArray = JSON.parse(fs.readFileSync("users.json"));
  }
  else{
    fs.writeFileSync("users.json",JSON.stringify(UsersArray));

  }
} catch(err) {
  console.error(err)
}


//fs.writeFileSync("users.json",JSON.stringify(UsersArray));

function checkDatabaseForUsername (input){
  for(let i=0;i<UsersArray.table.length;i++){
    
    if((UsersArray.table[i].username.localeCompare(input))==0){
      return true;
    }}
    return false
}
function checkDatabaseForUsernameAndPass(inputUsername, inputPass){
  for(let i=0;i<UsersArray.table.length;i++){
    
    if((UsersArray.table[i].username.localeCompare(inputUsername))==0){
      if((UsersArray.table[i].password.localeCompare(inputPass))==0){
        return true;}
      else 
        return false;
    }}
    return false
}
//kewicool#2134
//login page
app.get('/',function(req,res){
  res.render("login",{message:""});
});

app.post('/',function(req,res){


  var existsInDatabase = checkDatabaseForUsernameAndPass(req.body.username,req.body.password);

  if(existsInDatabase){
    //if user is in database, open home page
    req.session.username = req.body.username;
    currentUser = req.body.username ;
    res.redirect("/home");
    /*
    var sessionUser= {table: [{username:req.body.username,ID:req.sessionID}]};
    try {
      if (fs.existsSync('./sessionUser.json')) {
        sessionUser = JSON.parse(fs.readFileSync("sessionUser.json"));
        console.log(sessionUser);
        var userHasSession = false;
        for(let i=0;i<sessionUser.table.length;i++){
          if(sessionUser.table[i].username.localeCompare(req.body.username)==0){
          userHasSession = true;
          sessionUser.table[i].ID = req.sessionID;
          console.log(userHasSession);
          break;
          }
        }
        if(!userHasSession){
        sessionUser.table.push({username:req.body.username,ID:req.sessionID});
        }
        fs.writeFileSync("sessionUser.json",JSON.stringify(sessionUser));
      }
      else{
        fs.writeFileSync("sessionUser.json",JSON.stringify(sessionUser));
        console.log("dfgfd");

      }

    
    } catch(err) {
      console.error(err)
    }
    console.log(sessionUser);
    */
  }
  else{
    //if username exists but password is wrong
    if(checkDatabaseForUsername(req.body.username))
    res.render("login",{message:"password is wrong"});
    else
    res.render("login",{message:"user doesn't exist"});
  }
  
});
//home page
app.get('/home',function(req,res){
  // if not logged in then he can't view the pages
  if (!req.session.username)
   res.redirect("/");
  else
   res.render("home");
})
// registeration
app.get('/registration',function(req,res){
  res.render("registration",{message:""});
});
app.post('/register',function(req,res){
  //create a new object with the user's input when button register is clicked
  var newUser = {username: req.body.username, password: req.body.password, wantRead: [] };
  //read the stored users' data base(Json)
  UsersArray = JSON.parse(fs.readFileSync("users.json"));

  var isDuplicate = checkDatabaseForUsername(newUser.username);
  if(isDuplicate){
    res.render("registration",{message:"user already exists"})
  }
  else{
    //add the new user to the database and render registration page with a message
    UsersArray.table.push(newUser);
  fs.writeFileSync("users.json",JSON.stringify(UsersArray));
  //res.render("registration",{message:"user has been added"});
  res.redirect("/");

  }
  
});




//home page

app.get('/novel',function(req,res){
  if (!req.session.username)
   res.redirect("/");
  else{
    console.log(req.session.username);
    console.log(req.sessionID);

    res.render("novel");
  }
  
});
app.get('/poetry',function(req,res){
  if (!req.session.username)
   res.redirect("/");
   else{
    console.log(req.session.username);
    console.log(req.sessionID);
  res.render("poetry");}
});
app.get('/fiction',function(req,res){
  if (!req.session.username)
   res.redirect("/");
   else{
    console.log(req.session.username);
    console.log(req.sessionID);
  res.render("fiction");}
});


app.get('/readlist',function(req,res){
  if (!req.session.username)
   res.redirect("/");
  else{
  console.log(req.session.username);
  console.log(currentUser) ;
  UsersArray = JSON.parse(fs.readFileSync("users.json"));
  var result = [];

  for(let i=0;i<UsersArray.table.length;i++){
    if((UsersArray.table[i].username.localeCompare(currentUser))==0){
    result = result.concat( UsersArray.table[i].wantRead );
    console.log(result);
    }
    }  
res.render("readlist" , {result} ) 
}});



// methods to search for books with regular expression
app.post('/search',function(req,res){
  var keySearch = ( req.body['Search']).toLowerCase() ;
  var regex = new RegExp ( keySearch );
  var result = [] ;
  for(let i=0;i<books.length;i++){
    if ((books[i].name).toLowerCase().match(regex) != null){
      result.push(books[i]) ;
    }
  }

  //implement the search functionality here
  if (!req.session.username)
   res.redirect("/");
  else // use result in front end to view the result of the search, see searchresult.ejs
  res.render("searchresults"  , {result});
});


//novel section
// Flies
app.get('/flies',function(req,res){
  if (!req.session.username)
   res.redirect("/");
  else
  res.render("flies");
});
app.post('/flies' , (req ,res )=> {
  addBook(req.originalUrl , req.session.username);
  res.redirect( req.originalUrl ) ;           
});

// Grapes
app.get('/grapes',function(req,res){
  if (!req.session.username)
   res.redirect("/");
  else
  res.render("grapes");
});
app.post('/grapes' , (req ,res )=> {
  addBook(req.originalUrl , req.session.username);
  res.redirect( req.originalUrl ) ;           
});

//poetry section
// Leaves
app.get('/leaves',function(req,res){
  if (!req.session.username)
   res.redirect("/");
  else
  res.render("leaves");
});
app.post('/leaves' , (req ,res )=> {
  addBook(req.originalUrl , req.session.username);
  res.redirect( req.originalUrl ) ;           
});

// Sun
app.get('/sun',function(req,res){
  if (!req.session.username)
   res.redirect("/");
  else
  res.render("sun");
});
app.post('/sun' , (req ,res )=> {
  addBook(req.originalUrl , req.session.username);
  res.redirect( req.originalUrl ) ;           
});

//fiction section
// Dune
app.get('/dune',function(req,res){
  if (!req.session.username)
   res.redirect("/");
  else
  res.render("dune");
});
app.post('/dune' , (req ,res )=> {
  addBook(req.originalUrl , req.session.username);
  res.redirect( req.originalUrl ) ;           
});
// MockingBird
app.get('/mockingbird',function(req,res){
  if (!req.session.username)
   res.redirect("/");
  else
  res.render("mockingbird");
});
app.post('/mockingbird' , (req ,res )=> {
  addBook(req.originalUrl , req.session.username);
  res.redirect( req.originalUrl ) ;           
});


//implement the read list functionality here


// page not found
app.use((req , res) => {
  res.status(404).write('<h1> page can not be found </h1>');
});

// needed functions
function currentBook (url){
  for(let i=0;i<books.length;i++) 
    if (books[i].loc == url)
    return books[i];
}


function addBook ( s , user){
var addable = true;
UsersArray = JSON.parse(fs.readFileSync("users.json"));
  var bookurl = s ;
  for(let i=0;i<UsersArray.table.length;i++){
    if((UsersArray.table[i].username.localeCompare(user))==0)
         {
            for(let j=0;j<UsersArray.table[i].wantRead.length;j++)
              if(UsersArray.table[i].wantRead[j].name.localeCompare(currentBook(s).name)==0)
                addable = false;
            if(addable)
              UsersArray.table[i].wantRead.push( currentBook(s) );
              break;
         }
  }
  console.log("Book Added");
  fs.writeFileSync("users.json",JSON.stringify(UsersArray));   
}


//app port number
// app.listen(30001 , () => {
//   console.log('connection');
// });

if (process.env.PORT){
  app.listen(process.env.PORT,function(){console.log("Server started")})
}
else{
  app.listen(30001,function(){console.log("Host serves")})
}


