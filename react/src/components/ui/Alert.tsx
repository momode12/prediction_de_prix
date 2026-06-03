import React from 'react';
import styles from "./Alert.module.scss";

interface AlertProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

export const Alert: React.FC<AlertProps> = ({ type, message }) => {
  return <div className={`${styles.alert} ${styles[type]}`}>{message}</div>;
};