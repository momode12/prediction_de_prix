import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import styles from './RegisterPage.module.scss';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      await authService.register(formData);
      setSuccess('Compte créé ! Un email de vérification vous a été envoyé.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      const errs = err.response?.data?.errors;
      setError(errs ? Object.values(errs).flat().join(', ') : 'Erreur lors de l\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2>Inscription</h2>
        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}
        <form onSubmit={handleSubmit}>
          <Input label="Nom d'utilisateur" name="username" value={formData.username} onChange={handleChange} required />
          <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
          <Input label="Mot de passe" name="password" type="password" value={formData.password} onChange={handleChange} required minLength={6} />
          <Button type="submit" isLoading={isLoading} className={styles.submitBtn}>S'inscrire</Button>
        </form>
        <p className={styles.footer}>
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};