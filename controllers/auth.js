import User from '../models/user.model.js';
export function register(req, res) { 
    const newUser = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
      address: req.body.address,
      photo: req.body.photo,
    };

    User.create(newUser).then((result) => {
        
    }).catch((err) => {
        
    });
}