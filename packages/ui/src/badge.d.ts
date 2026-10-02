import * as React from 'react';
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'saffron' | 'evergreen' | 'terracotta' | 'outline' | 'slate';
}
export declare function Badge({ className, variant, ...props }: BadgeProps): React.JSX.Element;
//# sourceMappingURL=badge.d.ts.map