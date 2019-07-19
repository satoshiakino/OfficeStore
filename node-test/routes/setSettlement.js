module.exports = function(req, res, next) {
    var total_cash = req.session.total_cash;
    var total_cost = req.session.total_cost;
    var total_sales = req.session.total_sales;
    var profit_loss = req.session.profit_loss;
    var total_calc_cash = req.session.total_calc_cash;
    var excess_deficiency = req.session.excess_deficiency;
    console.log(total_cash);
    next();
};