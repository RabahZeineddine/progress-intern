function checkPasswordMatch(){
    var pwd = document.getElementById("password");
    var pwdConfirm = document.getElementById("confirmPassword");
    var btn = document.getElementById('signup-btn');
    
    if(pwd != null && pwdConfirm != null ){
        
        if(pwd.value.localeCompare(pwdConfirm.value) != 0 ){
            //Passwords don't match
            addClass(pwd.parentElement,"has-error");
            addClass(pwdConfirm.parentElement,"has-error");
            addHelpBlock(pwdConfirm.parentElement,"pwdBlockError","Passwords don't match!");
            btn.disabled = true;
        }else{
            removeClass(pwd.parentElement,"has-error");
            removeClass(pwdConfirm.parentElement,"has-error");
            removeHelpBlock(pwdConfirm.parentElement,"pwdBlockError");
            addClass(pwd.parentElement,"has-success");
            addClass(pwdConfirm.parentElement,"has-success");
            
            
            btn.disabled = false;
        }
        
    }
    
}

function addClass(element,customClass){
    if(element.className.indexOf(customClass) == -1 ) element.className+=" "+customClass;
}
function removeClass(element,customClass){
    element.className = element.className.replace(customClass,"");
}
function addHelpBlock(element,helpId,helpText){
    if(element.innerHTML.indexOf("help-block") == -1){
        var span = document.createElement('span');
        span.setAttribute("id",helpId);
        span.setAttribute("class","help-block");
        span.innerHTML = helpText;
        element.appendChild(span);
    }
//    element.innerHTML += "<span id='"+helpId+"' class='help-block'>"+helpText+"</span>";
}

function removeHelpBlock(element,helpID){
    element.removeChild(document.getElementById(helpID));
}