const userModel = require('../models/userModel');

class UserManager {
    
    constructor() {}

    register(info) {
        const user = new userModel({
            name: info.name,
            email: info.email,
            phone: info.phone,
            password: info.password,
        });

        return user.register();
    }

    login(email, password) {
        return userModel.authenticate(email, password);
    }
}

module.exports = UserManager;