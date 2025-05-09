'use client';

import { useEffect } from 'react';

interface NotificationProps {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    details?: string;
    isVisible: boolean;
    onClose: () => void;
    autoHideDuration?: number;
}

export default function Notification({
    type,
    message,
    details,
    isVisible,
    onClose,
    autoHideDuration = 5000
}: NotificationProps) {
    // Auto-hide après la durée spécifiée
    useEffect(() => {
        if (isVisible && autoHideDuration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, autoHideDuration);

            return () => clearTimeout(timer);
        }
    }, [isVisible, autoHideDuration, onClose]);

    // Si la notification n'est pas visible, ne rien afficher
    if (!isVisible) return null;

    // Configuration des couleurs et icônes en fonction du type
    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    text: 'text-green-800',
                    buttonText: 'text-green-700',
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )
                };
            case 'error':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    text: 'text-red-800',
                    buttonText: 'text-red-700',
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200',
                    text: 'text-yellow-800',
                    buttonText: 'text-yellow-700',
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    )
                };
            case 'info':
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    text: 'text-blue-800',
                    buttonText: 'text-blue-700',
                    icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <div className={`mb-4 ${styles.bg} border ${styles.border} ${styles.text} rounded-md p-4 flex items-start`}>
            <div className="mr-2 mt-0.5">
                {styles.icon}
            </div>

            <div>
                <p className="font-medium">{message}</p>
                {details && <p className="text-sm mt-1">{details}</p>}
            </div>

            <button
                className={`ml-auto ${styles.buttonText}`}
                onClick={onClose}
                aria-label="Fermer"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
} 