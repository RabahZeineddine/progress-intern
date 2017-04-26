/*
 * GET home page.
 */

module.exports = {
    index: function (req, res) {
        res.render('index.html');
    },
    signupAdmin: function(req,res){
        var error = req.session.errorMsg;
        if(error != null && error!= ''){ 
            req.session.errorMsg = null;
            res.render('signupAdmin.html',{error : error})}
        else res.render('signupAdmin.html');
    }
}
