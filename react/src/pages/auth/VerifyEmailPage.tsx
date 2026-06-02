import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { Alert } from '../../components/ui/Alert';
import styles from './VerifyEmailPage.module.scss';

export const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      if (!token) return;
      try {
        await authService.verifyEmail(token);
        setStatus('success');
        setMessage('Email vérifié avec succès ! Vous pouvez maintenant vous connecter.');
        setTimeout(() => navigate('/login'), 3000);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Lien de vérification invalide ou expiré.');
      }
    };
    verify();
  }, [token, navigate]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Vérification de l'email</h2>
        {status === 'loading' && <p>Vérification en cours...</p>}
        {status === 'success' && <Alert type="success" message={message} />}
        {status === 'error' && <Alert type="error" message={message} />}
      </div>
    </div>
  );
};