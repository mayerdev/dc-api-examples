const { HttpController } = require('dc-api-core');
// Connect DBModule
const db = require('dc-api-mongo').connect();

// Controller class
module.exports = class Auth extends HttpController {
    /*
     * Login action
     * Endpoint: /auth/login
     */
    async login() {
        // Check fields
        if(!this.data || !this.data.login || !this.data.password) return this.send('fill_fields', 400);

        // Find user in database
        const isExists = await db.User.exists({
            login: this.data.login,
            // Password should be encrypted!
            password: this.data.password
        });

        // User not found
        if(!isExists) return this.send('incorrect', 403);

        // Set session data
        this.session.user = user._id;
        // Save session
        await this.session.save();

        // Send result "logged" with HTTP-code 200
        return 'logged';
    }

    /*
     * Register action
     * Endpoint: /auth/register
     */
    async register() {
        // Check fields
        if(!this.data || !this.data.firstname || !this.data.login || !this.data.password) return this.send('fill_fields', 400);

        // Check if user exists
        const isExists = await db.User.exists({ login: this.data.login });
        if(isExists) return this.send('user_exists', 400);

        // User not exists

        // Unsecure method
        // db.User.create(this.data);

        // Create user
        // Any unhandled thrown error inside controller's action will cause HTTP 500 error without additional handlers
        const user = await db.User.create({
            firstname: this.data.firstname,
            login: this.data.login,
            password: this.data.password
        });

        // Set session data
        this.session.user = user._id;
        // Save session
        await this.session.save();

        // User created
        return 'success';
    }
}
