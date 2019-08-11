var express = require('express');
var router = express.Router();
var moment = require('moment');
var connection = require('../pg_connection.js');

router.get('/:board_id', function(req, res, next){
    var boardId = req.params.board_id;
    var getBoardQuery = {
        text:'SELECT * FROM boards WHERE board_id = ' + boardId
    };
    var getMessageQuery = {
        text: 'SELECT *, TO_CHAR(created_at, \'yyyy.mm.dd Dy hh24:mi:ss\') AS created_at FROM message'
    };
    var messages = null;
    var boards;
    Promise.all([
        connection.query(getBoardQuery)
        .then(function(board){
            boards = board;
        }),
        connection.query(getMessageQuery)
        .then(function(message){
            messages = message;
        })
    ])
    .then(function(){
        res.render('board', {
            title: boards[0].title,
            board: boards[0],
            messageList: messages
        });
        res.end();
    });
});


router.post('/:board_id', function(req, res, next){
    var message = req.body.message;
    var boardId = req.params.board_id;
    var createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    var query = {
        text: "INSERT INTO message (message, board_id, created_at) VALUES ($1, $2, $3)",
        values: [message, boardId, createdAt],
    };
    connection.query(query)
        .then(function(rows){
            console.log(rows);
            res.redirect('/');
            res.end();
        })
        .catch(function(err){
            console.log(err.error);
            res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack } });
            res.end();
        });
});

module.exports = router;