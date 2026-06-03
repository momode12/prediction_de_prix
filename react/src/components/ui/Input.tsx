import React from 'react';
import styles from "./Input.module.scss";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  as?: 'input' | 'select' | 'textarea';
  options?: { value: string; label: string }[];
}

export const Input: React.FC<InputProps> = ({ label, error, as = 'input', options, className, ...props }) => {
  let Component: 'input' | 'select' | 'textarea' = 'input';

  if (as === 'select') {
    Component = 'select';
  } else if (as === 'textarea') {
    Component = 'textarea';
  }
  
  return (
    <div className={`${styles.inputGroup} ${className || ''}`}>
      {label && <label className={styles.label}>{label}</label>}
      {as === 'select' && options ? (
        <select className={styles.input} {...(props as any)}>
          <option value="">Sélectionner...</option>
          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      ) : (
        <Component className={styles.input} {...(props as any)} />
      )}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
};