import { HttpController } from 'dc-api-core/contexts/Http';
import { LoginData } from '../interfaces/Auth';
import { connect } from 'dc-api-mongo';

const db = connect();

export default class Auth extends HttpController {
    async login() {
        const data: LoginData = this.data;
        
        const user: User = await db.User.findOne({ email: data.email });
        console.log(user.email);

        return data.email;
    }
}