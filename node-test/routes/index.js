var express = require('express');
var router = express.Router();
var moment = require('moment');
var connection = require('../pg_connection.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  var query = {
    text:'SELECT *, TO_CHAR(created_at, \'yyyy.mm.dd Dy hh24:mi:ss\') AS created_at FROM boards'
  };
  connection.query(query)
    .then(function(rows){
      console.log(rows);
      res.render('index', { 
        title: 'はじめてのnode.js',
        boardList: rows
      });
      res.end();
    });
});

router.post('/', function(req, res, next){
  var title = req.body.title;
  var createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
  var query = {
    text: "INSERT INTO boards (title, created_at) VALUES($1, $2)",
    values: [title, createdAt],
  };
  connection.query(query)
    .then(function(rows){
      console.log(rows);
      res.redirect('/');
      res.end();
    })
    .catch(function(err){
      console.log(err.error);
      res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
      res.end();
    });
})

//localhost:3000/mst_menu
router.get('/mst_menu', function(req, res, next) {
  res.render('mst_menu', {});
  res.end();
});

//localhost:3000/prdct_mst
router.get('/prdct_mst', function(req, res, next) {
  var getPrdctMstQuery = {
    text: 'SELECT prdct.prdct_id, prdct.cat_cd, cat.cat_nm, prdct.jan, prdct.prdct_nm, prdct.price, prdct.latest FROM prdct_mst AS prdct LEFT OUTER JOIN category AS cat ON prdct.cat_cd = cat.cat_cd'
  };
  connection.query(getPrdctMstQuery)
    .then(function(prdctMst){
      res.render('prdct_mst', {
        title: '商品マスタ',
        prdctList: prdctMst
      });
      res.end();
    })
})

//localhost:3000/category
router.get('/category', function(req, res, next){
  var getCategoryQuery = {
      text:'SELECT * FROM category'
  };
  connection.query(getCategoryQuery)
    .then(function(category){
      res.render('category', {
        title: 'カテゴリ一覧',
        categoryList: category
      });
      res.end();
    });
});

router.post('/category', function(req, res, next){
  var cat_cd = req.body.cat_cd;
  var cat_nm = req.body.cat_nm;
  var registerQuery = {
    text: "INSERT INTO category (cat_cd, cat_nm) VALUES($1, $2)",
    values: [cat_cd, cat_nm],
  };
  connection.query(registerQuery)
    .then(function(rows){
      res.redirect('/mst_menu');
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

//localhost:3000/arrvl_menu
router.get('/arrvl_menu', function(req, res, next) {
  res.render('arrvl_menu', {});
  res.end();
});

//localhost:3000/sales_menu
router.get('/sales_menu', function(req, res, next) {
  res.render('sales_menu', {});
  res.end();
});

//localhost:3000/sales_check
router.get('/sales_check', function(req, res, next) {
  res.render('sales_check', {});
  res.end();
});

//localhost:3000/invntry_check
router.get('/invntry_check', function(req, res, next) {
  res.render('invntry_check', {});
  res.end();
})

module.exports = router;
