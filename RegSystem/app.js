const { publicDecrypt } = require('crypto');
const express = require('express');
const fs = require('fs');
const neo4j = require('neo4j-driver')
const app = express();
require('dotenv').config();


var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');


app.set('view engine','ejs');



//neo4j db
const driver =  neo4j.driver(process.env.DB_CONNECTION);
const session = driver.session();

app.listen(3000);

//static files
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});

//to view images define static file path
app.use(express.static(__dirname+'/images'));

//---------------------------------------------------------------//
// ---- MAIN ----- //


// ---- LOGIN ----- //
//GET the login page
app.get('/', (req,res) => {
    res.render('login');
});

//POST  login page
app.post('/login', (req,res) => {
  let body=req.body
  let type=body.type;

  // DOCTORS LOGIN
  if(type == 'doctor')
  {
  var ID= req.body.userid;
  var password= req.body.userpassword;

  session
  .run("MATCH (n:Doctor {ID:{idParam}, password:{passwordParam} }) RETURN n", 
  {idParam: ID, passwordParam: password})

  .then(function(result){       
    let item = result.records[0]._fields[0].properties
    if(item){
      console.log(result.records[0]._fields[0].properties)
      localStorage.setItem('item', JSON.stringify(item));
      res.render('drsPort',{item:item});
    }
  })

  .catch(function(error){
    console.log(error);
  });

  //STUDENTS LOGIN
} else if ( type== 'student'){
  var ID= req.body.userid;
  var password= req.body.userpassword;

  session
  .run("MATCH (n:Student {ID:{idParam}, password:{passwordParam} }) RETURN n", 
  {idParam: ID, passwordParam: password})

  .then(function(result){       
    let item = result.records[0]._fields[0].properties
    if(item){
      // console.log(result.records[0]._fields[0].properties)
      localStorage.setItem('item', JSON.stringify(item));
      res.render('studentPort',{item:item});
    }
  })

  .catch(function(error){
    console.log(error);
  });
}

});
// ---- END OF LOGIN ----- //


// ---- SIGN UP ----- //
//GET the signup page
app.get('/signup', (req,res) => {
  res.render('signup');
});

//POST signup page
app.post('/signup', (req,res) => {
  let body=req.body
  let type=body.type;

  // DOCTORS SIGN UP
  if(type == 'doctor')
  {
  var ID= req.body.userid;
  var name= req.body.username;
  var email= req.body.useremail;
  var password= req.body.userpassword;
  var gen= req.body.gender;
  var date= req.body.dob;
  var spec= req.body.specialization;
  var num= req.body.number;

  session
  .run("CREATE (n:Doctor {ID:{idParam}, name:{nameParam}, email:{emailParam}, password:{passwordParam}, gen:{genParam}, date:{dateParam}, spec:{specParam}, num:{numParam} }) RETURN n", 
  {idParam: ID, nameParam: name, emailParam: email, passwordParam: password, genParam:gen, dateParam:date, specParam:spec, numParam:num})

  .then(function(result){
    res.render('login');
  })

  .catch(function(error){
    console.log(error);
  });

  //STUDENT SIGN UP
} else if ( type== 'student'){
  var ID= req.body.userid;
  var name= req.body.username;
  var email= req.body.useremail;
  var password= req.body.userpassword;
  var gen= req.body.gender;
  var date= req.body.dob;
  var spec= req.body.specialization;
  var num= req.body.number;

  session
  .run("CREATE (n:Student {ID:{idParam}, name:{nameParam}, email:{emailParam}, password:{passwordParam}, gen:{genParam}, date:{dateParam}, spec:{specParam}, num:{numParam} }) RETURN n", 
  {idParam: ID, nameParam: name, emailParam: email, passwordParam: password, genParam:gen, dateParam:date, specParam:spec, numParam:num})

  .then(function(result){
    res.render('login');
    // session.close();
  })

  .catch(function(error){
    console.log(error);
  });

}

});
// ---- END OF SIGN UP ----- //


//get the contact us page
app.get('/contact', (req,res) => {
  res.render('contact');
});

// ---- END OF MAIN ----- //
// ------------------------------------------------- //

// ---- DRS PORTAL ----- //
//get the Drs home page
app.get('/drsPort', (req,res) => {
  res.render('drsPort');
});

//get the contact us Drs portal page
app.get('/contactus', (req,res) => {
  res.render('contactus');
});

//get the DRs profile portal page
app.get('/drsProfile', (req,res) => {
  console.log(localStorage.getItem('item'))
  res.render('drsProfile',{item:localStorage.getItem('item')});
 });


//get the DRs Add and Drop portal page
app.get('/drsAddDrop', (req,res) => {
  session
  .run("MATCH (n:Subject) RETURN n")

  .then(function(result){
    var subjectArr= [];

    result.records.forEach(function(record){
      // console.log(record._fields[0]);
      subjectArr.push({
        coursenumber: record._fields[0].properties.coursenumber,
        coursename: record._fields[0].properties.coursename,
        Lecturer: record._fields[0].properties.Lecturer,
        coursehours: record._fields[0].properties.coursehours,
        Day: record._fields[0].properties.Day,
        Date: record._fields[0].properties.Date
        
      });
    });
    res.render('drsAddDrop', {
      subjects: subjectArr
    })

  })

  .catch(function(error){
    console.log(error);
  });

});
// ---- END OF DRS PORTAL ----- //

// ------------------------------------------------- //

// ---- STUDENTS PORTAL ----- //
//GET the Students home page
app.get('/studentPort', (req,res) => {
  res.render('studentPort');
});

//get the contact us Student portal page
app.get('/contactStd', (req,res) => {
  res.render('contactStd');
});

//GET the Student profile portal page
app.get('/stdProfile', (req,res) => {
  console.log(localStorage.getItem('item'))
  res.render('stdProfile',{item:localStorage.getItem('item')});
});

//GET the Students Add and Drop portal page
app.get('/stdAddDrop', (req,res) => {
  session
  .run("MATCH (n:Subject) RETURN n")

  .then(function(result){
    var subjectArr= [];

    result.records.forEach(function(record){
      // console.log(record._fields[0]);
      subjectArr.push({
        coursenumber: record._fields[0].properties.coursenumber,
        coursename: record._fields[0].properties.coursename,
        Lecturer: record._fields[0].properties.Lecturer,
        coursehours: record._fields[0].properties.coursehours,
        Day: record._fields[0].properties.Day,
        Date: record._fields[0].properties.Date
        
      });
    });
    res.render('stdAddDrop', {
      subjects: subjectArr
    })

  })

  .catch(function(error){
    console.log(error);
  });

});
// ---- END OF STUDENTS PORTAL ----- //




//otherwise GET the 404 page
app.use((req,res) => {
  res.render('404');
});