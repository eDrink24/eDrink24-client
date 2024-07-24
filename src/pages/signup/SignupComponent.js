import {
    Form,
    redirect,
    useActionData
} from 'react-router-dom';
import DaumPostcode from 'react-daum-postcode';
import { useState } from 'react';
import Modal from "react-modal";

function SignupComponent() {

    const data = useActionData();

    const [postalCode, setPostalCode] = useState("");
    const [roadAddress, setRoadAddress] = useState("");
    const [detailAddress, setDetailAddress] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const completeHandler = (data) => {
        console.log(">>", data);
        setPostalCode(data.zonecode);
        setRoadAddress(data.roadAddress);
        setIsOpen(false);
    }

    // Modal 스타일
    const customStyles = {
        overlay: {
            backgroundColor: "rgba(0,0,0,0.5)",
        },
        content: {
            left: "0",
            margin: "auto",
            width: "500px",
            height: "600px",
            padding: "0",
            overflow: "hidden",
        },
    };

    // 검색 클릭
    const toggle = (e) => {
        e.preventDefault(); // 검색 버튼 눌렀을 때 submit 안되게 
        setIsOpen(!isOpen); // 왜냐하면 sign up버튼 눌렀을 때 submit되야 하기 때문에 
    };                    // 이때 미리 submit되면 안됨.

    // 상세 주소검색 event
    const changeHandler = (e) => {
        setDetailAddress(e.target.value);
    }

    // 회원가입 완료 event
    const clickHandler = (e) => {
        if (detailAddress === "") {
            alert("상세주소를 입력해주세요.");
            e.preventDefault(); //상세주소 입력하지 않으면 submit 되지 않도록
        } else {
            console.log(postalCode, roadAddress, detailAddress);
        }
    }

    return (
        <div className="container">
            <div className="signup">
                <div className="signUpForm">
                    <Form method="post" >
                        {data && data.message && <p>{data.message}</p>}
                        <div>
                            <label htmlFor="loginId">userid:</label>
                            <input type="text" name="loginId" id="loginId" />
                        </div>
                        <div>
                            <label htmlFor="pw">password:</label>
                            <input type="password" name="pw" id="pw" />
                        </div>
                        <div>
                            <label htmlFor="userName">username:</label>
                            <input type="text" name="userName" id="userName" />
                        </div>
                        <div>
                            <label htmlFor="birthdate">birthdate:</label>
                            <input type="text" name="birthdate" id="birthdate" />
                        </div>
                        <div>
                            <input type="hidden" name="role" id="role" defaultValue='일반회원' />
                        </div>
                        <div>
                            <label htmlFor="gender">남</label>
                            <input type="radio" name="gender" id="genderMale" value="남" checked />

                            <label htmlFor="gender">여</label>
                            <input type="radio" name="gender" id="genderFemale" value="여" />
                        </div>
                        <div>
                            <label htmlFor="phoneNum">phoneNumber:</label>
                            <input type="text" name="phoneNum" id="phoneNum" />
                        </div>
                        <div>
                            <label htmlFor="email">email:</label>
                            <input type="text" name="email" id="email" />
                        </div>
                        <div>
                            <input name='postalCode' value={postalCode} readOnly placeholder="우편번호" />
                            <button onClick={toggle}>우편번호 검색</button>
                            <br />
                            <input name='address1' value={roadAddress} readOnly placeholder="도로명 주소" />
                            <br />
                            <Modal isOpen={isOpen} ariaHideApp={false} style={customStyles}
                                onRequestClose={() => setIsOpen(false)}>
                                <DaumPostcode onComplete={completeHandler} height="100%" />
                            </Modal>
                            <input type="text" name='address2' onChange={changeHandler} value={detailAddress} placeholder="상세주소" />
                            <br />
                        </div>

                        <div>
                            <button onClick={clickHandler} name="signup" className="btn btn-success m-5" >signup</button>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    );
}

export async function action({ request }) {

    // 회원가입폼 데이터 얻기
    const data = await request.formData();
    console.log(data.get("gender"));
    const authData = {
        loginId: data.get('loginId'),
        pw: data.get('pw'),
        userName: data.get("userName"),
        birthdate: data.get("birthdate"),
        gender: data.get("gender"),
        phoneNum: data.get("phoneNum"),
        email: data.get("email"),
        postalCode: data.get("postalCode"),
        address1: data.get("address1"),
        address2: data.get("address2")
    };

    return redirect("/eDrink24/login");
}

export default SignupComponent;