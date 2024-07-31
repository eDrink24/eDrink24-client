import React from 'react';
import './CategoryComponent.css';

const CategoryComponent = () => {
    return (
      <div className="cagegory-container">
        <div>
        <img src="assets/common/emart24_logo.png" alt="emart24 로고" />
        <button className="close-button" >
        <img src="assets/common/x-button.png" className="XButton" alt="closeXButton" />
        </button>
        </div>
      </div>
    );
  };


export default CategoryComponent;
