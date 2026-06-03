import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import styles from './LoginPage.module.scss';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth() as { login?: (credentials: { email: string; password: string }) => Promise<void> } | undefined;
  const login = auth?.login;
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (!login) {
        throw new Error('Service d\'authentification indisponible');
      }
      await login({ email, password });
      navigate('/predictions');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Connexion</h2>
        {error && <Alert type="error" message={error} />}
        <form onSubmit={handleSubmit}>
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input label="Mot de passe" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <Button type="submit" isLoading={isLoading} className={styles.submitBtn}>Se connecter</Button>
        </form>
        <p className={styles.footer}>
          Pas encore de compte ? <Link to="/register">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
};