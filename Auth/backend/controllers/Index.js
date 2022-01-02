const { HttpController } = require('dc-api-core');

// Controller class
module.exports = class Index extends HttpController {
    // onLoad event
    // Will be executed before calling action method in controller.
    onLoad() {
        if (!this.session.user)
            // Drop request without response
            this.drop();
    }

    /*
     * Auth test action
     * Endpoint: /index/demo1
     */
    async demo1() {
        return 'This demo route available only for authorized users';
    }
}