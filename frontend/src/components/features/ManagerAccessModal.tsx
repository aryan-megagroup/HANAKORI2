import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ManagerAccessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ManagerAccessModal: React.FC<ManagerAccessModalProps> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [password, setPassword] = useState('');

    const handleAuthenticate = () => {
        if (password === '0000') {
            setPassword('');
            onClose();
            window.location.href = '/manager';
        } else {
            alert('Invalid passcode');
            setPassword('');
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            setPassword('');
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[22rem] rounded-[2rem] border-none bg-white p-6 pb-8 shadow-2xl outline-none">

                <DialogTitle className="mb-6 mt-2 flex items-center justify-center gap-2 text-center text-2xl font-black text-slate-700">
                    🔑 {t('manager_access.title')}
                </DialogTitle>

                <div className="flex flex-col gap-4">
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••"
                        className="h-14 w-full rounded-2xl border-none bg-[#E8F0FE] text-center text-4xl tracking-[0.2em] text-slate-800 focus-visible:ring-2 focus-visible:ring-blue-300"
                    />

                    <Button
                        onClick={handleAuthenticate}
                        className="h-14 w-full rounded-2xl bg-[#FFC0CB] text-lg font-bold text-slate-700 hover:bg-[#ffb0be]"
                    >
                        {t('manager_access.authenticate')}
                    </Button>
                </div>

            </DialogContent>
        </Dialog>
    );
};