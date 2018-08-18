var Env = '';
var cmd = require('./config/setupEnv.js');
cmd.question('Please specify the Environment to run the Node Server (dev,prod,staging,test,local) \n: ', (answer) => {
  global.Env = answer;
  if(global.Env == 'local' || global.Env == 'dev' || global.Env == 'prod' || global.Env == 'staging' || global.Env == "test"){
    console.info('Thank you for choosing ',answer);
    require('./config/main.js');
    // startApp(global.Env);
  }else{
    console.info("Please Enter valid Environment to start Node Js"); 
  }
  cmd.close();
});
