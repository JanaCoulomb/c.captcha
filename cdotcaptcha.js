'use strict'

const fs = require('fs')
const basepath = "c.capcha-images";
const jsonfile = require('jsonfile')

// --------------------------------------------------------
// ------------- utility functions ------------------------
// --------------------------------------------------------

// random range

const arbitraryRandom = (min, max) => Math.random() * (max - min) + min;

// load a captcha challange file from json to obejct

const loadCaptchaChallange = (id) => {

  if (!fs.existsSync(basepath+"/"+id)) {
    return false;
  }
  let data = jsonfile.readFileSync(basepath+"/"+id);
  data.id = id;

  return data;

};

// select a random captcha

const getRandomCaptcha = () => {

  var dir = fs.readdirSync(basepath);

  if(dir.length == 0)
    return false;

  return loadCaptchaChallange(dir[Math.round(Math.random() * (dir.length - 1))]);

};

// validate if a cptcha is worng(correct)

const validate = (id,solution,tolerance,maxwrong) => {
  var c = loadCaptchaChallange(id);

  // if params missing, we return

  if(!c || !solution || c.answer.length != solution.length)
    return false;

  // get wrong answer amount and the amount of ansers that should be correct in total

  let shouldbe = 0;
  let wrong = 0;
  for (let index = 0; index < c.answer.length; index++) {
    if(c.answer[index] != solution[index])
      wrong++;

    if(solution[index])
      shouldbe++;
  }

  // do some comparing of these numbers:
  // return false if wrong is bigger than max wrong param
  // return false if there are too many wrong answers based on a tolerance relativ to the amount of answers that would need to be correct, we do this to allow small mistakes to be made by the user, expecially if a lot of fields need to be selected

  if(wrong > maxwrong || wrong / (shouldbe == 0 ? 1 : shouldbe) > tolerance)
    return false;

  return true;
};

// --------------------------------------------------------
// ------------- the main class ---------------------------
// --------------------------------------------------------


class CdotCaptcha {

  //params are used to configure the captcha

  constructor(params) {
      params = params || {}
      params.tolerance = params.tolerance || 0.5
      params.maxwrong = params.maxwrong || 2
      params.steps = params.steps || 2
      params.timeout = params.timeout || {min:2000,max:4000}
      params.sessionNomMap = params.sessionNomMap || {}
      params.sessionNomMap.capchaId = params.sessionNomMap.capchaId || 'cdotcaptchacapchaId'
      params.sessionNomMap.userVerified = params.sessionNomMap.userVerified || 'cdotcaptchauserVerified'
      params.sessionNomMap.verifyStatus = params.sessionNomMap.verifyStatus || 'cdotcaptchaverifyStatus'
      this.params = params

      this.checking = new Set();

  }

  //a method to check if a req session is verified (can be used in a form submit method for example)

  isVerified(req) {
    const status = req.session[this.params.sessionNomMap.userVerified]
    return (status);
  }

  //delete info about a session being verified

  clearVerification(req) {
    req.session[this.params.sessionNomMap.userVerified] = null;
  }

  //a challange for serving using express (this will be the logic behind a link that the client side javascript gets)

  challenge = (req, res) =>  {

    var sid = req.sessionID;

    //if we are still checking this session we retunr wait!
    
    if(this.checking.has(sid))
      return res.json( { status: 'wait'} );

    //session is undefined, we retunr session missing

    if (req.session === undefined) {

      throw Error('captcha requires express-session!')

    }

    //we add current session id to checking

    this.checking.add(sid);

    //we set time out for artificial response time

    setTimeout((() => {

      //we delete session id because the wait is over

      this.checking.delete(sid);

      //if user is verfified we return success

      if(this.isVerified(req))
        return res.json( { status: 'success'} );

      //get captcha challanges id from session

      const id = req.session[this.params.sessionNomMap.capchaId]

      // getting verified status from session

      var verifyStatus = req.session[this.params.sessionNomMap.verifyStatus];  
    
      //check if user input is valid and set validation status accordingly

      if(validate(id,req.body.solution,this.params.tolerance,this.params.maxwrong))
        verifyStatus = verifyStatus ? verifyStatus + 1 : 1;
      else
        verifyStatus = 0;

      // check if user is still missing steps for complete verification
      
      if(this.params.steps > verifyStatus)
      {
        req.session[this.params.sessionNomMap.verifyStatus] = verifyStatus;

        const c = getRandomCaptcha();
        req.session[this.params.sessionNomMap.capchaId] = c.id;

        //remove answer before sending to client

        c.answer = null;

        // retunr challange for client

        return res.json( { status: 'challenged',challenge:c} );

      }   

      // reset sessions not needed and srt verified sesion as true

      req.session[this.params.sessionNomMap.verifyStatus] = null;
      req.session[this.params.sessionNomMap.userVerified] = true;
      req.session[this.params.sessionNomMap.capchaId] = null;

      //return success

      return res.json( { status: 'success'} );

    }), arbitraryRandom(this.params.timeout.min,this.params.timeout.max))

    
}    




}

//export main class

module.exports.create = params => new CdotCaptcha(params);