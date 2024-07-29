import { redirect } from 'react-router-dom';

export function LogoutComponent() {
    return null;
}

export function action() {
    console.log("localStorage:", localStorage);

    localStorage.removeItem('jwtAuthToken');
    localStorage.removeItem('userid');
}