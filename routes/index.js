/*
 * GET home page.
 */

module.exports = {
    index: function (req, res) {

        var user = req.session.user;
        if (user != null && user != '') {
            res.render('index.html', {
                user: user
            });
        } else {
            var error = req.session.errorMsg;
            if (error != null && error != '') {
                req.session.errorMsg = null;
                res.render('index.html', {
                    error: error
                });
            } else
                res.render('index.html');
        }
    },
    signupAdmin: function (req, res) {
        var error = req.session.errorMsg;
        if (error != null && error != '') {
            req.session.errorMsg = null;
            res.render('signupAdmin.html', {
                error: error
            })
        } else res.render('signupAdmin.html');
    }
}
