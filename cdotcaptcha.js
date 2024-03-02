'use strict'

const fs = require('fs')
const basepath = "c.capcha-images";
const jsonfile = require('jsonfile')



const loadCaptcha = (id) => {

  if (!fs.existsSync(basepath+"/"+id)) {
    return false;
  }
  let data = jsonfile.readFileSync(basepath+"/"+id);
  data.id = id;

  return data;

};

const getRandomCaptcha = () => {

  var dir = fs.readdirSync(basepath);

  if(dir.length == 0)
    return false;

  return loadCaptcha(dir[Math.round(Math.random() * (dir.length - 1))]);

};

const arbitraryRandom = (min, max) => Math.random() * (max - min) + min;

const validate = (id,solution,tolerance,maxwrong) => {
  var c = loadCaptcha(id);

  if(!c || !solution || c.answer.length != solution.length)
    return false;

  let shouldbe = 0;
  let wrong = 0;
  for (let index = 0; index < c.answer.length; index++) {
    if(c.answer[index] != solution[index])
      wrong++;

    if(solution[index])
      shouldbe++;
  }

  if(wrong > maxwrong || wrong / (shouldbe == 0 ? 1 : shouldbe) > tolerance)
    return false;

  return true;
};


class CdotCaptcha {

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

  isVerified(req) {
    const status = req.session[this.params.sessionNomMap.userVerified]
    return (status);
  }


  clearVerification(req) {
    req.session[this.params.sessionNomMap.userVerified] = null;
  }


  challenge = (req, res) =>  {

    var sid = req.sessionID;

    
    if(this.checking.has(sid))
      return res.json( { status: 'wait'} );

      if (req.session === undefined) {

          throw Error('captcha requires express-session!')

      }

      this.checking.add(sid);
      setTimeout((() => {
        this.checking.delete(sid);
 
        const id = req.session[this.params.sessionNomMap.capchaId]


        if(this.isVerified(req))
          return res.json( { status: 'success'} );

        var verifyStatus = req.session[this.params.sessionNomMap.verifyStatus];  
      
        if(validate(id,req.body.solution,this.params.tolerance,this.params.maxwrong))
          verifyStatus = verifyStatus ? verifyStatus + 1 : 1;
        else
          verifyStatus = 0;
        
        if(this.params.steps > verifyStatus)
        {
          req.session[this.params.sessionNomMap.verifyStatus] = verifyStatus;

          const c = getRandomCaptcha();
          req.session[this.params.sessionNomMap.capchaId] = c.id;

          //remove answer before sending to client
          c.answer = null;
          return res.json( { status: 'challenged',challenge:c} );

        }   

        req.session[this.params.sessionNomMap.verifyStatus] = null;
        req.session[this.params.sessionNomMap.userVerified] = true;
        req.session[this.params.sessionNomMap.capchaId] = null;

        return res.json( { status: 'success'} );

      }), arbitraryRandom(this.params.timeout.min,this.params.timeout.max))

      
  }




}

module.exports.create = params => new CdotCaptcha(params);