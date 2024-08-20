import React, { useState } from 'react';
import './AdminComponent.css';
import ShowOrdersPageComponent from './ShowTodayPickupPageComponent'; // 경로를 실제 경로로 수정
import AdminOrderComponent from './AdminOrderComponent';
import AdminOrderListComponent from './AdminOrderListComponent';
import PickupCompletedPageComponent from './TodayPickupCompletedPageComponent';
import ShowReservationPickupComponent from './ShowReservationPickupComponent';

const AdminComponent = () => {
    const [activeTab, setActiveTab] = useState('즉시픽업 목록');

    const handleTabClick = (tabName) => {
        setActiveTab(tabName);
    };

    const renderingComponent = () => {
        switch (activeTab) {
            case '즉시픽업 목록':
                return <ShowOrdersPageComponent />;
            case '픽업 완료내역':
                return <PickupCompletedPageComponent />;
            case '발주신청':
                return <AdminOrderComponent />;
            case '즉시발주신청':
                return <ShowReservationPickupComponent />;
            case '발주신청내역':
                return <AdminOrderListComponent />;
            default:
                return <ShowOrdersPageComponent />;
        }
    };

    return (
        <div className="admin-form-container">
            <div className="admin-tabs">
                <span onClick={() => handleTabClick('즉시픽업 목록')}>즉시픽업 목록</span>
                <span onClick={() => handleTabClick('픽업 완료내역')}>픽업 완료내역</span>
                <span onClick={() => handleTabClick('발주신청')}>발주신청</span>
                <span onClick={() => handleTabClick('즉시발주신청')}>즉시발주신청</span>
                <span onClick={() => handleTabClick('발주신청내역')}>발주신청내역</span>
            </div>
            <div className="content">
                {renderingComponent()}
            </div>
        </div>
    );
};

export default AdminComponent;
