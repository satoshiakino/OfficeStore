var express = require('express');
var router = express.Router();
var moment = require('moment');
var connection = require('../pg_connection.js');
var setSettlement = require('./setSettlement.js');

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
});

//localhost:3000/mst_menu
router.get('/mst_menu', function(req, res, next) {
  res.render('mst_menu', {});
  res.end();
});

//localhost:3000/prdct_mst
router.get('/prdct_mst', function(req, res, next) {
  var getPrdctMstQuery = {
    text: "SELECT prdct.prdct_id" + 
                ",prdct.cat_cd" +
                ",cat.cat_nm" +
                ",prdct.jan" +
                ",prdct.prdct_nm" +
                ",prdct.price" +
                ",prdct.latest " +
          "FROM prdct_mst AS prdct " +
          "LEFT OUTER JOIN category AS cat " + 
            "ON prdct.cat_cd = cat.cat_cd " +
          "WHERE prdct.latest = true"
  };
  connection.query(getPrdctMstQuery)
    .then(function(prdctMst){
      res.render('prdct_mst', {
        title: '商品マスタ',
        prdctList: prdctMst
      });
      res.end();
    })
    .catch(function(err){
      console.log(err.error);
      res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
      res.end();
    });
});

router.post('/prdct_mst', function(req, res, next){
  var prdct_id = req.body.prdct_id;
  res.cookie('prdct_id', prdct_id, {maxAge:600000, httpOnly:false});
  res.redirect('/prdct_update');
  res.end();
});

//localhost:3000/prdct_reg
router.get('/prdct_reg', function(req, res, next) {
  var selectQuery = {
    text: 'SELECT cat_cd, cat_nm FROM category WHERE latest = true'
  };
  connection.query(selectQuery)
    .then(function(category){
      res.render('prdct_reg', {
        title: "商品マスタ登録",
        catList: category
      });
      res.end();
    });
});

router.post('/prdct_reg', function(req, res, next) {
  var jan = req.body.jan;
  var cat_cd = req.body.cat_cd;
  var prdct_nm = req.body.prdct_nm;
  var price = req.body.price;
  var registerQuery = {
    text: 'INSERT INTO prdct_mst (cat_cd, jan, prdct_nm, price) VALUES($1, $2, $3, $4)',
    values: [cat_cd, jan, prdct_nm, price],
  };
  connection.query(registerQuery)
    .then(function(prdct){
      res.redirect('/prdct_reg');
      res.end();
    })
    .catch(function(err){
      console.log(err.error);
      res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack } });
      res.end();
    });
});

//localhost:3000/prdct_update
router.get('/prdct_update', function(req, res, next){
  var prdct_id = req.cookies.prdct_id;
  var selectQuery = {
    text: "SELECT * FROM prdct_mst WHERE prdct_id = $1",
    values: [prdct_id]
  };
  connection.query(selectQuery)
    .then(function(prdct){
      res.render('prdct_update', {
        title: "商品マスタ修正",
        prdctList: prdct
      });
      res.end();
    })
    .catch(function(err){
      console.log(err.error);
      res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
      res.end();
    });
});

router.post('/prdct_update', function(req, res, next) {
  var jan = req.body.jan;
  var cat_cd = req.body.cat_cd;
  var prdct_nm = req.body.prdct_nm;
  var price = req.body.price;
  var registerQuery = {
    text: 'INSERT INTO prdct_mst (cat_cd, jan, prdct_nm, price) VALUES($1, $2, $3, $4)',
    values: [cat_cd, jan, prdct_nm, price],
  };
  var prdct_id = req.cookies.prdct_id;
  var updateQuery = {
    text: 'UPDATE prdct_mst SET latest = false WHERE prdct_id = $1',
    values: [prdct_id]
  };
  Promise.all([
    connection.query(updateQuery)
      .then(function(){})
      .catch(function(err){
        console.log(err.error);
        res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack } });
        res.end();
      }),
    connection.query(registerQuery)
      .then(function(){})
      .catch(function(err){
        console.log(err.error);
        res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack } });
        res.end();
      })
  ])
  .then(function(){
    res.redirect('/prdct_mst');
    res.end();
  })
  .catch(function(err){
    console.log(err.error);
    res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
    res.end();
  });
});

//localhost:3000/category
router.get('/category', function(req, res, next){
  var getCategoryQuery = {
      text:'SELECT * FROM category WHERE latest = true'
  };
  connection.query(getCategoryQuery)
    .then(function(category){
      res.render('category', {
        title: 'カテゴリ一覧',
        categoryList: category
      });
      res.end();
    })
    .catch(function(err){
      console.log(err.error);
      res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
      res.end();
    });
});

router.post('/category', function(req, res, next){
  var cat_id = req.body.cat_id;
  res.cookie('cat_id', cat_id, {maxAge:600000, httpOnly:false});
  res.redirect('/cat_update');
  res.end();
});

/*router.delete('/category', function(req, res, next){
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
});*/

//localhost:3000/cat_reg
router.get('/cat_reg', function(req, res, next) {
  res.render('cat_reg');
  res.end();
});

router.post('/cat_reg', function(req, res, next){
  var cat_cd = req.body.cat_cd;
  var cat_nm = req.body.cat_nm;
  var registerQuery = {
    text: "INSERT INTO category (cat_cd, cat_nm) VALUES($1, $2)",
    values: [cat_cd, cat_nm],
  };
  connection.query(registerQuery)
    .then(function(rows){
      console.log(registerQuery);
      res.redirect('/mst_menu');
      res.end();
    })
    .catch(function(err){
      console.log(err.error);
      res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
      res.end();
    });
});

//localhost:3000/cat_update
router.get('/cat_update', function(req, res, next) {
  var cat_id = req.cookies.cat_id;
  var selectQuery = {
    text: 'SELECT cat_cd, cat_nm FROM category WHERE cat_id = $1',
    values: [cat_id]
  };
  connection.query(selectQuery)
    .then(function(category){
      res.render('cat_update', {
        title: "カテゴリ修正",
        catList: category
      });
      res.end();
    })
    .catch(function(err){
      console.log(err.error);
      res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
      res.end();
    });
});

router.post('/cat_update', function(req, res, next){
  var cat_cd = req.body.cat_cd;
  var cat_nm = req.body.cat_nm;
  var cat_id = req.cookies.cat_id;
  var updateQuery = {
    text: 'UPDATE category SET cat_cd = $1, cat_nm = $2 WHERE cat_id = $3',
    values: [cat_cd, cat_nm, cat_id]
  };
  connection.query(updateQuery)
    .then(function(){
      res.redirect('/category');
      res.end();
    })
    .catch(function(err){
      console.log(err.error);
      res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
      res.end();
    });
});

//localhost:3000/arrvl_menu
router.get('/arrvl_menu', function(req, res, next) {
  res.render('arrvl_menu', {});
  res.end();
});

//localhost:3000/arrvl_reg
router.get('/arrvl_reg', function(req, res, next) {
  var selectCategoryQuery = {
    text: 'SELECT cat_cd, cat_nm FROM category WHERE latest = true'
  };
  var selectPrdctQuery = {
    text: 'SELECT prdct_id, prdct_nm, cat_cd FROM prdct_mst WHERE latest = true'
  };
  var category;
  var product;
  Promise.all([
    connection.query(selectCategoryQuery)
      .then(function(cat){
        category = cat;
      })
      .catch(function(err){
        console.log(err.error);
        res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
        res.end();
      }),
    connection.query(selectPrdctQuery)
      .then(function(prdct){
        product = prdct;
      })
      .catch(function(err){
        console.log(err.error);
        res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
        res.end();
      })
  ])
  .then(function(){
    res.render('arrvl_reg', {
      title: "仕入登録",
      catList: category,
      prdctList: product
    });
    res.end();
  })
  .catch(function(err){
    console.log(err.error);
    res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
    res.end();
  });
});

router.post('/arrvl_reg', function(req, res, next) {
  var cat_cd = req.body.cat_cd;
  var prdct_id = req.body.prdct_id;
  var trade_num = req.body.trade_num;
  var cost = req.body.cost;
  registerArrivalQuery = {
    text: "INSERT INTO arrival (cat_cd, prdct_id, cost, trade_num, trade_date) VALUES($1, $2, $3, $4, now())",
    values: [cat_cd, prdct_id, cost, trade_num],
  };
  connection.query(registerArrivalQuery)
    .then(function(arrival){
      res.redirect('/arrvl_hstry');
      res.end();
    })
    .catch(function(err){
      console.log(err, error);
      res.render('err', { message: 'Error', error: { status: err.code, stack: err.stack } });
      res.end();
    });
});

//localhost:3000/arrvl_hstry
router.get('/arrvl_hstry', function(req, res, next) {
  getArrivalQuery = {
    text: "SELECT  arrvl.arrvl_id" +    
                 ",arrvl.cat_cd" +   
                 ",cat.cat_nm" +   
                 ",pm.jan" + 
                 ",pm.prdct_nm" +   
                 ",arrvl.cost" +
                 ",arrvl.trade_num" +  
                 ",TO_CHAR(arrvl.trade_date, \'yyyy.mm.dd Dy hh24:mi:ss\') AS trade_date " + 
          "FROM arrival AS arrvl " +  
          "LEFT OUTER JOIN prdct_mst AS pm " +  
          "ON arrvl.prdct_id = pm.prdct_id " +  
          "LEFT OUTER JOIN category AS cat " +  
          "ON arrvl.cat_cd = cat.cat_cd " +  
          "ORDER BY arrvl.trade_date"
  };
  connection.query(getArrivalQuery)
    .then(function(arrival){
      res.render('arrvl_hstry', {
        title: "arrvl_hstry",
        arrvlList: arrival
      });
      res.end();
    })
    .catch(function(err){
      console.log(err.error);
      res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
      res.end();
    });
});

router.delete('/arrvl_hstry', function(req, res, next) {
  var arrvl_id = req.body.arrvl_id;
  var deleteQuery = {
    text: "DELETE FROM arrival WHERE arrvl_id = $1",
    values: [arrvl_id]
  };
  connection.query(deleteQuery)
    .then(function(){
      res.redirect('/arrvl_hstry');
      res.end();
    })
    .catch(function(err){
      console.log(err, error);
      res.render('err', { message: 'Error', error: { status: err.code, stack: err.stack } });
      res.end();
    });
});

//localhost:3000/sales_menu
router.get('/sales_menu', function(req, res, next) {
  res.render('sales_menu', {});
  res.end();
});

//localhost:3000/sales_reg
router.get('/sales_reg', function(req, res, next) {
  var selectCategoryQuery = {
    text: 'SELECT cat_cd, cat_nm FROM category WHERE latest = true'
  };
  var selectPrdctQuery = {
    text: 'SELECT prdct_id, prdct_nm FROM prdct_mst WHERE latest = true'
  };
  var category;
  var product;
  Promise.all([
    connection.query(selectCategoryQuery)
      .then(function(cat){
        category = cat;
      })
      .catch(function(err){
        console.log(err.error);
        res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
        res.end();
      }),
    connection.query(selectPrdctQuery)
      .then(function(prdct){
        product = prdct;
      })
      .catch(function(err){
        console.log(err.error);
        res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
        res.end();
      })
  ])
  .then(function(){
    res.render('sales_reg', {
      title: "仕入登録",
      catList: category,
      prdctList: product
    });
    res.end();
  })
  .catch(function(err){
    console.log(err.error);
    res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
    res.end();
  });
});

router.post('/sales_reg', function(req, res, next) {
  var cat_cd = req.body.cat_cd;
  var prdct_id = req.body.prdct_id;
  var trade_num = req.body.trade_num;
  registerSalesQuery = {
    text: "INSERT INTO sales (cat_cd, prdct_id, trade_num, trade_date) VALUES($1, $2, $3, now())",
    values: [cat_cd, prdct_id, trade_num],
  };
  connection.query(registerSalesQuery)
    .then(function(arrival){
      res.redirect('/sales_hstry');
      res.end();
    })
    .catch(function(err){
      console.log(err, error);
      res.render('err', { message: 'Error', error: { status: err.code, stack: err.stack } });
      res.end();
    });
});

//localhost:3000/sales_hstry
router.get('/sales_hstry', function(req, res, next) {
  getSalesQuery = {
    text: "SELECT sales.sales_id" + 
                ",sales.cat_cd" +
                ",cat.cat_nm" +
                ",pm.jan" +
                ",pm.prdct_nm" + 
                ",pm.price" +
                ",sales.trade_num" +
                ",TO_CHAR(sales.trade_date, \'yyyy.mm.dd Dy hh24:mi:ss\') AS trade_date " +
            "FROM sales " +   
            "LEFT OUTER JOIN prdct_mst AS pm " +   
             "ON sales.prdct_id = pm.prdct_id " +  
            "LEFT OUTER JOIN category AS cat " +
             "ON sales.cat_cd = cat.cat_cd " +
            "ORDER BY sales.trade_date"
  };
  connection.query(getSalesQuery)
    .then(function(sales){
      res.render('sales_hstry', {
        title: "sales_hstry",
        salesList: sales
      });
      res.end();
    })
    .catch(function(err){
      console.log(err.error);
      res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
      res.end();
    });
});

router.delete('/sales_hstry', function(req, res, next) {
  var sales_id = req.body.sales_id;
  var deleteQuery = {
    text: "DELETE FROM sales WHERE sales_id = $1",
    values: [sales_id],
  };
  connection.query(deleteQuery)
    .then(function(){
      res.redirect('/sales_hstry');
      res.end();
    })
    .catch(function(err){
      console.log(err, error);
      res.render('err', { message: 'Error', error: { status: err.code, stack: err.stack } });
      res.end();
    });
});

//localhostk:3000/settlement
router.get('/settlement', function(req, res, next) {
  res.render('settlement', {
    title: "settlement"
  });
  res.end();
});

router.post('/settlement', function(req, res, next) {
  var totalCash = req.body.ten_thousand * 10000 + req.body.five_thousand * 5000 + req.body.one_thousand * 1000 + req.body.five_hundred * 500 + req.body.one_hundred * 100 + req.body.fifty * 50 + req.body.ten * 10 + req.body.five * 5 + req.body.one * 1;
  req.session.total_cash = totalCash;
  res.redirect('/settlement2');
  res.end();
});

//localhost:3000/settlement2
router.get('/settlement2', function(req, res, next) {
  var getCostQuery = {
    text: "SELECT SUM(arrvl.cost * arrvl.trade_num) AS total_cost " +
            "FROM arrival AS arrvl " +
            "WHERE checked = false " +
            "GROUP BY checked"
  };
  var getSalesQuery = {
    text: "SELECT SUM(pm.price * sales.trade_num) AS total_sales " +
            "FROM sales " +
            "LEFT OUTER JOIN prdct_mst AS pm " +
            "ON sales.prdct_id = pm.prdct_id " +
            "WHERE sales.checked = false " +
            "GROUP BY sales.checked"
  };
  var getLastCashQuery = {
    text: "SELECT total_cash FROM settlement WHERE latest = true"
  };
  var total_cost;
  var total_sales;
  var last_cash;
  Promise.all([
    connection.query(getCostQuery)
      .then(function(cost){
        total_cost = parseInt(cost[0].total_cost);
      })
      .catch(function(err){
        console.log(err.error);
        res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
        res.end();
      }),
    connection.query(getSalesQuery)
      .then(function(sales){
        total_sales = parseInt(sales[0].total_sales);
      })
      .catch(function(err){
        console.log(err.error);
        res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
        res.end();
      }),
    connection.query(getLastCashQuery)
      .then(function(cash){
        last_cash = parseInt(cash[0].total_cash);
      })
      .catch(function(err){
        console.log(err.error);
        res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
        res.end();
      })
  ])
  .then(function(){
    req.session.total_cost = total_cost;
    req.session.total_sales = total_sales;
    req.session.profit_loss = total_sales - total_cost;
    req.session.total_calc_cash = last_cash - total_cost + total_sales;
    req.session.excess_deficiency = (last_cash - total_cost + total_sales) - req.session.total_cash;
    res.render('settlement2', {
      title: "settlement2",
      total_cash: req.session.total_cash,
      total_cost: total_cost,
      total_sales: total_sales,
      profit_loss: total_sales - total_cost,
      total_calc_cash: last_cash - total_cost + total_sales,
      excess_deficiency: (last_cash - total_cost + total_sales) - req.session.total_cash
    });
  });
});

router.post('/settlement2', function(req, res, next) {
  var total_cost = req.session.total_cost;
  var total_sales = req.session.total_sales;
  var profit_loss = req.session.profit_loss;
  var total_calc_cash = req.session.total_calc_cash;
  var excess_deficiency = req.session.excess_deficiency;
  var total_cash = req.session.total_cash;
  var registerSettlementQuery = {
    text: "INSERT INTO settlement ( " +
          "total_cost, " +
          "total_sales, " +
          "profit_loss, " +
          "total_calc_cash, " +
          "excess_deficiency, " +
          "total_cash, " +
          "settle_date" +
          ") " +
          "VALUES ($1, $2, $3, $4, $5, $6, now())",
    values: [ total_cost ,total_sales, profit_loss, total_calc_cash, excess_deficiency, total_cash ],
  };
  var insertArrivalArchivesQuery = {
    text: "INSERT INTO arrival_archives " + 
            "SELECT  arrvl.arrvl_id," + 
                    "arrvl.cat_cd," +  
                    "cat.cat_nm," + 
                    "pm.jan," + 
                    "pm.prdct_nm," + 
                    "arrvl.cost," + 
                    "arrvl.trade_num," + 
                    "arrvl.trade_date " + 
                    "FROM arrival AS arrvl " + 
            "LEFT OUTER JOIN prdct_mst AS pm " + 
              "ON arrvl.prdct_id = pm.prdct_id " + 
            "LEFT OUTER JOIN category AS cat " + 
              "ON arrvl.cat_cd = cat.cat_cd " + 
            "WHERE arrvl.checked = false"
  };
  var insertSalesArchivesQuery = {
    text: "INSERT INTO sales_archives " + 
            "SELECT sales.sales_id" + 
            ",sales.cat_cd" +
            ",cat.cat_nm" +
            ",pm.jan" +
            ",pm.prdct_nm" +  
            ",pm.price" +
            ",sales.trade_num" +  
            ",sales.trade_date " + 
          "FROM sales " +
          "LEFT OUTER JOIN prdct_mst AS pm " +
            "ON sales.prdct_id = pm.prdct_id " +  
          "LEFT OUTER JOIN category AS cat " +
            "ON sales.cat_cd = cat.cat_cd " +
          "WHERE sales.checked = false"
  };
  var updateSettlementQuery = {
    text: "UPDATE settlement SET latest = false"
  };
  var updateArrivalQuery = {
    text: "UPDATE arrival SET checked = true"
  };
  var updateSalesQuery = {
    text: "UPDATE sales SET checked = true"
  };
  Promise.all([
    connection.query(insertArrivalArchivesQuery)
      .then(function(){})
      .catch(function(err){
        console.log(err.error);
        res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
        res.end();
      }),
    connection.query(insertSalesArchivesQuery)
      .then(function(){})
      .catch(function(err){
        console.log(err.error);
        res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
        res.end();
      })
  ])
  .then(Promise.all([
      connection.query(updateSettlementQuery)
        .then(function(){})
        .catch(function(err){
          console.log(err.error);
          res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
          res.end();
        }),
      connection.query(updateArrivalQuery)
        .then(function(){})
        .catch(function(err){
          console.log(err.error);
          res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
          res.end();
        }),
      connection.query(updateSalesQuery)
        .then(function(){})
        .catch(function(err){
          console.log(err.error);
          res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
          res.end();
        }),
    ])
    .then(function(){
      connection.query(registerSettlementQuery)
        .then(function(){
          res.redirect('/sales_menu');
          res.end();
        })
        .catch(function(err){
          console.log(err.error);
          res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
          res.end();
        });
  }));
});

//localhost:3000/sales_check
router.get('/sales_check', function(req, res, next) {
  res.render('sales_check', {});
  res.end();
});

//localhost:3000/inventory
router.get('/inventory', function(req, res, next) {
  res.render('inventory', {});
  res.end();
});

//localhost:3000/invntry_count
router.get('/invntry_count', function(req, res, next) {
  var selectQuery = {
    text: 'SELECT pm.prdct_id' + 
          	    ',pm.jan' +
          	    ',pm.prdct_nm' +
          	    ',CASE WHEN arrival.arrvl_num IS NULL THEN 0 ELSE arrival.arrvl_num END ' + 
          	    ' - CASE WHEN sales.sales_num IS NULL THEN 0 ELSE sales.sales_num END AS inventory' +
          	    ',(CASE WHEN arrival.arrvl_num IS NULL THEN 0 ELSE arrival.arrvl_num END ' +
          	    ' - CASE WHEN sales.sales_num IS NULL THEN 0 ELSE sales.sales_num END)' +
          	    ' * pm.price * pm.cost_rate AS stock_value ' +
          'FROM prdct_mst AS pm ' +
          'LEFT OUTER JOIN ' +
          '( ' +
          'SELECT prdct_id ' +
              ',SUM(trade_num) AS arrvl_num ' +
              ',SUM(trade_num * cost) AS arrvl_cost ' +
          'FROM arrival ' +
          'GROUP BY prdct_id ' +
          ') AS arrival ' +
          'ON pm.prdct_id = arrival.prdct_id ' +
          'LEFT OUTER JOIN ' +
          '( ' +
          'SELECT sales.prdct_id ' +
              ',SUM(sales.trade_num) AS sales_num ' +
              ',SUM(sales.trade_num * pm.price) AS total_sales ' +
          'FROM sales ' +
          'LEFT OUTER JOIN prdct_mst AS pm ' +
          'ON sales.prdct_id = pm.prdct_id ' +
          'GROUP BY sales.prdct_id ' +
          ') AS sales ' +
          'ON pm.prdct_id = sales.prdct_id ' +
          'ORDER BY pm.prdct_id'
  };
  connection.query(selectQuery)
    .then(function(prdct){
      res.render('invntry_count', {
        title: "棚卸",
        prdctList: prdct
      });
      res.end();
    })
    .catch(function(err){
      console.log(err.error);
      res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
      res.end();
    });
});

router.post('/invntry_count', function(req, res, next) {
  var count_num = req.body.count;
  var prdct_id = req.body.prdct_id;
  var insertArrivalQuery = {
    text: 'INSERT INTO arrival (cat_cd, prdct_id, trade_num, cost, trade_date, checked, count) ' +
          'SELECT pm.cat_cd ' +
                ',ic.prdct_id ' +
                ',ic.count_num - ic.invntry_num AS dif ' +
                ',pm.price * pm.cost_rate AS cost ' +
                ',ic.count_date ' +
                ',true AS checked ' +
                ',true AS count ' +
              'FROM inventory_count AS ic ' +
              'LEFT OUTER JOIN prdct_mst AS pm ' +
              'ON ic.prdct_id = pm.prdct_id ' +
              'WHERE ic.result_no = ' +
              '(SELECT result_no FROM inventory_count ORDER BY count_date desc limit 1) ' +
              'AND ic.count_num - ic.invntry_num != 0'
  };
  var updateArrivalQuery = {
    text: 'UPDATE arrival SET count = true'
  };
  var updateSalesQuery = {
    text: 'UPDATE sales SET count = true'
  };
  var selectResultNoQuery = {
    text: 'SELECT MAX(result_no) FROM inventory_count'
  };
  connection.query(selectResultNoQuery)
    .then(function(result_no) {
      console.log("1やで");
      var result = (result_no[0].max === null)?0:result_no[0].max;
      var p = Promise.resolve();
      prdct_id.forEach(function(prdct, i){
        console.log("2-:" + i);
        var insertInventoryCountQuery = {
          text: 'INSERT INTO inventory_count (prdct_id, invntry_num, count_num, count_date, result_no) ' +
                'SELECT pm.prdct_id ' +   
                      ',CASE WHEN arrival.arrvl_num IS NULL THEN 0 ELSE arrival.arrvl_num END ' +
                      ' - CASE WHEN sales.sales_num IS NULL THEN 0 ELSE sales.sales_num END AS invntry_num ' +
                      ',$1 AS count_num ' + 
                      ',now() AS count_date ' + 
                      ',CASE WHEN $2 = 0 THEN 1 ' + 
                        'ELSE $2 + 1 END AS result_no ' + 
                  'FROM prdct_mst AS pm ' +
                  'LEFT OUTER JOIN ' +
                  '( ' +
                  'SELECT prdct_id ' + 
                      ',SUM(trade_num) AS arrvl_num ' +
                      ',SUM(trade_num * cost) AS arrvl_cost ' + 
                  'FROM arrival ' +
                    'WHERE count = false ' +
                    'GROUP BY prdct_id '+
                    ') AS arrival ' +
                    'ON pm.prdct_id = arrival.prdct_id ' + 
                  'LEFT OUTER JOIN ' +
                  '( ' +
                    'SELECT sales.prdct_id ' + 
                        ',SUM(sales.trade_num) AS sales_num ' +
                        ',SUM(sales.trade_num * pm.price) AS total_sales ' + 
                      'FROM sales ' +
                      'LEFT OUTER JOIN prdct_mst AS pm ' + 
                      'ON sales.prdct_id = pm.prdct_id ' +
                      'WHERE sales.count = false ' +
                      'GROUP BY sales.prdct_id ' +
                      ') AS sales ' +
                      'ON pm.prdct_id = sales.prdct_id ' +
                  'WHERE pm.prdct_id = $3',
          values: [count_num[i], result, prdct]  
        };
        p = p.then(function() {
          return connection.query(insertInventoryCountQuery);
        });
      });
      return p;
    }).then(function() {
      console.log("3や");
      return connection.query(insertArrivalQuery);
    }).then(function() {
      console.log("4!");
      return connection.query(updateArrivalQuery);
    }).then(function() {
      console.log("5であってほしい");
      return connection.query(updateSalesQuery);
    }).then(function() {
      console.log("終わりやで");
      res.redirect('/invntry_count');
      res.end();
    });
  /*connection.query(insertInventoryCountQuery).then(function(){
    console.log("1です");
    return connection.query(selectCountIdQuery);
  }).then(function(results){
    console.log("2です");
    console.log(results);
    let invntry_id = results[0].invntry_id;
    let p = Promise.resolve();
    count_num.forEach(function(count, i) {
      console.log("3-1:" + count);
      var updateInventoryCountQuery = {
        text: 'UPDATE inventory_count SET count_num = $1 WHERE invntry_id = $2',
        values: [count, invntry_id + i]
      };
      p = p.then(function() {
        console.log("3-2:" + count);
        return connection.query(updateInventoryCountQuery);
      });
    });
    return p;
  }).then(function() {
      console.log("4");
      return true;
  }).then(function(){
    console.log("5");
    res.redirect('/invntry_count');
    res.end();
  });*/
});
  /*  console.log(count_id[0].invntry_id);
    var invntry_id = count_id[0].invntry_id;
    for(var i=0; i<=count_num.length; i++){
      var count = count_num[i];
      var updateInventoryCountQuery = {
        text: 'UPDATE inventory_count SET count_num = $1 WHERE invntry_id = $2',
        values: [count, invntry_id]
      };
      connection.query(updateInventoryCountQuery)
        .then(function(){});
      invntry_id++;
    }
    connection.query(insertArrivalQuery)
      .then(function(){
        console.log("3だといいな");
        connection.query(updateArrivalQuery)
          .then(function(){
            console.log("4もしくは5");
          });
        connection.query(updateSalesQuery)
          .then(function(){
            console.log("4もしくは5");
          });
      });
  });
});
res.redirect('/invntry_count');
res.end();
});*/

  /*connection.query(insertInventoryCountQuery)
    .then(function(){
      console.log("1です");
      connection.query(selectCountIdQuery)
        .then(function(count_id){
          console.log("2です");
          console.log(count_id[0].invntry_id);
          var invntry_id = count_id[0].invntry_id;
          for(var i=0; i<=count_num.length; i++){
            var count = count_num[i];
            var updateInventoryCountQuery = {
              text: 'UPDATE inventory_count SET count_num = $1 WHERE invntry_id = $2',
              values: [count, invntry_id]
            };
            connection.query(updateInventoryCountQuery)
              .then(function(){});
            invntry_id++;
          }
          connection.query(insertArrivalQuery)
            .then(function(){
              console.log("3だといいな");
              connection.query(updateArrivalQuery)
                .then(function(){
                  console.log("4もしくは5");
                });
              connection.query(updateSalesQuery)
                .then(function(){
                  console.log("4もしくは5");
                });
            });
        });
    });

  res.redirect('/invntry_count');
  res.end();
});*/

/*var cat_id = req.body.cat_id;
  res.cookie('cat_id', cat_id, {maxAge:600000, httpOnly:false});*/

//localhost:3000/invntry_count_result
router.get('/invntry_count_result', function(req, res, next) {
  var selectInventoryCountQuery = {
    text: 'SELECT ic.result_no ' +
	              ',pm.cat_cd ' + 
	              ',cat.cat_nm ' + 
	              ',ic.prdct_id ' + 
	              ',pm.prdct_nm ' +
	              ',ic.invntry_num ' +
	              ',ic.count_num ' +
	              ',ic.count_num - ic.invntry_num AS dif ' +
	              ',TRUNC((ic.count_num - ic.invntry_num) ' +
                  '* pm.price * pm.cost_rate) AS stock_value ' +
                ',TO_CHAR(ic.count_date, \'YYYY/MM/DD\') AS count_date ' + 
	            'FROM inventory_count AS ic ' +
	            'LEFT OUTER JOIN prdct_mst AS pm ' +
	              'ON ic.prdct_id = pm.prdct_id ' +
	            'LEFT OUTER JOIN category AS cat ' +
                'ON pm.cat_cd = cat.cat_cd ' +
              'ORDER BY ic.prdct_id'
  };
  connection.query(selectInventoryCountQuery)
    .then(function(result) {
      res.render('invntry_count_result', {
        title: "棚卸結果確認",
        resultList: result
      });
      res.end();
    });
});

//localhost:3000/invntry_count_result2
router.get('/invntry_count_result2', function(req, res, next) {
  var selectInventoryCountQuery = {
    text: 'SELECT ic.result_no ' +
	              ',pm.cat_cd ' +
	              ',cat.cat_nm ' +
	              ',TRUNC(SUM((ic.count_num - ic.invntry_num) ' + 
	                '* pm.price * pm.cost_rate)) AS stock_value ' +
	              ',TO_CHAR(ic.count_date, \'YYYY/MM/DD\') AS count_date ' +
	          'FROM inventory_count AS ic ' +
	          'LEFT OUTER JOIN prdct_mst AS pm ' +
	            'ON ic.prdct_id = pm.prdct_id ' +
	          'LEFT OUTER JOIN category AS cat ' +
	            'ON pm.cat_cd = cat.cat_cd ' +
	          'GROUP BY ic.result_no, pm.cat_cd, cat.cat_nm, count_date) ' +
	          'ORDER BY pm.cat_cd'
  };
  connection.query(selectInventoryCountQuery)
    .then(function(result){
      res.render('invntry_count_result2', {
        title: "カテゴリ別棚卸結果" ,
        resultList: result
      });
      res.end();
    });
});

module.exports = router;
