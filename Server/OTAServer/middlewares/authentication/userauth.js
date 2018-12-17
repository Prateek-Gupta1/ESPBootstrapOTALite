
var UserManager = require('../../services/user');
const manager = new UserManager();

exports.authenticate = function(req, res, next){
  manager.exists(req.get('Authentication'))
  .then(result => {
    if(result) next();
  })
  .catch(err => {
    res.status(401).send({error: "User not registered."});
  });   
}