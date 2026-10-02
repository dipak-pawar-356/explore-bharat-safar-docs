import * as React from 'react';
export interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
    side?: 'right' | 'left' | 'bottom';
}
export declare function Drawer({ isOpen, onClose, title, children, className, side, }: DrawerProps): React.JSX.Element | null;
//# sourceMappingURL=drawer.d.ts.map