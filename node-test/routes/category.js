var express = require('express');
var router = express.Router();
var connection = require('../pg_connection.js');

router.post('/category', function(req, res, next){
  var cat_cd = req.body.cat_cd;
  var cat_nm = req.body.cat_nm;
  var registerQuery = {
    text: "INSERT INTO category (cat_cd, cat_nm) VALUES($1, $2)",
    values: [cat_cd, cat_nm],
  };
  connection.query(registerQuery)
    .then(function(rows){
      res.redirect('/category');
      res.end();
    })
    .catch(function(err){
      console.log(err.error);
      res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
      res.end();
    });
})
router.delete('/category', function(req, res, next){
  var cat_id = req.body.cat_id;
  var deleteQuery = {
    text: "DELETE FROM category WHERE cat_id = $1",
    values: [cat_id],
  };
  connection.query(deleteQuery)
    .then(function(){
      res.redirect('/category');
      res.end();
    })
    .catch(function(err){
      console.log(err.error);
      res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
      res.end();
    });
})
module.exports = router;
