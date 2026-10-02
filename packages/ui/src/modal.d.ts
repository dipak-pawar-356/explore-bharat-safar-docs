import * as React from 'react';
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}
export declare function Modal({ isOpen, onClose, title, description, children, className }: ModalProps): React.JSX.Element | null;
//# sourceMappingURL=modal.d.ts.map