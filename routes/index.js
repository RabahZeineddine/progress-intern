/*
 * GET home page.
 */

module.exports = {
    index: function (req, res) {
        res.render('index.html');
    },
    registerAdmin: function(req,res){
        res.render('adminRegister.html');
    }
}
