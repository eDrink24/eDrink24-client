import React from 'react';
import Modal from 'react-modal';
import './AlertModal.css';
import { useNavigate } from 'react-router-dom';

Modal.setAppElement('#root');

const AlertModal = ({ isOpen, onRequestClose, message, navigateOnClose, navigateClosePath }) => {
    const navigate = useNavigate();

    const closeAlert = () => {
        onRequestClose();
        if (navigateOnClose && navigateClosePath) {
            navigate(navigateClosePath);
        }
    };

    const alertStyles = {
        overlay: {
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",               
            alignItems: "center",         
            justifyContent: "center",      
        },
        content: {
            margin: "auto",
            width: "300px",
            height: "180px",
            padding: "20px",
            borderRadius: "10px",
            textAlign: "center",
            backgroundColor: "#fff",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
  
        },
    };
    

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={closeAlert}
            style={alertStyles}
            contentLabel="알림"
        >
            <h2 className='alert-h2'>알림</h2>
            <p className='alert-p'>{message}</p>
            <button onClick={closeAlert} className="btn-alert-close">닫기</button>
        </Modal>
    );
};

export default AlertModal;

    // // ********************************************************
    // const [alertOpen, setAlertOpen] = useState(false); // 알림창 상태
    // const [alertMessage, setAlertMessage] = useState(""); // 알림창 메시지
    // const [navigateOnClose, setNavigateOnClose] = useState(false); // 모달 닫힐 때 navigate

    // // 알림창 열기
    // const openAlert = (message, navigateOnClose = false) => {
    //     setAlertMessage(message);
    //     setAlertOpen(true);
    //     setNavigateOnClose(navigateOnClose);
    // }

    // // 알림창 닫기
    // const closeAlert = () => {
    //     setAlertOpen(false);
    // }

    // useEffect(() => {
    //     if (data?.error) {
    //         openAlert(data.error);
    //         setLoginId("");
    //         setPw("");
    //     } else if (data?.success) {
    //         openAlert("로그인에 성공하였습니다!", true);
    //     }
    // }, [data]);
    // // ********************************************************

    
    // <AlertModal
    //     isOpen={alertOpen}
    //     onRequestClose={closeAlert}
    //     message={alertMessage}
    //     navigateOnClose={navigateOnClose}
    //     navigateClosePath={"/eDrink24"}
    // />