const [alertOpen, setAlertOpen] = useState(false); // 알림창 상태
const [alertMessage, setAlertMessage] = useState(""); // 알림창 메시지

// 알림창 열기
const openAlert = (message) => {
    setAlertMessage(message);
    setAlertOpen(true);
}

// 알림창 닫기
const closeAlert = () => {
    setAlertOpen(false);
}


{/* 알림창 */ }
<Modal
    isOpen={alertOpen}
    onRequestClose={closeAlert}
    style={alertStyles}
    contentLabel="Alert"
>
    <h2>알림</h2>
    <p>{alertMessage}</p>
    <button onClick={closeAlert} className="btn-alert-close">닫기</button>
</Modal>

// 알림창 스타일
const alertStyles = {
    overlay: {
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    content: {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
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

// 알림창 스타일
// .btn-alert-close {
//     width: 100px;
//     padding: 10px;
//     background-color: #f0c040;
//     border: none;
//     border-radius: 5px;
//     color: #fff;
//     font-size: 14px;
//     font-weight: bold;
//     cursor: pointer;
//     margin-top: 20px;
// }

// .btn-alert-close:hover {
//     background-color: #e0a030;
// }
