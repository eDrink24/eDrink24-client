import { Form } from 'react-router-dom';

function LoginComponent() {
    return (
        <div>
            <Form method="post">
                아이디:<input type="text" name="loginId" />
                비밀번호:<input type="text" name="pw" />
                <div>
                    <button type="submit" name="login">로그인</button>
                </div>
            </Form>
        </div>
    )
}

export default LoginComponent;