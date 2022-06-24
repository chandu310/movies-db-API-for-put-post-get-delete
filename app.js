const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
const app = express();
app.use(express.json());

let databaseObject = null;
const databaseAndServerInitialization = async () => {
  try {
    databaseObject = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB error: ${e.message}`);
    process.exit(1);
  }
};

databaseAndServerInitialization();

const convertMovieDetailsArrayToObject = (input) => {
  return {
    movieId: input.movie_id,
    directorId: input.director_id,
    movieName: input.movie_name,
    leadActor: input.lead_actor,
  };
};

const convertDirectorDetailsArrayToObject = (input) => {
  return {
    directorId: input.director_id,
    directorName: input.director_name,
  };
};

//GET ALL MOVIES 1

app.get("/movies/", async (request, response) => {
  const allMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie;`;
  const moviesList = await databaseObject.all(allMoviesQuery);
  response.send(moviesList.map((eachCh) => ({ movieName: eachCh.movie_name })));
});

//POST A NEW MOVIE 2

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const newMoviePostQuery = `
    INSERT INTO
      movie (director_id,movie_name,lead_actor)
    VALUES
      (${directorId},'${movieName}','${leadActor}');`;
  await databaseObject.run(newMoviePostQuery);
  response.send("Movie Successfully Added");
});

//GET MOVIE BY ID 3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieByIdQuery = `
    SELECT
      *
    FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  const movieByIdResult = await databaseObject.get(movieByIdQuery);
  response.send(convertMovieDetailsArrayToObject(movieByIdResult));
});

//UPDATE MOVIE DETAILS 4

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
            UPDATE
              movie
            SET
              director_id = ${directorId},
              movie_name = '${movieName}',
              lead_actor = '${leadActor}'
            WHERE
              movie_id = ${movieId};`;
  await databaseObject.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//DELETE MOVIE 5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDeleteQuery = `
    DELETE FROM
      movie
    WHERE
      movie_id= ${movieId};`;
  await databaseObject.run(movieDeleteQuery);
  response.send("Movie Removed");
});

//GET DIRECT LIST 6

app.get("/directors/", async (request, response) => {
  const directorsQuery = `
    SELECT
      *
    FROM
      director;`;
  const directorResult = await databaseObject.all(directorsQuery);
  response.send(
    directorResult.map((each) => convertDirectorDetailsArrayToObject(each))
  );
});

//MOVIE NAMES BY DIRECTOR ID 7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const moviesByDirectorQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id= '${directorId}';`;
  const directorResult = await databaseObject.all(moviesByDirectorQuery);
  response.send(
    directorResult.map((eachDir) => ({ movieName: eachDir.movie_name }))
  );
});

module.exports = app;
