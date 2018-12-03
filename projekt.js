const express = require('express');
const bodyParser = require('body-parser');

const pg = require('pg');
const conn = "postgres://postgres:7428252@localhost:5432/osm";
const client = new pg.Client({connectionString: conn});
client.connect();

function createIndexes(){
    var indexes = `create index index_polygons on planet_osm_polygon(landuse, boundary);
    create index index_points on planet_osm_point(name, place);`
    client.query(indexes, (err, res)=>{
        if(err){
            console.log("Error  creating indexes: "+err);
        }else{
            console.log('Indexes created: '+res);
        }
    });
}
setTimeout(createIndexes, 1000);

const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function(req, res){
  
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

Array.prototype.forEachAsync = function(callback) {
    var array = this;
  
    function next() {
        if (array.length == 0)
          return;

        var item = array.shift();
  
        callback(item, next, (array.length == 0));
    }

    next();
}

function createQuery(body, roz, callback){
    var sql = 'WITH mead AS(';
    if(roz > 0){
        roz = Math.sqrt(roz + roz)/2
        sql += 'SELECT ST_Contains(da.dataquery, ST_Buffer(ST_GeographyFromText(ST_AsText(ST_GeomFromGeoJSON(da.centroids))), '+roz+', 1)::geometry) as contains, da.dataquery2, da.count, da.centroids, da.dataquery FROM ('
    }
    sql += 'SELECT ST_AsGeoJSON(ST_Centroid(dataquery)) as centroids, ST_AsGeoJSON(dataquery) as dataquery2, dataquery,  count(*)  FROM (';
    for(var i = 0; i < body.length; i++){
        sql += `SELECT st_transform(meadows.way, 4326) as dataquery FROM
        (SELECT * FROM planet_osm_point AS point WHERE point.name LIKE '`+body[i].city+`' AND point.place IN ('city', 'town', 'village')) AS city
        CROSS JOIN 
        (SELECT * FROM planet_osm_polygon As poly WHERE poly.landuse = 'meadow') AS meadows
        WHERE ST_DWithin(ST_SetSRID(city.way,4326), ST_SetSRID(meadows.way,4326), `+body[i].posuv*1000+`) AND ST_DWithin(ST_SetSRID(city.way,4326), ST_SetSRID(meadows.way,4326), `+body[i].from*1000+`) = false `;
        if(i < body.length-1){
            sql += " UNION ALL ";
        }else{
            sql += ") AS uni GROUP BY dataquery HAVING count(*) > "+(body.length-1).toString();
            if(roz > 0){
                sql += "  ) as da";
            }
            sql += `), parks AS (
                SELECT way FROM (SELECT  key, value::integer, ST_AsGeoJSON(st_transform(nationalparks.way, 4326)) as poly, st_transform(nationalparks.way, 4326) as way FROM 
                (SELECT (each(tags)).key, (each(tags)).value, way FROM planet_osm_polygon as p WHERE p.boundary = 'national_park') AS nationalparks WHERE nationalparks.key LIKE 'protect_class') as vys WHERE value > 2
                )`;
            sql += `SELECT ST_AsGeoJSON(dataquery) as dataquery, mead.centroids `
            if(roz > 0) 
                sql += ', mead.contains '; 
            sql += `FROM (SELECT mead.dataquery as mead2 FROM parks, mead WHERE ST_Within(mead.dataquery, parks.way)) as res RIGHT JOIN mead ON res.mead2 = mead.dataquery WHERE res.mead2 IS NULL`
            callback(sql)
        }
    }
}

app.post('/query', function(req, res){
    var dataCompl = [];
    var roz = req.body.rozloha;
    var body = req.body.data;
    
    createQuery(body, roz, function(sqlQuery){
        client.query(sqlQuery, (err, queryRes) =>{
            if(err){
                console.log("ERROR: "+err);
                return res.status(500).json({success: false, data: err});
            }else{
                var centroids = [];
                for (i = 0; i < queryRes.rows.length; i++)
                {
                    if(roz > 0){
                        var temp = queryRes.rows[i].contains;
                        if(temp){
                            centroids.push( JSON.parse(queryRes.rows[i].centroids));
                            dataCompl.push( JSON.parse(queryRes.rows[i].dataquery));
                        }
                    }else{
                        centroids.push( JSON.parse(queryRes.rows[i].centroids));
                        dataCompl.push( JSON.parse(queryRes.rows[i].dataquery));
                    }
                    
                }
                
                res.json({success: true, data: dataCompl, centroids: centroids});
            }
        });
    })
});

app.get('/allMeadows', function(req, res){
    var sql = `WITH mead AS(
        SELECT st_transform(way, 4326) as dataquery FROM planet_osm_polygon as poly 
        WHERE poly.landuse = 'meadow'
        ), parks AS (
        SELECT way FROM (SELECT  key, value::integer, ST_AsGeoJSON(st_transform(nationalparks.way, 4326)) as poly, st_transform(nationalparks.way, 4326) as way FROM 
        (SELECT (each(tags)).key, (each(tags)).value, way FROM planet_osm_polygon as p WHERE p.boundary = 'national_park') AS nationalparks WHERE nationalparks.key LIKE 'protect_class') as vys WHERE value > 2
        )
        SELECT ST_AsGeoJSON(ST_Centroid(dataquery)) as dataquery2 FROM (SELECT mead.dataquery as mead2 FROM parks, mead WHERE ST_Within(mead.dataquery, parks.way)) as res RIGHT JOIN mead ON res.mead2 = mead.dataquery WHERE res.mead2 IS NULL`;


    client.query(sql, (err, queryRes) =>{
        if(err){
            console.log("ERROR: "+err);
            return res.status(500).json({success: false, data: err});
        }else{
            
            var data = [];

            for (i = 0; i < queryRes.rows.length; i++)
            {
                data.push( JSON.parse(queryRes.rows[i].dataquery2));
            }
            res.json({success: true, data: data});
        }
    });
    
});

var port = 8080;

var router = express.Router();

app.use('', router);

app.listen(port);
console.log("Listening on port "+port);