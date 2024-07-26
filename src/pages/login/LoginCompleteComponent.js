import { redirect, useActionData, Form, useNavigate } from 'react-router-dom';
import "./LoginComponent.css";
import { useEffect, useState } from 'react';

function LoginComponent() {
    const data = useActionData();
    const navigate = useNavigate();

    const [errorMessage, setErrorMessage] = useState("");

    const handleRedirectHome = () => {
        window.location.href = "/eDrink24";
    };

    return (
        <div className="login-container">
            <header>
                <img src="assets/common/emart24_logo.png" alt="emart24 로고" />
                <button className="close-button" onClick={handleRedirectHome}>
                    <img src="assets/common/x-button.png" className="XButton" alt="closeXButton" />
                </button>
            </header>
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

    if (!response.ok) {
        if (response.status === 401) {
            return { error: "아이디 또는 패스워드가 잘못되었습니다." };
        } else {
            return { error: "서버에 문제가 발생했습니다. 나중에 다시 시도해 주세요." };
        }
    }

    const resData = await response.json();
    console.log("resData: ", resData);

    const token = resData.token;
    localStorage.setItem('jwtAuthToken', token);
    localStorage.setItem('userid', authData.loginId);

    return redirect('/eDrink24');
}

export default LoginComponent;
