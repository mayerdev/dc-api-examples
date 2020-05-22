// Controller class
module.exports = class Logged {
    // onLoad event
    // Will be executed before calling action method in controller.
    onLoad() {
        if (!this.session.user) return false;
    }

    /*
    * Login function
    * Route: /Logged/getSession
    */
    getSession() {
        this.send(this.session.user, 200);
    }
}