import PropTypes from "prop-types";
import React from "react";
import "./HomeIndicator.css";

export const HomeIndicator = ({ darkMode, className }) => {
    return (
        <div className={`home-indicator ${className}`}>
            <div className="div" />
        </div>
    );
};

HomeIndicator.propTypes = {
    darkMode: PropTypes.bool,
};