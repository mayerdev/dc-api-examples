// Controller class
module.exports = class Index {
    // onLoad event
    // Will be executed before calling action method in controller.
    onLoad() {
        if (!this.session.user)
            // Drop request
            return true;
    }

    /*
     * Login function
     * Route: /Index/demo1
     */
    async demo1() {
        this.send('This demo route available only for authorized users');
    }
}