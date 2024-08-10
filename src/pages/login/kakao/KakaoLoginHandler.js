import { useEffect, useState, useCallback } from "react";
import { useNavigate } from 'react-router-dom'; 
import AlertModal from '../../../components/alert/AlertModal.js';

const KakaoLoginHandler = (props) => {
    const code = new URL(window.location.href).searchParams.get("code"); 
    const navigate = useNavigate(); 
    
    const [alertOpen, setAlertOpen] = useState(false); 
    const [alertMessage, setAlertMessage] = useState(""); 
    const [navigateOnClose, setNavigateOnClose] = useState(false); 
    const [navigateClosePath, setNavigateClosePath] = useState(""); 

    const openAlert = (message, navigateOnClose = false, path = "") => {
        setAlertMessage(message);
        setAlertOpen(true);
        setNavigateOnClose(navigateOnClose);
        setNavigateClosePath(path);
    }

    const closeAlert = () => {
        setAlertOpen(false);
    }

    const sendCodeToBackend = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:8090/eDrink24/login/oauth2/kakao', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 'code': code })
            });

            if (response.ok) {  
                const resData = await response.json();

                const token = resData.token;
                const userId = resData.userId;
                const loginId = resData.loginId;

                localStorage.setItem('jwtAuthToken', token);
                localStorage.setItem('loginId', loginId);
                localStorage.setItem('userId', userId);

                openAlert("로그인에 성공하였습니다!", true, "/eDrink24");

            } else if (response.status === 401) { 
                const resData = await response.json();
                navigate("/eDrink24/kakao/signup", {state : {cusData: resData.customerDTO }});
            }
        } catch (error) {
            console.error('로그인 중 오류 발생', error);
        }
    }, [code, navigate]);

    useEffect(() => {
        sendCodeToBackend();
    }, [sendCodeToBackend]);

    return (
        <>
        <AlertModal
            isOpen={alertOpen}
            onRequestClose={closeAlert}
            message={alertMessage}
            navigateOnClose={navigateOnClose}
            navigateClosePath={navigateClosePath}
        />
        </>
    );
};

export default KakaoLoginHandler;
