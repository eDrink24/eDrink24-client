import { redirect, useActionData, Form } from 'react-router-dom';
import "./LoginComponent.css";
import { useState } from 'react';

function LoginComponent() {
    const data = useActionData();
    console.log("useActionData: ", data);

    const [passwordVisible, setPasswordVisible] = useState(false);

    // 비밀번호 표시/숨기기 함수
    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handleRedirectHome = () => {
        window.location.href = "/eDrink24"
    }

    return (
        <div className="login-container">
            <header>
                <img src="assets/common/emart24_logo.png" alt="emart24 로고" />
                <button className="close-button" onClick={handleRedirectHome}>✕</button>
            </header>
            <div className='greet'>
                <h1>회원님,</h1>
                <h1>환영합니다 :)</h1>
            </div>
            <Form method="post">
                <input type="text" name="loginId" className="login-input" placeholder="아이디를 입력해 주세요" required />
                <div className="password-container">
                    <input type={passwordVisible ? "text" : "password"} name="pw" className="password-input" placeholder="비밀번호를 입력해 주세요" required />
                    <button type="button" className="show-password" onClick={togglePasswordVisibility}>
                        <img src="assets/login/eye-open.png" alt="hide 버튼" />
                    </button>
                </div>
                <button type="submit" className="login-button">로그인</button>
            </Form>
            <div className="options">
                <a href="#">아이디 찾기 ></a>
                <a href="#">비밀번호 찾기 ></a>
            </div>
            <div className="signup-options">
                <p>혹시, 계정이 없으신가요?</p>
                <button className="normal-signup">
                    <span>일반회원으로 가입하기</span>
                </button>
                <button className="google-signup">
                    <img src="assets/login/google.png" alt='kakao icon' />
                    <span>구글계정으로 가입하기</span>
                </button>
                <button className="kakao-signup">
                    <img src="assets/login/kakao.png" alt='kakao icon' />
                    <span>카카오로 가입하기</span>
                </button>
            </div>
        </div>
    );
}

export async function action({ request }) {
    const loginData = await request.formData();
    const authData = {
        loginId: loginData.get("loginId"),
        pw: loginData.get("pw")
    };
    console.log("authData: ", authData);

    const response = await fetch('http://localhost:8090/eDrink24/authenticate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(authData)
    });
    console.log("로그인 요청결과: ", response);

    const resData = await response.json();
    console.log("resData: ", resData);

    const token = resData.token;
    localStorage.setItem('jwtAuthToken', token);
    localStorage.setItem('userid', authData.loginId);

    return redirect('/eDrink24');
}

export default LoginComponent;
