# c.captcha

C.Imagecaptcha alias. c.captcha is a Express Session based Captcha for your Website that uses Imageselection to verify a client being a human.

## How to setup

1. Install Package <code>npm i c.imagecaptcha</code>

2. Setup Images for the Captcha to use

    2.1. Run: <code>node .\node_modules\c.imagecaptcha\devtools\setup.server.js</code>

    2.2. Use the Webinterface to Upload images, add a question and a correct Answer and submit.

3. Add Code to use your Captcha

    3.1. Server-side

        const captcha = require('c.imagecaptcha').create();

        //express needs to be setup
        express.use('/c.captcha',express.static('dist'));

        app.post('/captcha/challenge',captcha.challenge);

    3.2. To Check if User is Verified: <code>captcha.isVerified(req);</code> (use this on server side)

    3.3. Client-Side
    
    
        <link rel="stylesheet" href="/c.captcha/cdotcaptcha.min.css" >

        <script type="application/javascript" src="/c.captcha/cdotcaptcha.min.js"></script>

        <div id="captcha"></div>

        <script>

        var c = new CdotCaptcha("captcha","/captcha/challenge");

        </script>


Go ahead and pop this in your porject :)


	 
	 
	 


