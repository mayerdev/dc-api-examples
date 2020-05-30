// Connect DBModule
const db = require('dc-api-core/DB').mongo();

// Controller class
module.exports = class Auth {
    /*
    * Login function
    * Route: /Index/demo1
    */
    async demo1() {
        this.send('This is demo route');
    }
}