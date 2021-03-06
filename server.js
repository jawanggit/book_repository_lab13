'use strict';

//Bring outside variables and libraries through dotenv, express, cors
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pg = require('pg')
const superagent = require('superagent');
const morgan = require('morgan');
const PORT = process.env.PORT;
const methodOverride = require('method-override');



//Create an "instance" of express as our app
const app = express();
app.use(cors());
app.use(morgan('dev'));

//create a SQL client connection
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => {throw err;});

client.connect()
  .then( () => {
    app.listen(PORT, () => {
      console.log(`Server is up on port ${PORT}.`);
    });
  })
  .catch(err => {
    throw `PG startup error: ${err.message}`;
  })

//sets the default folder to ./views folder
app.set('view engine', 'ejs');


// In order to deal with a form POST ... we need to tell express that we care about it
app.use(express.urlencoded({ extended: true }))


app.use(methodOverride('_method'));

// Match any file after the '/' in the folder called '/public' near our server
// Static or non-changing content
// Static is a file.
app.use(express.static('./public'));



//routes////////////////
app.get('/hello',(req, res)=>{  
  res.render('pages/index');
})

app.get('/', getData)
app.get('/books/:id', getDetailHandler);
app.get(('/searches/new'), findBook);

app.put('/books/:id', updateBook);
app.delete('/books/:id',deleteBook);

app.post('/books', addBook);
app.post('/searches', APIcall);


app.use((error,request,response,next) => {
  console.log(error);
  response.status(500).send("Sorry, something went wrong")

});




///Helper Functions

function deleteBook(req,res) {
  
  let SQL = 'DELETE from books WHERE id=$1;';
  let param = [req.params.id]

  client.query(SQL, param)
    .then(()=>{
      res.redirect('/')
    }).catch(error => console.log(error));
}

function getBookshelfList(req, res) {
  let SQL = 'SELECT DISTINCT bookshelf FROM books;';
  return client.query(SQL);
}

function findBook(req,res){
  res.status(200).render('pages/searches/new')
}

function APIcall(req, res){
  let url = ""
  if (req.body.author){
  url = `https://www.googleapis.com/books/v1/volumes?q=inauthor:${req.body.search_entry}`
  }else {
  url = `https://www.googleapis.com/books/v1/volumes?q=intitle:${req.body.search_entry}`
  }
  superagent.get(url)
  .then(data =>{
      
      let output = data.body.items.map(object =>{
        return new BookInfo(object)
      });

    
    res.render('pages/searches/show', {info:output});
  })
  .catch((e) => {
    console.log(e)
    res.render('pages/error');
  });

};

function addBook(req,res){

  let SQL_book= 'INSERT INTO books (title, author, description, image, isbn, bookshelf) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *'
  let param = [req.body.title, req.body.author, req.body.description, req.body.image, req.body.isbn, req.body.bookshelf];

  client.query(SQL_book, param)
    .then(results=>{
      res.redirect(`/books/${results.rows[0].id}`)
    })
    .catch(handleError)

}

function getData(req, res) {
  getBookshelfList()
  .then(bookshelfList=>{
    let SQL = 'SELECT * from books;';
    return client.query(SQL)
    .then(results => {
      console.log(results.rows)
      let count = results.rows.length
      res.render('pages/index', { results: results.rows, count:count})
    })
    .catch(handleError);
  })
} 


function handleError(error, res) {
  console.log(error)
  res.render('pages/error')
}

function getDetailHandler(req, res){
  console.log(req.params)
  let SQL_details = `SELECT * FROM books WHERE id = $1`;
  let param = [req.params.id];

  return client.query(SQL_details, param)
    .then(results => {
      res.render('./pages/books/details', {details: results.rows[0]})
    })
    .catch(handleError);
}

function updateBook(req, res){
  console.log(req.body);
  let SQL = `UPDATE books SET title = $1, author = $2, description = $3, isbn = $4, bookshelf = $5;`
  let params = [req.body.title, req.body.author, req.body.description, req.body.isbn, req.body.bookshelf];
  console.log("updated SQL databse")

  client.query(SQL, params)
    .then( results => {
      res.status(200).redirect(`/books/${req.params.id}`);
    })
    .catch(handleError);
}



function BookInfo(data){
  this.title = typeof(data.volumeInfo.title) !== 'undefined' ?  (data.volumeInfo.title) : "Title unavailable"
  this.image = typeof(data.volumeInfo.imageLinks.thumbnail) !== 'undefined' ? (data.volumeInfo.imageLinks.thumbnail) : `https://i.imgur.com/J5LVHEL.jpg`
  this.author = typeof(data.volumeInfo.authors) !== 'undefined' ? data.volumeInfo.authors[0] : "Author unavailable"
  this.description = typeof(data.volumeInfo.description) !== 'undefined' ? data.volumeInfo.description : "Description unavailable"
  this.isbn = typeof(data.volumeInfo.industryIdentifiers) !=='undefined' ? data.volumeInfo.industryIdentifiers[0].identifier : "ISBN unavailable"
  this.bookshelf = typeof(data.volumeInfo.categories) !=='undefined' ? data.volumeInfo.categories[0] : "Undefined";
}


// app.listen(PORT, () =>{
//   console.log(`Server is up on port ${PORT}.`);
// })



// //create a SQL client connection
// const client = new pg.Client(process.env.DATABASE_URL);
// client.on('error', err => {throw err;});

// let finalDataObj = {};


// client.connect()
//   .then( () => {
//     app.listen(PORT, () => {
//       console.log(`Server is up on port ${PORT}.`);
//     });
//   })
//   .catch(err => {
//     throw `PG startup error: ${err.message}`;
//   })

///////////////////////////////////////////


// app.get('/location', (request,response) => {
  
  
//   //check table for requested city 
  
//   const query = [request.query.city]
//   const SQL = 'SELECT * FROM city_explorer_1 WHERE cityname = $1'
//   client.query(SQL,query)
//   .then (results => {
//     console.log("received input")
//     //save results to finalData using object Location
//     // console.log(results.rows[0])
//     if (results.rows[0]){
//       finalDataObj = new Location(results.rows[0], request.query.city)
//       // console.log(searchedLocation.cityname);
//       // console.log(finalDataObj)
//       console.log("msg: sent info using SQL info")
//       response.status(200).json(finalDataObj)

//     }else{
       
//       console.log('else statement ran')
//       const url = `https://us1.locationiq.com/v1/search.php`;
      
//       let queryObject = {
//         key: process.env.GEOCODE_API_KEY,
//         format: 'json',
//         q: request.query.city
//       }
//       console.log(url)
//       superagent.get(url)
//       .query(queryObject)
//       .then(data =>{
//         console.log("query sent")
//         console.log(data.body[0]);
//         finalDataObj = new Location(data.body[0], request.query.city);
       
              
//         //send requested information to front-end
//         response.status(200).send(finalDataObj);
        
//         //after saving object to an array of objects, save/insert request to SQL table
//         let cityname = request.query.city
//         let lat = finalDataObj.latitude
//         let lon = finalDataObj.longitude
//         let display_name = finalDataObj.formatted_query
//         let safeQuery = [cityname, lat, lon, display_name]
        
//         let SQL = 'INSERT INTO city_explorer_1 (cityname, lat, lon, display_name) VALUES ($1, $2, $3, $4) RETURNING *'
//         console.log('writing to table')
//         //safeQuery protects against SQL injection and merges $1 with safeQuery array
//         client.query(SQL, safeQuery)
//           .then(results => {
//             response.status(200).send(results);
//           })
//           .catch(error => {response.status(500).send(error)});  
//       })
  
//       .catch((e) => {
//         console.log(e)
//         response.status(500).send('So sorry, something went wrong.');
//       });
//     };

//   })
//   .catch( error => {response.status(500).send(error)
//   });
  
  
// });




// function Location(obj, searchQuery) {

//   this.search_query = searchQuery;
//   this.formatted_query = obj.display_name;
//   this.latitude = obj.lat;
//   this.longitude = obj.lon;
  
// }

// app.get('/weather', (request,response) => {
//   const url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${finalDataObj.latitude}&lon=${finalDataObj.longitude}&key=${process.env.WEATHER_API_KEY}&days=8`
//   superagent.get(url)
//   .then(weatherData =>{
//       let output = weatherData.body.data.map(object => {
//       return new Weather(object.weather,object.datetime)
//     })
    
//     response.status(200).send(output);
    
//   })
//   .catch(() => {
//     response.status(500).send('So sorry, something went wrong with the weather.');

//   });

// });

// function Weather(info, time){
//   this.forecast = info.description;
//   this.time = new Date(time).toDateString();
// }

// app.get('/trails', (request,response) => {
//   const url = `https://www.hikingproject.com/data/get-trails?lat=${finalDataObj.latitude}&lon=${finalDataObj.longitude}&key=${process.env.TRAIL_API_KEY}`
//   // console.log(url)
//   superagent.get(url)
//   .then(data => {
//     let output = data.body.trails.map(object => {
//       return new Trails(object)
      
//     })

//     response.status(200).send(output);
//   })
//   .catch((e) => {
//     // console.log(e)
//     response.status(500).send('So sorry, something went wrong with the trail info.');

//   });

// })

// function Trails(object){
//   this.name = object.name;
//   this.location = object.location;
//   this.length = object.length;
//   this.stars = object.stars;
//   this.stars_votes = object.starVotes;
//   this.summary = object.summary;
//   this.trail_url = object.url;
//   this.conditions = object.conditionDetails
//   this.condition_date = object.conditionDate.slice(0,10);
//   this.condition_time = object.conditionDate.slice(11,19);
// }

// app.get('/movies', (request,response)=>{
//   //reference to documentation: https://developers.themoviedb.org/3/search/search-movies
//   const url = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_API_KEY}&language=en-US&query=${finalDataObj.search_query}&page=1&include_adult=false`

//   superagent.get(url)
//   .then(data => {
    
//     let output = data.body.results.map(object => {
      
//       return new Movies(object)
//     })
//     console.log(output)
//     response.status(200).send(output);

//   })
    
//   .catch((e) => {
//     console.log(e)
//     response.status(500).send('So sorry, something went wrong with the movie info.');

//   });

// })

// function Movies(object){
//   this.title = object.title;
//   this.overview= object.overview;
//   this.average_votes= object.vote_average;
//   this.total_votes= object.vote_count;
//   this.image_url= `https://image.tmdb.org/t/p/w500${object.poster_path}`;
//   this.popularity= object.popularity;
//   this.released_on= object.release_date;
// }

// app.get('/yelp', (request,response)=>{
//   //reference to documentation: https://www.yelp.com/developers/documentation/v3/business_search
//   const url = `https://api.yelp.com/v3/businesses/search?&location=${finalDataObj.search_query}&limit=5&offset=${request.query.page*5}`
//   // console.log(request.query.page)
//   let queryObject = {
//     Authorization: `Bearer ${process.env.YELP_API_KEY}`,
//     format: 'json'
//   }
  
//   superagent.get(url)
//   .set(queryObject)
//   .then(data => {
//     // console.log(data.body.businesses)
//     let output = data.body.businesses.map(object => {
//       return new Yelp(object)
//     })

//     response.status(200).send(output);

//   })
    
//   .catch((e) => {
//     console.log(e)
//     response.status(500).send('So sorry, something went wrong with the yelp info.');

//   });
// })

// function Yelp(object){
//     this.name = object.alias;
//     this.image_url= object.image_url;
//     this.price= object.price;
//     this.rating= object.rating;
//     this.url= object.url;
// }
