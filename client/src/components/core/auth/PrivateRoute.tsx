import React from 'react'
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom';

const PrivateRoute: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {

    const {token} = useSelector((state: any) => state.auth);

    if(token !== null)
        return children
    else
        return <Navigate to="/login" />

}

export default PrivateRoute
