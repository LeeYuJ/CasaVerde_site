import User from '../db/models/User';
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { userRole } from '../constants';

class UserService {

    static async checkEmailDuplicate(email) {
        const isEmailUnique = await User.findByEmail(email);
        if (isEmailUnique) {
            const errorMessage = "중복된 이메일 주소입니다.";
            return { errorMessage };
        }
        return isEmailUnique;
    }
    
    // 이메일 중복 검증을 이미 했는지 확인하는 방법?
    static async addUser(newUser) {
        const { email, password } = newUser;
        // 이메일 중복 검증
        const isEmailUnique = await this.checkEmailDuplicate(email);
        if (isEmailUnique) {
            const errorMessage = isEmailUnique.errorMessage;
            return { status: 409, errorMessage };
        }

        // role 검증
        // 클라이언트에서 받아올 값은 아니지만 잘못된 값 처리를 위한 로직
        if (typeof newUser.role !== 'undefined') {
            return { status: 403, errorMessage: "Invalid User Role." };
        }

        // 비밀번호 해쉬
        const hashedPassword = await bcrypt.hash(password, 10);
        const id = uuid();
        let { address, phone, name } = newUser;
        name = !name ? undefined : name;
        
        const validatedUser = { 
            id, email, password: hashedPassword,
            address, phone, name, role: 'USER'
        };
        const createNewUser = await User.create(validatedUser);
        // createNewUser error check
        if (!createNewUser) {
            const errorMessage = "회원가입에 실패하였습니다.";
            return { status: 409, errorMessage }
        }
        // success
        return createNewUser;
    }
}

export default UserService;