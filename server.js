'use strict';

//Bring outside variables and libraries through dotenv, express, cors
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pg = require('pg')
const superagent = require('superagent');
const morgan = require('morgan');
const PORT = process.env.PORT;

//Create an "instance" of express as our app
const app = express();
app.use(cors());
app.use(morgan('dev'));

//sets the default folder to ./views folder
app.set('view engine', 'ejs');


// In order to deal with a form POST ... we need to tell express that we care about it
app.use(express.urlencoded({ extended: true }))


//test route
app.get('/hello',(req, resp)=>{  
    resp.render('pages/index');
})

app.get(('/searches/new'), (req,resp)=>{
  resp.render('pages/searches/new')
})

//https://www.googleapis.com/books/v1/volumes?q=isbn:<your_isbn_here>

app.use((error,request,response,next) => {
  console.log(error);
  response.status(500).send("Sorry, something went wrong")

});

app.listen(PORT, () =>{
  console.log(`Server is up on port ${PORT}.`);
})

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
