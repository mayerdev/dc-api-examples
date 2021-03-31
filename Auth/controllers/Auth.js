// Connect DBModule
const db = require('dc-api-core/DB').mongo();

// Controller class
module.exports = class Auth {
    /*
     * Login function
     * Route: /Auth/login
     */
    async login() {
        // Check fields
        if(!this.data || !this.data.login || !this.data.password) return this.send('fill_fields', 400);

        // Unsecure method
        // db.User.findOne(this.data);

        // Find user in database
        const user = await db.User.findOne({
            login: this.data.login,
            // Attention. Password must be encrypted!
            password: this.data.password
        }).select('_id').lean();

        // Check user
        if(!user) return this.send('incorrect', 403); // Not logged

        // Here user is logged
        // Set session
        this.session.user = user._id;
        // Save session
        await this.session.save();

        // Send result "logged" with HTTP-code 200
        this.send('logged');
    }

    /*
     * Register function
     * Route: /Auth/register
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
        const user = await db.User.create({
            firstname: this.data.firstname,
            login: this.data.login,
            password: this.data.password
        });

        // Set session
        this.session.user = user._id;
        // Save session
        await this.session.save();

        // Deprecated
        // if(!create) return this.send('database_error', 500);
        // If there is an error in the database, an error 500 will be returned automatically without additional handlers

        // User created
        this.send('success');
    }
}
