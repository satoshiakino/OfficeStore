var express = require('express');
var router = express.Router();
var connection = require('../pg_connection.js');

var selectCategoryQuery = {
    text: 'SELECT cat_cd, cat_nm FROM category'
};
var catArr;
connection.query(selectCategoryQuery)
    .then(function(category){
        catArr = category;
    });
    