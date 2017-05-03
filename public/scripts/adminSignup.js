function checkPasswordMatch() {
    var pwd = document.getElementById("password");
    var pwdConfirm = document.getElementById("confirmPassword");
    var btn = document.getElementById('signup-btn');

    if (pwd != null && pwdConfirm != null) {

        if (pwd.value.localeCompare(pwdConfirm.value) != 0) {
            //Passwords don't match
            addClass(pwd.parentElement, "has-error");
            addClass(pwdConfirm.parentElement, "has-error");
            addHelpBlock(pwdConfirm.parentElement, "pwdBlockError", "Passwords don't match!");
            btn.disabled = true;
        } else {
            removeClass(pwd.parentElement, "has-error");
            removeClass(pwdConfirm.parentElement, "has-error");
            removeHelpBlock(pwdConfirm.parentElement, "pwdBlockError");
            addClass(pwd.parentElement, "has-success");
            addClass(pwdConfirm.parentElement, "has-success");


            btn.disabled = false;
        }

    }

}

function addClass(element, customClass) {
    if (element.className.indexOf(customClass) == -1) element.className += " " + customClass;
}

function removeClass(element, customClass) {
    element.className = element.className.replace(customClass, "");
}

function addHelpBlock(element, helpId, helpText) {
    if (element.innerHTML.indexOf("help-block") == -1) {
        var span = document.createElement('span');
        span.setAttribute("id", helpId);
        span.setAttribute("class", "help-block");
        span.innerHTML = helpText;
        element.appendChild(span);
    }
    //    element.innerHTML += "<span id='"+helpId+"' class='help-block'>"+helpText+"</span>";
}

function removeHelpBlock(element, helpID) {
    if (document.getElementById(helpID)) element.removeChild(document.getElementById(helpID));
}


var firstname, lastname, w3_id, userType, superUser_id, password;

function stepCheck(num) {
    var btn = document.getElementById('next-btn');
    if (num == 1) {
        var fname = document.getElementById('firstName');
        var lname = document.getElementById('lastName');

        if (fname != null && lname != null && fname.value != '' && lname.value != '') {

            var error = false;
            if (fname.value.length <= 2) {
                error = true;
                addClass(fname.parentElement, "has-error");
                addHelpBlock(fname.parentElement, "firstNameHelp", "Firstname must be at least 2 characters.");
            } else {
                removeClass(fname.parentElement, "has-error");
                removeHelpBlock(fname.parentElement, "firstNameHelp");
            }

            if (lname.value.length <= 2) {
                error = true;
                addClass(lname.parentElement, "has-error");
                addHelpBlock(lname.parentElement, "lastNameHelp", "Lastname must be at least 2 characters.");

            } else {
                removeClass(lname.parentElement, "has-error");
                removeHelpBlock(lname.parentElement, "lastNameHelp");
            }
            if (error) {
                btn.disabled = true;
            } else {
                btn.disabled = false;
            }
        } else {
            btn.disabled = true;
        }

    } else if (num == 2) {
        var email = document.getElementById('w3_id');
        if (email != null) {
            if (validateEmail(email.value)) {
                btn.disabled = false;
                removeClass(email.parentElement, "has-error");
                removeHelpBlock(email.parentElement, "emailHelp");
            } else {
                btn.disabled = true;
                addClass(email.parentElement, "has-error");
                addHelpBlock(email.parentElement, "emailHelp", "Invalid email!.");
            }
        }
    } else if (num == 22) {
        //Check the manager id ... doesn t exist now..
        var manager_id = document.getElementById('Manager_id');
        if (manager_id != null && manager_id.value != '') {
            btn.disabled = false;
        } else {
            btn.disabled = true;
        }
    } else if (num == 3) {
        var pwd = document.getElementById("password");
        var pwdConfirm = document.getElementById("confirmPassword");
        if (pwd != null && pwdConfirm != null && pwd.value != '' && pwdConfirm.value != '') {
            if (pwd.value.localeCompare(pwdConfirm.value) != 0) {
                //Passwords don't match
                addClass(pwd.parentElement, "has-error");
                addClass(pwdConfirm.parentElement, "has-error");
                addHelpBlock(pwdConfirm.parentElement, "pwdBlockError", "Passwords don't match!");
                btn.disabled = true;
            } else {
                removeClass(pwd.parentElement, "has-error");
                removeClass(pwdConfirm.parentElement, "has-error");
                removeHelpBlock(pwdConfirm.parentElement, "pwdBlockError");
                addClass(pwd.parentElement, "has-success");
                addClass(pwdConfirm.parentElement, "has-success");
                btn.disabled = false;
            }

        } else {
            removeClass(pwd.parentElement, "has-error");
            removeClass(pwdConfirm.parentElement, "has-error");
            removeHelpBlock(pwdConfirm.parentElement, "pwdBlockError");
        }

    }

}

function goToStep(num) {
    var div = document.getElementById('stepsDiv');
    if (num == 1) {
        firstname = document.getElementById('firstName').value;
        lastname = document.getElementById('lastName').value;
        addClass(document.getElementById('step' + num), 'filled');
        div.innerHTML = '<div class="form-group"><label for="w3_id" class="col-sm-2 control-label">W3-id</label><div class="col-sm-10"><input type="email" class="form-control" id="w3_id" placeholder="W3-id (ex: IBMer@br.ibm.com )" oninput="stepCheck(2)"></div></div>' +
            '<div class="form-group"><div class="col-sm-offset-3 col-sm-8 col-xs-12"><button type="button" class="btn  btn-block btn-login" id="next-btn"  onclick="goToStep(2)" disabled> Next</button></div></div>';

    } else if (num == 2) {
        w3_id = document.getElementById('w3_id').value;
        showLoadingMessage();
        xhrGet('/api/checkW3ID?w3_id=' + w3_id, function (data) {
                stopLoadingMessage('Next');
                if (data.authorized && !data.exists) {
                    userType = data.userType;

                    if (data.userType != "manager") goToStep(22);
                    else
                        goToStep(3);

                } else {
                    alertErrorMessage(data.errorMsg);
                }
            },
            function (err) {
                console.log(err);
                alertErrorMessage('An error occured! Try again later.');
            })

    } else if (num == 22) {

        document.getElementById('alert_msg').innerHTML = '';
        div.innerHTML = '<div class="form-group"><label for="Manager_id" class="col-sm-2 control-label">Manager id</label><div class="col-sm-10"><input type="text" class="form-control" id="Manager_id" placeholder="Manager id" oninput="stepCheck(22)"></div></div>' +
            '<div class="form-group"><div class="col-sm-offset-3 col-sm-8 col-xs-12"><button type="submit" class="btn  btn-block btn-login" id="next-btn"  onclick="goToStep(3)" disabled> Next</button></div></div>';
    } else if (num == 3) {
        //        addClass(document.getElementById('step' + 2), 'filled');
        var sup = document.getElementById('Manager_id');
        if (sup != null) superUser_id = sup.value;

        if (superUser_id !== null && superUser_id != '' && sup != null) {
            //Validate manager id 
            showLoadingMessage();
            xhrGet('/api/checkManagerID?id=' + superUser_id, function (data) {
                    stopLoadingMessage('Next');
                    if (data.authorized && !data.error) {
                        goToStep(4);
                    } else {
                        alertErrorMessage(data.errorMsg);
                    }
                },
                function (err) {
                    console.log(err);
                    alertErrorMessage('An error occured! Try again later.');
                })

        } else {
            goToStep(4);
        }

    } else if (num == 4) {
        addClass(document.getElementById('step' + 2), 'filled');
        div.innerHTML = '<div class="form-group"><label for="password" class="col-sm-2 control-label">Password</label><div class="col-sm-10"><input type="password" class="form-control" id="password" placeholder="Password" oninput="stepCheck(3)"></div></div><div class="form-group"><label for="confirmPassword" class="col-sm-2 control-label">Confirm password</label><div class="col-sm-10"><input type="password" class="form-control" id="confirmPassword" placeholder="Confirm password" oninput="stepCheck(3)"></div></div>' +
            '<div class="form-group"><div class="col-sm-offset-3 col-sm-8 col-xs-12"><button type="button" class="btn  btn-block btn-login" id="next-btn"  onclick="goToStep(5)" disabled> Finish</button></div></div>';

    } else if (num == 5) {
        var pwd = document.getElementById('password');

        if (pwd != null && pwd.value != '') {
            password = pwd.value;
            if (superUser_id == null || superUser_id == '') superUser_id = generateManagerId(w3_id);
            var user = {
                firstname: firstname,
                lastname: lastname,
                w3_id: w3_id,
                userType: userType,
                manager_id: superUser_id,
                password: password
            };
            showLoadingMessage();
            xhrPost('/api/createAccount', user, function (data) {
                stopLoadingMessage('Finish');
                if (!data.error) {
                    window.location = data.redirect;
                } else {
                    alertErrorMessage(data.errorMsg);
                }
            }, function (err) {
                console.log(err);
                alertErrorMessage('An error occured! Try again later.');
            });
        }

    }
}


function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}


function alertErrorMessage(msg) {
    var alert_div = document.getElementById('alert_msg');
    alert_div.innerHTML = "<div class='alert alert-danger' role='alert'>" + msg + "<button type='button' class='close' data-dismiss='alert' aria-label='Close'> <span aria-hidden='true'>&times;</span></button></div>";

    setTimeout(function () {
        alert_div.innerHTML = "";
    }, 3000);
}


function generateManagerId(email) {
    return email.split("@")[0];
}

//window.onbeforeunload = function(e) {
//    
//  return 'Data you have entered may not be saved.';
//};


function showLoadingMessage() {
    document.getElementById('next-btn').innerHTML = '<img src="images/ring.gif" style="width:25px;"/>';
}

function stopLoadingMessage(msg) {
    document.getElementById('next-btn').innerHTML = msg;
}
