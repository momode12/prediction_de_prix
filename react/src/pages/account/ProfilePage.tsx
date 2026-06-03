import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/auth.service';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import styles from './ProfilePage.module.scss';

export const ProfilePage: React.FC = () => {
  const auth = useAuth() as { user?: any; updateUser?: (user: any) => void; logout?: () => void };
  const user = auth?.user;
  const updateUser = auth?.updateUser;
  const logout = auth?.logout;
  const [formData, setFormData] = useState({ username: user?.username ?? '', email: user?.email ?? '' });
  const [pwData, setPwData] = useState({ old_password: '', new_password: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleUpdateProfile = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await authService.updateProfile(formData);
      updateUser?.(res.user);
      setMsg('Profil mis à jour.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    }
  };

  const handleChangePassword = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await authService.changePassword(pwData.old_password, pwData.new_password);
      setMsg('Mot de passe modifié.');
      setPwData({ old_password: '', new_password: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    }
  };

  const handleDeleteAccount = async () => {
    if (globalThis.confirm('Êtes-vous sûr ? Cette action est irréversible et supprimira toutes vos prédictions.')) {
      try {
        await authService.deleteAccount();
        logout?.();
        globalThis.location.href = '/login';
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erreur');
      }
    }
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      <h2>Mon Profil</h2>
      {msg && <Alert type="success" message={msg} />}
      {error && <Alert type="error" message={error} />}

      <div className={styles.grid}>
        <div className={styles.card}>
          <h3>Informations</h3>
          <form onSubmit={handleUpdateProfile}>
            <Input label="Nom d'utilisateur" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
            <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <p className={styles.status}>Statut email : {user.is_verified ? <span className={styles.ok}>Vérifié ✅</span> : <span className={styles.ko}>Non vérifié ❌</span>}</p>
            <Button type="submit">Sauvegarder</Button>
          </form>
        </div>

        <div className={styles.card}>
          <h3>Sécurité</h3>
          <form onSubmit={handleChangePassword}>
            <Input label="Ancien mot de passe" type="password" value={pwData.old_password} onChange={e => setPwData({...pwData, old_password: e.target.value})} required />
            <Input label="Nouveau mot de passe" type="password" value={pwData.new_password} onChange={e => setPwData({...pwData, new_password: e.target.value})} required minLength={6} />
            <Button type="submit">Changer le mot de passe</Button>
          </form>
        </div>
      </div>

      <div className={`${styles.card} ${styles.dangerZone}`}>
        <h3>Zone de danger</h3>
        <p>La suppression de votre compte effacera définitivement toutes vos données et prédictions.</p>
        <Button variant="danger" onClick={handleDeleteAccount}>Supprimer mon compte</Button>
      </div>
    </div>
  );
};