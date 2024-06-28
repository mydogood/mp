
import React, { FC, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const ClientIdManager: FC = () => {
    const { clientId } = useParams<{ clientId: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {

        if (clientId && (clientId.length < 15 || clientId.length > 18)) {
            navigate('/', { replace: true });
        }
    }, [clientId]);
    return null;
};

export default ClientIdManager;
