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
  var cat_cd = req.query.cat_cd;
  if(!cat_cd){ cat_cd = "0"; };
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
          "WHERE prdct.latest = true " +
            "AND CASE WHEN $1 = '0' THEN 1 = 1 ELSE prdct.cat_cd = $1 END ",
    values: [cat_cd]
  };
  var selectCategoryQuery = {
    text: 'SELECT cat_cd, cat_nm FROM category WHERE latest = true'
  };
  var prdct_mst;
  var category;
  Promise.all([
    connection.query(getPrdctMstQuery)
      .then(function(prdctMst){
        prdct_mst = prdctMst;
      }),
    connection.query(selectCategoryQuery)
      .then(function(cat){
        category = cat;
      })
  ])
  .then(function(){
    res.render('prdct_mst', {
      title: '商品マスタ',
      prdctList: prdct_mst,
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

router.post('/prdct_mst', function(req, res, next){
  var prdct_id = req.body.id;
  res.cookie('prdct_id', prdct_id, {maxAge:600000, httpOnly:false});
  res.redirect('/prdct_update');
  res.end();
});

//localhost:3000/prdct_reg
router.get('/prdct_reg', function(req, res, next) {
  var selectCategoryQuery = {
    text: 'SELECT cat_cd, cat_nm FROM category WHERE latest = true'
  };
    connection.query(selectCategoryQuery)
      .then(function(cat){
        res.render('prdct_reg', {
          title: "商品マスタ登録",
          catList: cat
        });
        res.end();
      })
      .catch(function(err){
        console.log(err.error);
        res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack } });
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
  var tax_cd = (req.query.tax_cd=="true") ? false : true;
  var selectCategoryQuery = {
    text: 'SELECT cat_cd, cat_nm FROM category WHERE latest = true'
  };
  var selectPrdctQuery = {
    text: 'SELECT prdct_id, prdct_nm, cat_cd FROM prdct_mst WHERE latest = true'
  };
  var selectTaxQuery = {
    text: 'SELECT tax_cd, tax_nm FROM tax WHERE tax_cd = $1',
    values: [tax_cd]
  };
  var category;
  var product;
  var tax;
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
      }),
    connection.query(selectTaxQuery)
      .then(function(tax_code){
        tax = tax_code;
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
      prdctList: product,
      taxList: tax
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
  var cost = req.body.unit_price;
  var tax_cd = req.body.tax;
  if(tax_cd==="false"){ cost = Math.floor(cost*1.08) };
  if(Array.isArray(cat_cd)){
    for(var i=0; i<cat_cd.length; i++){
      var registerArrivalQuery = {
        text: "INSERT INTO arrival (prdct_id, trade_num, cost, trade_date) VALUES($1, $2, $3, now())",
        values: [prdct_id[i], trade_num[i], cost[i]],
      };
      connection.query(registerArrivalQuery)
        .then(function(){});
    }
  } else if(Array.isArray(cat_cd)==false){
    var registerArrivalQuery2 = {
      text: "INSERT INTO arrival (prdct_id, trade_num, cost, trade_date) VALUES($1, $2, $3, now())",
      values: [prdct_id, trade_num, cost],
    };
    connection.query(registerArrivalQuery2)
      .then(function(){});
  }
  
  res.redirect('/arrvl_hstry');
  res.end();
});

//localhost:3000/arrvl_hstry
router.get('/arrvl_hstry', function(req, res, next) {
  var cat_cd = req.query.cat_cd;
  var min_cost = req.query.min_cost;
  var max_cost = req.query.max_cost;
  if(!cat_cd){ cat_cd = "0"; };
  if(!min_cost){ min_cost = 0; };
  if(!max_cost){ max_cost = 1000; };
  getArrivalQuery = {
    text: "SELECT  arrvl.arrvl_id" +    
                 ",pm.cat_cd" +   
                 ",cat.cat_nm" +   
                 ",pm.jan" + 
                 ",pm.prdct_nm" +   
                 ",arrvl.cost" +
                 ",arrvl.trade_num" +  
                 ",TO_CHAR(arrvl.trade_date, \'yyyy/mm/dd\') AS trade_date " + 
          "FROM arrival AS arrvl " +  
          "LEFT OUTER JOIN prdct_mst AS pm " +  
          "ON arrvl.prdct_id = pm.prdct_id " +  
          "LEFT OUTER JOIN category AS cat " +  
          "ON pm.cat_cd = cat.cat_cd " + 
          "WHERE CASE WHEN $1 = '0' THEN 1 = 1 ELSE pm.cat_cd = $1 END " +
            "AND arrvl.cost >= $2 " +
            "AND arrvl.cost < $3 " + 
          "ORDER BY arrvl.trade_date",
    values: [cat_cd, min_cost, max_cost]
  };
  var selectCategoryQuery = {
    text: 'SELECT cat_cd, cat_nm FROM category WHERE latest = true'
  };
  var arrival;
  var category;
  Promise.all([
    connection.query(getArrivalQuery)
      .then(function(arrvl){
        arrival = arrvl;
      }),
    connection.query(selectCategoryQuery)
      .then(function(cat){
        category = cat;
      })
  ])
  .then(function(){
    res.render('arrvl_hstry', {
      title: "arrvl_hstry",
      arrvlList: arrival,
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
  var prdct_id = req.body.prdct_id;
  var trade_num = req.body.trade_num;
  registerSalesQuery = {
    text: "INSERT INTO sales (prdct_id, trade_num, trade_date) VALUES($1, $2, now())",
    values: [prdct_id, trade_num],
  };
  connection.query(registerSalesQuery)
    .then(function(){
      res.redirect('/sales_hstry');
      res.end();
    })
    .catch(function(err){
      console.log(err.error);
      res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack } });
      res.end();
    });
});

//localhost:3000/sales_hstry
router.get('/sales_hstry', function(req, res, next) {
  getSalesQuery = {
    text: "SELECT sales.sales_id" + 
                ",pm.cat_cd" +
                ",cat.cat_nm" +
                ",pm.jan" +
                ",pm.prdct_nm" + 
                ",pm.price" +
                ",sales.trade_num" +
                ",TO_CHAR(sales.trade_date, \'yyyy/mm/dd hh24:mi:ss\') AS trade_date " +
            "FROM sales " +   
            "LEFT OUTER JOIN prdct_mst AS pm " +   
             "ON sales.prdct_id = pm.prdct_id " +  
            "LEFT OUTER JOIN category AS cat " +
             "ON pm.cat_cd = cat.cat_cd " +
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
    title: "現金入力"
  });
  res.end();
});

router.post('/settlement', function(req, res, next) {
  var totalCash = req.body.ten_thousand * 10000 + req.body.five_thousand * 5000 + req.body.one_thousand * 1000 + req.body.five_hundred * 500 + req.body.one_hundred * 100 + req.body.fifty * 50 + req.body.ten * 10 + req.body.five * 5 + req.body.one * 1;
  var total_cash = totalCash;
  res.cookie('total_cash', total_cash);
  res.redirect('/settlement2');
  res.end();
});

//localhost:3000/settlement2
router.get('/settlement2', function(req, res, next) {
  var getCostQuery = {
    text: "SELECT SUM(cost * trade_num) AS total_cost " +
            "FROM arrival " +
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
      }),
    connection.query(getSalesQuery)
      .then(function(sales){
        total_sales = parseInt(sales[0].total_sales);
      }),
    connection.query(getLastCashQuery)
      .then(function(cash){
        last_cash = parseInt(cash[0].total_cash);
      })
  ])
  .then(function(){
    res.cookie('total_cost', total_cost);
    res.cookie('total_sales', total_sales);
    res.cookie('profit_loss', total_sales - total_cost);
    res.cookie('total_calc_cash', last_cash - total_cost + total_sales);
    res.cookie('excess_deficiency', parseInt(req.cookies.total_cash, 10) - (last_cash - total_cost + total_sales));
    res.render('settlement2', {
      title: "settlement2",
      total_cash: parseInt(req.cookies.total_cash, 10),
      total_cost: total_cost,
      total_sales: total_sales,
      profit_loss: total_sales - total_cost,
      total_calc_cash: last_cash - total_cost + total_sales,
      excess_deficiency: parseInt(req.cookies.total_cash, 10) - (last_cash - total_cost + total_sales)
    });
    res.end();
  })
  .catch(function(err){
    console.log(err.error);
    res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
    res.end();
  });
});

router.post('/settlement2', function(req, res, next) {
  var total_cost = parseInt(req.cookies.total_cost, 10);
  var total_sales = parseInt(req.cookies.total_sales, 10);
  var profit_loss = parseInt(req.cookies.profit_loss, 10);
  var total_calc_cash = parseInt(req.cookies.total_calc_cash, 10);
  var excess_deficiency = parseInt(req.cookies.excess_deficiency, 10);
  var total_cash = parseInt(req.cookies.total_cash, 10);
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
      connection.query(updateSettlementQuery)
        .then(function(){}),
      connection.query(updateArrivalQuery)
        .then(function(){}),
      connection.query(updateSalesQuery)
        .then(function(){}),
  ])
  .then(function(){
    connection.query(registerSettlementQuery)
      .then(function(){
        res.clearCookie('total_cash');
        res.clearCookie('total_cost');
        res.clearCookie('total_sales');
        res.clearCookie('profit_loss');
        res.clearCookie('total_calc_cash');
        res.clearCookie('excess_deficiency');
        res.redirect('/sales_menu');
        res.end();
      });
  })
  .catch(function(err){
    console.log(err.error);
    res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
    res.end();
  });
});

//localhost:3000/settlement_hstry
router.get('/settlement_hstry', function(req, res, next) {
  var selectSettlementQuery = {
    text: 'SELECT TO_CHAR(settle_date, \'YYYY/MM/DD\') AS settle_date ' +
	              ',total_cost ' +
	              ',total_sales ' +
	              ',profit_loss ' +
	              ',total_calc_cash ' +
	              ',excess_deficiency ' +
	              ',total_cash ' +
	          'FROM settlement'
  };
  connection.query(selectSettlementQuery)
    .then(function(result) {
      res.render('settlement_hstry', {
        title: "精算履歴",
        resultList: result
      });
      res.end();
    });
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
                ',CASE WHEN ic.count_num IS NULL THEN 0 ELSE ic.count_num END ' +
          	    '+(CASE WHEN arrival.arrvl_num IS NULL THEN 0 ELSE arrival.arrvl_num END ' + 
                ' - CASE WHEN sales.sales_num IS NULL THEN 0 ELSE sales.sales_num END) AS inventory' +
                ',CASE WHEN ic.count_num IS NULL THEN (arrival.arrvl_cost / arrival.arrvl_num) ' +
                      'WHEN arrival.arrvl_num IS NULL THEN ic.avg_cost ' + 
                      'WHEN arrival.arrvl_num IS NOT NULL THEN (ic.count_num * ic.avg_cost + arrival.arrvl_cost)/(ic.count_num + arrival.arrvl_num) ' +
          	          'ELSE 0 END AS avg_cost ' +
          'FROM prdct_mst AS pm ' +
          'LEFT OUTER JOIN ' +
          '( ' +
          'SELECT prdct_id, count_num, avg_cost FROM inventory_count ' +
            'WHERE result_no = (SELECT MAX(result_no) FROM inventory_count) ' +
          ') AS ic ' +
          'ON pm.prdct_id = ic.prdct_id ' +
          'LEFT OUTER JOIN ' +
          '( ' +
          'SELECT prdct_id ' +
              ',SUM(trade_num) AS arrvl_num ' +
              ',SUM(trade_num * cost) AS arrvl_cost ' +
          'FROM arrival ' +
          'WHERE count = false ' +
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
          'WHERE sales.count = false ' +
          'GROUP BY sales.prdct_id ' +
          ') AS sales ' +
          'ON pm.prdct_id = sales.prdct_id ' + 
          'WHERE pm.cat_cd <> \'00\' ' +
            'AND pm.cat_cd <> \'99\' ' +
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
  var avg_cost = req.body.avg_cost;
  var invntry_num = req.body.invntry_num;
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
      var result = (result_no[0].max === null)?0:result_no[0].max;
      result = parseInt(result) + 1;
      var p = Promise.resolve();
      for(i=0; i<prdct_id.length; i++){
        var insertInventoryCountQuery = {
          text: 'INSERT INTO inventory_count (prdct_id, invntry_num, count_num, avg_cost, count_date, result_no) ' +
                'VALUES ($1, $2, $3, $4, now(), $5)',
          values: [prdct_id[i], invntry_num[i], count_num[i], avg_cost[i], result]
        };
        connection.query(insertInventoryCountQuery);
      };
      /*prdct_id.forEach(function(prdct, i){
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
                  'FROM arrival ' +
                    'WHERE count = false ' +
                    'GROUP BY prdct_id '+
                    ') AS arrival ' +
                    'ON pm.prdct_id = arrival.prdct_id ' + 
                  'LEFT OUTER JOIN ' +
                  '( ' +
                    'SELECT sales.prdct_id ' + 
                        ',SUM(sales.trade_num) AS sales_num ' +
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
      });*/
      return p;
    }).then(function() {
      return connection.query(updateArrivalQuery);
    }).then(function() {
      return connection.query(updateSalesQuery);
    }).then(function() {
      res.redirect('/invntry_count');
      res.end();
    });
});

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
                  '* ic.avg_cost) AS stock_value ' +
                ',TO_CHAR(ic.count_date, \'YYYY/MM/DD\') AS count_date ' + 
	            'FROM inventory_count AS ic ' +
	            'LEFT OUTER JOIN prdct_mst AS pm ' +
	              'ON ic.prdct_id = pm.prdct_id ' +
	            'LEFT OUTER JOIN category AS cat ' +
                'ON pm.cat_cd = cat.cat_cd ' +
              'ORDER BY ic.result_no, ic.prdct_id'
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
	                '* ic.avg_cost)) AS stock_value ' +
	              ',TO_CHAR(ic.count_date, \'YYYY/MM/DD\') AS count_date1 ' +
	          'FROM inventory_count AS ic ' +
	          'LEFT OUTER JOIN prdct_mst AS pm ' +
	            'ON ic.prdct_id = pm.prdct_id ' +
	          'LEFT OUTER JOIN category AS cat ' +
	            'ON pm.cat_cd = cat.cat_cd ' +
	          'GROUP BY ic.result_no, pm.cat_cd, cat.cat_nm, count_date1 ' +
	          'ORDER BY count_date1, ic.result_no, pm.cat_cd'
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

//localhost:3000/invntry_status
router.get('/invntry_status', function(req, res, next) {
  var selectInventoryQuery = {
    text: 'SELECT SUM(pm.price * (CASE WHEN sls.s_num IS NULL THEN arrvl.a_num ELSE (arrvl.a_num - sls.s_num) END)) AS stock_value ' +
            'FROM ' +
            '( ' +
              'SELECT prdct_id ' + 
                    ',SUM(CASE WHEN trade_num IS NULL THEN 0 ELSE trade_num END) AS a_num ' + 
                'FROM arrival ' +
                'WHERE EXTRACT(YEAR FROM arrival.trade_date) = EXTRACT(YEAR FROM now()) ' + 
                  'AND EXTRACT(MONTH FROM arrival.trade_date) = EXTRACT(MONTH FROM now()) - 1 ' + 
                'GROUP BY prdct_id ' + 
            ') AS arrvl ' +
            'LEFT OUTER JOIN ' + 
            '( ' +
              'SELECT prdct_id ' +
                    ',SUM(CASE WHEN trade_num IS NULL THEN 0 ELSE trade_num END) AS s_num ' + 
                'FROM sales ' +
                'WHERE EXTRACT(YEAR FROM sales.trade_date) = EXTRACT(YEAR FROM now()) ' +
                  'AND EXTRACT(MONTH FROM sales.trade_date) = EXTRACT(MONTH FROM now()) - 1 ' + 
                'GROUP BY prdct_id ' +
            ') AS sls ' +
            'ON arrvl.prdct_id = sls.prdct_id ' +
            'LEFT OUTER JOIN prdct_mst AS pm ' +
            'ON pm.prdct_id = arrvl.prdct_id'
  };
  var selectArrivalQuery = {
    text: 'SELECT CASE WHEN SUM(pm.cost * arrival.trade_num) IS NULL THEN 0 ELSE SUM(pm.cost * arrival.trade_num) END AS total_stock_value ' +
            'FROM arrival ' +
            'LEFT OUTER JOIN prdct_mst AS pm ' +
            'ON arrival.prdct_id = pm.prdct_id ' +
            'WHERE EXTRACT(YEAR FROM arrival.trade_date) = EXTRACT(YEAR FROM now()) ' +
            'AND EXTRACT(MONTH FROM arrival.trade_date) = EXTRACT(MONTH FROM now()) '
  };
  var selectPrdctInvntryQuery = {
    text: 'SELECT pm.prdct_id ' +
	              ',pm.prdct_nm ' +
	              ',CASE WHEN sls.s_num IS NULL THEN arrvl.a_num ELSE (arrvl.a_num - sls.s_num) END AS trade_num ' +
	          'FROM prdct_mst AS pm ' +
	          'LEFT OUTER JOIN ' +
	          '( ' +
	          	'SELECT prdct_id ' +
	          		    ',SUM(CASE WHEN trade_num IS NULL THEN 0 ELSE trade_num END) AS a_num ' +
	          		'FROM arrival ' +
	          		'GROUP BY prdct_id ' +
	          ') AS arrvl ' +
	          'ON pm.prdct_id = arrvl.prdct_id ' +
	          'LEFT OUTER JOIN ' +
	          '( ' +
	          	'SELECT prdct_id ' +
	          		    ',SUM(CASE WHEN trade_num IS NULL THEN 0 ELSE trade_num END) AS s_num ' +
	          		'FROM sales ' +
	          		'GROUP BY prdct_id ' +
	          ') AS sls ' +
	          'ON pm.prdct_id = sls.prdct_id'
  };
  var selectInventoryQuery2 = {
    text: 'SELECT SUM(pm.price * (CASE WHEN sls.s_num IS NULL THEN arrvl.a_num ELSE (arrvl.a_num - sls.s_num) END)) AS stock_value ' +
            'FROM prdct_mst AS pm ' +
            'LEFT OUTER JOIN ' +
            '( ' +
              'SELECT prdct_id ' +
                    ',SUM(CASE WHEN trade_num IS NULL THEN 0 ELSE trade_num END) AS a_num ' +
                'FROM arrival ' +
                'WHERE EXTRACT(YEAR FROM arrival.trade_date) = EXTRACT(YEAR FROM now()) ' +
                  'AND EXTRACT(MONTH FROM arrival.trade_date) = EXTRACT(MONTH FROM now()) ' +
                'GROUP BY prdct_id ' +
            ') AS arrvl ' +
            'ON pm.prdct_id = arrvl.prdct_id ' +
            'LEFT OUTER JOIN ' +
            '( ' +
              'SELECT prdct_id ' +
                    ',SUM(CASE WHEN trade_num IS NULL THEN 0 ELSE trade_num END) AS s_num ' +
                'FROM sales ' +
                'WHERE EXTRACT(YEAR FROM sales.trade_date) = EXTRACT(YEAR FROM now()) ' +
                  'AND EXTRACT(MONTH FROM sales.trade_date) = EXTRACT(MONTH FROM now()) ' +
                'GROUP BY prdct_id ' +
            ') AS sls ' +
            'ON pm.prdct_id = sls.prdct_id'
  };
  var inventory;
  var inventory2;
  var arrival;
  var prdct_invntry;
  Promise.all([
    connection.query(selectInventoryQuery)
      .then(function(invntry){
        inventory = invntry;
      }),
    connection.query(selectInventoryQuery2)
      .then(function(invntry2){
        inventory2 = invntry2;
      }),
    connection.query(selectArrivalQuery)
      .then(function(arrvl){
        arrival = arrvl;
      }),
    connection.query(selectPrdctInvntryQuery)
      .then(function(prdct){
        prdct_invntry = prdct;
      }),
  ])
  .then(function(){
    res.render('invntry_status', {
      title: '在庫状況',
      inventory: inventory,
      inventory2: inventory2,
      arrival: arrival,
      invntryList: prdct_invntry
    });
    res.end();
  })
  .catch(function(err){
    console.log(err.error);
    res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
    res.end();
  });
});

//localhost:3000/sales_day
router.get('/sales_day', function(req, res, next) {
  var dt = new Date(req.query.month);
  if (isNaN(dt)) {
    dt = new Date();
  }
  var year = dt.getFullYear();
  var month = dt.getMonth() + 1;
  next_month = moment(dt);
  next_month.add(1, 'M');
  last_month = moment(dt);
  last_month.add(-1, 'M');
  var selectSalesQuery = {
    text: 'SELECT ca1.days1 ' +
            	  ',ca1.sales_day1 ' +
            	  ',ca2.days2 ' +
            	  ',ca2.sales_day2 ' +
            'FROM ' +
            '( ' +
            'SELECT TO_CHAR(cm.days, \'DD\') AS days1 ' +
                  ',CASE WHEN SUM(pm.price * sales.trade_num) IS NULL THEN 0 ELSE SUM(pm.price * sales.trade_num) END AS sales_day1 ' + 
            			',cm.day ' +
              'FROM calendar_mst AS cm ' + 
              'LEFT OUTER JOIN sales ' +
                'ON cm.days = sales.trade_date::date ' +
              'LEFT OUTER JOIN prdct_mst AS pm ' +
                'ON sales.prdct_id = pm.prdct_id ' + 
              'WHERE cm.year = ' + year +
                'AND cm.month = ' + month +
            		'AND cm.day < 17 ' +
                'GROUP BY days ' +
            ') AS ca1 ' +
            'LEFT OUTER JOIN ' +
            '( ' +
            'SELECT TO_CHAR(cm.days, \'DD\') AS days2 ' +
                  ',CASE WHEN SUM(pm.price * sales.trade_num) IS NULL THEN 0 ELSE SUM(pm.price * sales.trade_num) END AS sales_day2 ' +
            			',cm.day ' +
              'FROM calendar_mst AS cm ' +
              'LEFT OUTER JOIN sales ' +
                'ON cm.days = sales.trade_date::date ' +
              'LEFT OUTER JOIN prdct_mst AS pm ' +
                'ON sales.prdct_id = pm.prdct_id ' +
              'WHERE cm.year = ' + year +
                'AND cm.month = ' + month +
            		'AND cm.day > 16 ' +
            		'AND cm.day < 32 ' +
              'GROUP BY days ' +
            ') AS ca2 ' +
            'ON ca1.day + 16 = ca2.day ' +
            'ORDER BY ca1.days1 '
  };
  connection.query(selectSalesQuery)
    .then(function(result) {
      res.render('sales_day', {
        title: "日別売上",
        resultList: result,
        lastMonth: last_month.format('YYYY/MM'),
        nextMonth: next_month.format('YYYY/MM'),
        year: year,
        month: month
      });
      res.end();
    });
});

//localhost:3000/sales_week
router.get('/sales_week', function(req, res, next) {
  var dt = new Date(req.query.month);
  if (isNaN(dt)) {
    dt = new Date();
  }
  var year = dt.getFullYear();
  var month = dt.getMonth() + 1;
  next_month = moment(dt);
  next_month.add(1, 'M');
  last_month = moment(dt);
  last_month.add(-1, 'M');
  var selectSalesQuery = {
    text: 'SELECT TO_CHAR(s1.days - s1.day_of_the_week, \'mm/dd\') AS trade_week ' +
	              ',SUM(sale_data) AS sales_week ' +
	          'FROM ' +
	          '( ' +
	            'SELECT cm.days ' +
                    ',CASE WHEN pm.price * sales.trade_num IS NULL THEN 0 ELSE pm.price * sales.trade_num END AS sale_data ' +
	                  ',CAST(EXTRACT(dow FROM cm.days) AS INT ) AS day_of_the_week ' +
                'FROM calendar_mst AS cm ' +
                'LEFT OUTER JOIN sales ' +
                  'ON cm.days = sales.trade_date::date ' +
	              'LEFT OUTER JOIN prdct_mst AS pm ' + 
                  'ON sales.prdct_id = pm.prdct_id ' +
                'WHERE cm.year = ' + year + ' ' + 
                  'AND cm.month = ' + month + ' ' +
            ') AS s1 ' +
	          'GROUP BY trade_week ' +
	          'ORDER BY trade_week'
  };
  connection.query(selectSalesQuery)
    .then(function(result) {
      res.render('sales_week', {
        title: "週別売上",
        resultList: result,
        lastMonth: last_month.format('YYYY/MM'),
        nextMonth: next_month.format('YYYY/MM'),
        year: year,
        month: month
      });
      res.end();
    });
});

//localhost:3000/sales_month
router.get('/sales_month', function(req, res, next) {
  var dt = new Date(req.query.year);
  if (isNaN(dt)) {
    dt = new Date();
  }
  var year = dt.getFullYear();
  next_year = moment(dt);
  next_year.add(1, 'Y');
  last_year = moment(dt);
  last_year.add(-1, 'Y');
  var selectSalesQuery = {
    text: 'SELECT TO_CHAR(cm.days, \'yyyy/mm\') AS trade_month ' +
                ',CASE WHEN SUM(pm.price * sales.trade_num) IS NULL THEN 0 ELSE SUM(pm.price * sales.trade_num) END AS sales_month ' +
            'FROM calendar_mst AS cm ' +
            'LEFT OUTER JOIN sales ' +
              'ON cm.days = sales.trade_date::date ' +
            'LEFT OUTER JOIN prdct_mst AS pm ' + 
              'ON sales.prdct_id = pm.prdct_id ' +
            'WHERE cm.year = ' + year + ' ' +
            'GROUP BY trade_month ' +
            'ORDER BY trade_month'
  };
  connection.query(selectSalesQuery)
    .then(function(result) {
      res.render('sales_month', {
        title: "月別売上",
        resultList: result,
        lastYear: last_year.format('YYYY'),
        nextYear: next_year.format('YYYY'),
        year: year
      });
      res.end();
    });
});

//localhost3000/sales_year
router.get('/sales_year', function(req, res, next) {
  var selectSalesQuery = {
    text: 'SELECT TO_CHAR(cm.days, \'yyyy\') AS trade_year ' + 
                ',CASE WHEN SUM(pm.price * sales.trade_num) IS NULL THEN 0 ELSE SUM(pm.price * sales.trade_num) END AS sales_year ' + 
            'FROM calendar_mst AS cm ' +
            'LEFT OUTER JOIN sales ' +
            'ON cm.days = sales.trade_date::date ' + 
            'LEFT OUTER JOIN prdct_mst AS pm ' +
            '  ON sales.prdct_id = pm.prdct_id ' +
            'WHERE cm.days > now() - interval \'10year\' ' +
              'AND cm.days < now() ' +
            'GROUP BY trade_year ' + 
            'ORDER BY trade_year ' 
  };
  connection.query(selectSalesQuery)
    .then(function(result) {
      res.render('sales_year', {
        title: "年別売上",
        resultList: result
      });
      res.end();
    });
});


//localhost:3000/sales_trend_prdct_daily
router.get('/sales_trend_prdct_daily', function(req, res, next) {
  var dt = new Date(req.query.month);
  if (isNaN(dt)) {
    dt = new Date();
  }
  var year = dt.getFullYear();
  var month = dt.getMonth() + 1;
  var date = new Date(year, month, 0);
  var last_day = date.getDate();
  var select_date = "";
  var moment_date = moment(dt);
  for(var i=1; i<=last_day; i++){
    select_date += ',SUM(CASE s1.trade_date WHEN \'' + moment_date.format('YYYY-MM') + '-' + i  + '\' THEN s1.trade_num ELSE 0 END) AS "_' + i + '" ';
  }
  var selectSalesQuery = {
    text: 'SELECT s1.prdct_id AS prdct_id ' +
	              ',s1.prdct_nm AS prdct_nm ' +
	              select_date +
	          'FROM ' +
	          '( ' +
	          	'SELECT sales.prdct_id ' +
                 		  ',pm.prdct_nm ' + 
                 		  ',sales.trade_num ' +  
                 		  ',CAST(sales.trade_date AS DATE) AS trade_date ' +
	          	'FROM sales ' + 
	          	'LEFT OUTER JOIN prdct_mst AS pm ' + 
	          	  'ON sales.prdct_id = pm.prdct_id ' +
	          ') AS s1 ' +
	          'GROUP BY s1.prdct_id,s1.prdct_nm ' +
	          'ORDER BY s1.prdct_id'
  };
  next_month = moment(dt);
  next_month.add(1, 'M');
  last_month = moment(dt);
  last_month.add(-1, 'M');  
  connection.query(selectSalesQuery)
    .then(function(result) {
      var date_list = [];
      Object.keys(result[0]).forEach(function(key){
        if (key[0] === '_') {
          date_list.push(key);
        }
      });
      res.render('sales_trend_prdct_daily', {
        title: "商品販売動向",
        lastMonth: last_month.format('YYYY-MM'),
        nextMonth: next_month.format('YYYY-MM'),
        salesList: result,
        dateList: date_list,
        year: year,
        month: month
      });
      res.end();
    })
    .catch(function(err){
      console.log(err.error);
      res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
      res.end();
    });
});

//localhost:3000/sales_trend_prdct_weekly
router.get('/sales_trend_prdct_weekly', function(req, res, next) {
  var dt = new Date(req.query.month);
  if (isNaN(dt)) {
    dt = new Date();
  }
  var year = dt.getFullYear();
  var month = dt.getMonth() + 1;
  var date = new Date(year, month, 0);
  var last_day = date.getDate();
  var select_date = "";
  var moment_date = moment(dt);
  var first_date = new Date(year, dt.getMonth(), 1);
  var day_of_week = (first_date.getDay() == 0)?0:(7 -first_date.getDay());
  var first_sunday = new Date(year, dt.getMonth(), 1 + day_of_week);
  var fs = first_sunday.getDate();
  for(var i=fs; i<=last_day; i+=7){
    select_date += ',SUM(CASE sw.trade_week WHEN \'' + moment_date.format('YYYY/MM') + '/' + i  + '\' THEN sw.sales_week ELSE 0 END) AS "_' + month + '/' + i + '" ';
  }
  var selectSalesQuery = {
    text: 'SELECT sw.prdct_id ' +
                 ',sw.prdct_nm ' +
                 select_date +
            	'FROM ( ' +
            'SELECT TO_CHAR(s1.trade_day - s1.day_of_the_week, \'yyyy/mm/dd\') AS trade_week ' +
            	  ',s1.prdct_id ' +
            	  ',s1.prdct_nm ' +
            	  ',SUM(s1.trade_num) AS sales_week ' +
            	'FROM ' +
            	'( ' +
            		'SELECT CAST(sales.trade_date AS DATE) AS trade_day ' +
            		       ',pm.prdct_id ' +
            			     ',pm.prdct_nm ' +
                       ',SUM(CASE WHEN sales.trade_num IS NULL THEN 0 ELSE sales.trade_num END) AS trade_num ' +
            			     ',CAST(extract(dow FROM sales.trade_date) AS INT ) AS day_of_the_week ' +
            			'FROM prdct_mst AS pm ' +
            			'LEFT OUTER JOIN sales ' +
            			  'ON pm.prdct_id = sales.prdct_id ' +
            			'GROUP BY trade_day, pm.prdct_id, pm.prdct_nm, day_of_the_week ' +
            			'ORDER BY trade_day ' +
                ') AS s1 ' +
            	'GROUP BY trade_week, s1.prdct_id, s1.prdct_nm ' +
            	'ORDER BY trade_week ' +
            	') AS sw ' +
            	'GROUP BY sw.prdct_id, sw.prdct_nm ' +
            	'ORDER BY sw.prdct_id'
  };
  next_month = moment(dt);
  next_month.add(1, 'M');
  last_month = moment(dt);
  last_month.add(-1, 'M');  
  connection.query(selectSalesQuery)
    .then(function(result) {
      var date_list = [];
      Object.keys(result[0]).forEach(function(key){
        if (key[0] === '_') {
          date_list.push(key);
        }
      });
      res.render('sales_trend_prdct_weekly', {
        title: "週別商品販売動向",
        lastMonth: last_month.format('YYYY-MM'),
        nextMonth: next_month.format('YYYY-MM'),
        salesList: result,
        dateList: date_list,
        year: year,
        month: month
      });
      res.end();
    })
    .catch(function(err){
      console.log(err.error);
      res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
      res.end();
    });
});

//月ごとの商品販売動向
router.get('/sales_trend_prdct_monthly', function(req, res, next) {
  var dt = new Date(req.query.year);
  if (isNaN(dt)) {
    dt = new Date();
  }
  var year = dt.getFullYear();
  next_year = moment(dt);
  next_year.add(1, 'Y');
  last_year = moment(dt);
  last_year.add(-1, 'Y');
  var select_date = "";
  for(var i=1; i<=12; i++){
    select_date += ',SUM(CASE DATE_TRUNC(\'MONTH\', s1.trade_date) WHEN \'' + year + '-' + i +'-01\' THEN s1.trade_num ELSE 0 END) AS "_' + i + '月" ';
  }
  var selectSalesQuery = {
    text: 'SELECT s1.prdct_id AS prdct_id ' +  
	              ',s1.prdct_nm AS prdct_nm ' +
	              select_date +
            'FROM ' +
            '( ' +
              'SELECT sales.prdct_id ' + 
                    ',pm.prdct_nm ' +
                    ',sales.trade_num ' + 
                    ',trade_date ' +
                'FROM sales ' +
                'LEFT OUTER JOIN prdct_mst AS pm ' + 
                  'ON sales.prdct_id = pm.prdct_id ' +
            ') AS s1 ' +
            'GROUP BY s1.prdct_id,s1.prdct_nm ' + 
            'ORDER BY s1.prdct_id'
  };
  connection.query(selectSalesQuery)
    .then(function(result) {
      var date_list = [];
      Object.keys(result[0]).forEach(function(key){
        if (key[0] === '_') {
          date_list.push(key);
        }
      });
      res.render('sales_trend_prdct_monthly', {
        title: "月別商品販売動向",
        lastYear: last_year.format('YYYY-MM'),
        nextYear: next_year.format('YYYY-MM'),
        dateList: date_list,
        salesList: result,
        year: year
      });
      res.end();
    })
    .catch(function(err){
      console.log(err.error);
      res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
      res.end();
    });
});

//localhost:3000/sales_trend_prdct_yearly
router.get('/sales_trend_prdct_yearly', function(req, res, next) {
  var dt = new Date();
  var year = dt.getFullYear();
  var select_date = "";
  for(var i=10; i>=0; i--){
    select_date += ',SUM(CASE DATE_TRUNC(\'YEAR\', s1.trade_date) WHEN \'' + (year - i) + '-01-01\' THEN s1.trade_num ELSE 0 END) AS "_' + (year - i) + '年" ';
  }
  var selectSalesQuery = {
    text: 'SELECT s1.prdct_id AS prdct_id ' +  
	              ',s1.prdct_nm AS prdct_nm ' +
	              select_date +
            'FROM ' +
            '( ' +
              'SELECT sales.prdct_id ' + 
                    ',pm.prdct_nm ' +
                    ',sales.trade_num ' + 
                    ',trade_date ' +
                'FROM sales ' +
                'LEFT OUTER JOIN prdct_mst AS pm ' + 
                  'ON sales.prdct_id = pm.prdct_id ' +
            ') AS s1 ' +
            'GROUP BY s1.prdct_id,s1.prdct_nm ' + 
            'ORDER BY s1.prdct_id'
  };
  connection.query(selectSalesQuery)
    .then(function(result) {
      var date_list = [];
      Object.keys(result[0]).forEach(function(key){
        if (key[0] === '_') {
          date_list.push(key);
        }
      });
      res.render('sales_trend_prdct_yearly', {
        title: "年別商品販売動向",
        dateList: date_list,
        salesList: result
      });
      res.end();
    })
    .catch(function(err){
      console.log(err.error);
      res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
      res.end();
    });
});

//localhost:3000/sales_trend_category_daily
router.get('/sales_trend_category_daily', function(req, res, next) {
  var dt = new Date(req.query.month);
  if (isNaN(dt)) {
    dt = new Date();
  }
  var year = dt.getFullYear();
  var month = dt.getMonth() + 1;
  var date = new Date(year, month, 0);
  var last_day = date.getDate();
  var select_date = "";
  var moment_date = moment(dt);
  for(var i=1; i<=last_day; i++){
    select_date += ',SUM(CASE s1.trade_date WHEN \'' + moment_date.format('YYYY-MM') + '-' + i  + '\' THEN s1.trade_num ELSE 0 END) AS "_' + i + '" ';
  }
  var selectSalesQuery = {
    text: 'SELECT s1.cat_cd AS cat_cd ' +
                ',s1.cat_nm AS cat_nm ' +
                select_date +
	          'FROM ' +
	          '( ' +
              'SELECT cat.cat_cd ' +
                    ',cat.cat_nm ' +
                    ',sales.prdct_id ' +
                 		',pm.prdct_nm ' + 
                 		',sales.trade_num ' +  
                 		',CAST(sales.trade_date AS DATE) AS trade_date ' +
	          	'FROM sales ' + 
	          	'LEFT OUTER JOIN prdct_mst AS pm ' + 
                'ON sales.prdct_id = pm.prdct_id ' +
              'LEFT OUTER JOIN category AS cat ' +
                'ON sales.cat_cd = cat.cat_cd ' +
	          ') AS s1 ' +
	          'GROUP BY s1.cat_cd,s1.cat_nm ' +
	          'ORDER BY s1.cat_cd'
  };
  next_month = moment(dt);
  next_month.add(1, 'M');
  last_month = moment(dt);
  last_month.add(-1, 'M'); 
  connection.query(selectSalesQuery)
    .then(function(result) {
      var date_list = [];
      Object.keys(result[0]).forEach(function(key){
        if(key[0] === '_'){
          date_list.push(key);
        }
      });
      res.render('sales_trend_category_daily', {
        title: "カテゴリ別販売動向",
        lastMonth: last_month.format('YYYY-MM'),
        nextMonth: next_month.format('YYYY-MM'),
        dateList: date_list,
        salesList: result,
        year: year,
        month: month
      });
      res.end();
    })
    .catch(function(err){
      console.log(err.error);
      res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
      res.end();
    });
});

//localhost:3000/sales_trend_category_weekly
router.get('/sales_trend_category_weekly', function(req, res, next) {
  var dt = new Date(req.query.month);
  if (isNaN(dt)) {
    dt = new Date();
  }
  var year = dt.getFullYear();
  var month = dt.getMonth() + 1;
  var date = new Date(year, month, 0);
  var last_day = date.getDate();
  var select_date = "";
  var moment_date = moment(dt);
  var first_date = new Date(year, dt.getMonth(), 1);
  var day_of_week = (first_date.getDay() == 0)?0:(7 -first_date.getDay());
  var first_sunday = new Date(year, dt.getMonth(), 1 + day_of_week);
  var fs = first_sunday.getDate();
  for(var i=fs; i<=last_day; i+=7){
    select_date += ',SUM(CASE sw.trade_week WHEN \'' + moment_date.format('YYYY/MM') + '/' + i  + '\' THEN sw.sales_week ELSE 0 END) AS "_' + month + '/' + i + '" ';
  }
  var selectSalesQuery = {
    text: 'SELECT sw.cat_cd ' +
                 ',sw.cat_nm ' +
                 select_date +
            	'FROM ( ' +
            'SELECT TO_CHAR(s1.trade_day - s1.day_of_the_week, \'yyyy/mm/dd\') AS trade_week ' +
            	  ',s1.cat_cd ' +
            	  ',s1.cat_nm ' +
            	  ',SUM(s1.trade_num) AS sales_week ' +
            	'FROM ' +
            	'( ' +
            		'SELECT CAST(sales.trade_date AS DATE) AS trade_day ' +
            		       ',pm.cat_cd ' +
            			     ',cat.cat_nm ' +
                       ',SUM(CASE WHEN sales.trade_num IS NULL THEN 0 ELSE sales.trade_num END) AS trade_num ' +
            			     ',CAST(extract(dow FROM sales.trade_date) AS INT ) AS day_of_the_week ' +
            			'FROM prdct_mst AS pm ' +
            			'LEFT OUTER JOIN sales ' +
                    'ON pm.prdct_id = sales.prdct_id ' +
                  'LEFT OUTER JOIN category AS cat ' +
                    'ON pm.cat_cd = cat.cat_cd ' +
            			'GROUP BY trade_day, pm.cat_cd, cat.cat_nm, day_of_the_week ' +
            			'ORDER BY trade_day ' +
                ') AS s1 ' +
            	'GROUP BY trade_week, s1.cat_cd, s1.cat_nm ' +
            	'ORDER BY trade_week ' +
            	') AS sw ' +
            	'GROUP BY sw.cat_cd, sw.cat_nm ' +
            	'ORDER BY sw.cat_cd'
  };
  next_month = moment(dt);
  next_month.add(1, 'M');
  last_month = moment(dt);
  last_month.add(-1, 'M');  
  connection.query(selectSalesQuery)
    .then(function(result) {
      var date_list = [];
      Object.keys(result[0]).forEach(function(key){
        if (key[0] === '_') {
          date_list.push(key);
        }
      });
      res.render('sales_trend_category_weekly', {
        title: "週別カテゴリ販売動向",
        lastMonth: last_month.format('YYYY-MM'),
        nextMonth: next_month.format('YYYY-MM'),
        salesList: result,
        dateList: date_list,
        year: year,
        month: month
      });
      res.end();
    })
    .catch(function(err){
      console.log(err.error);
      res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
      res.end();
    });
});

//localhost:3000/sales_trend_category_monthly
router.get('/sales_trend_category_monthly', function(req, res, next) {
  var dt = new Date(req.query.year);
  if (isNaN(dt)) {
    dt = new Date();
  }
  var year = dt.getFullYear();
  next_year = moment(dt);
  next_year.add(1, 'Y');
  last_year = moment(dt);
  last_year.add(-1, 'Y');
  var select_date = "";
  for(var i=1; i<=12; i++){
    select_date += ',SUM(CASE DATE_TRUNC(\'MONTH\', s1.trade_date) WHEN \'' + year + '-' + i +'-01\' THEN s1.trade_num ELSE 0 END) AS "_' + i + '月" ';
  }
  var selectSalesQuery = {
    text: 'SELECT s1.cat_cd AS cat_cd ' +  
	              ',s1.cat_nm AS cat_nm ' +
	              select_date +
            'FROM ' +
            '( ' +
              'SELECT sales.cat_cd ' + 
                    ',cat.cat_nm ' +
                    ',sales.trade_num ' + 
                    ',trade_date ' +
                'FROM sales ' +
                'LEFT OUTER JOIN category AS cat ' +
                  'ON sales.cat_cd = cat.cat_cd ' +
            ') AS s1 ' +
            'GROUP BY s1.cat_cd,s1.cat_nm ' + 
            'ORDER BY s1.cat_cd'
  };
  connection.query(selectSalesQuery)
    .then(function(result) {
      var date_list = [];
      Object.keys(result[0]).forEach(function(key){
        if (key[0] === '_') {
          date_list.push(key);
        }
      });
      res.render('sales_trend_category_monthly', {
        title: "月別カテゴリ販売動向",
        lastYear: last_year.format('YYYY-MM'),
        nextYear: next_year.format('YYYY-MM'),
        dateList: date_list,
        salesList: result,
        year: year
      });
      res.end();
    })
    .catch(function(err){
      console.log(err.error);
      res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
      res.end();
    });
});

//localhost:3000/sales_trend_category_yearly
router.get('/sales_trend_category_yearly', function(req, res, next) {
  var dt = new Date();
  var year = dt.getFullYear();
  var select_date = "";
  for(var i=10; i>=0; i--){
    select_date += ',SUM(CASE DATE_TRUNC(\'YEAR\', s1.trade_date) WHEN \'' + (year - i) + '-01-01\' THEN s1.trade_num ELSE 0 END) AS "_' + (year - i) + '年" ';
  }
  var selectSalesQuery = {
    text: 'SELECT s1.cat_cd AS cat_cd ' +  
	              ',s1.cat_nm AS cat_nm ' +
	              select_date +
            'FROM ' +
            '( ' +
              'SELECT sales.cat_cd ' + 
                    ',cat.cat_nm ' +
                    ',sales.prdct_id ' +
                    ',pm.prdct_nm ' +
                    ',sales.trade_num ' + 
                    ',trade_date ' +
                'FROM sales ' +
                'LEFT OUTER JOIN prdct_mst AS pm ' + 
                  'ON sales.prdct_id = pm.prdct_id ' +
                'LEFT OUTER JOIN category AS cat ' +
                  'ON sales.cat_cd = cat.cat_cd' +
            ') AS s1 ' +
            'GROUP BY s1.cat_cd,s1.cat_nm ' + 
            'ORDER BY s1.cat_cd'
  };
  connection.query(selectSalesQuery)
    .then(function(result) {
      var date_list = [];
      Object.keys(result[0]).forEach(function(key){
        if (key[0] === '_') {
          date_list.push(key);
        }
      });
      res.render('sales_trend_category_yearly', {
        title: "年別商品販売動向",
        dateList: date_list,
        salesList: result
      });
      res.end();
    })
    .catch(function(err){
      console.log(err.error);
      res.render('error', { message: 'Error', error: { status: err.code, stack: err.stack} });
      res.end();
    });
});

module.exports = router;  