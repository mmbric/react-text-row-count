import React from 'react';

type RowCountProps = {
    children: React.ReactElement;
    onRowCountChanged?: (rowCount: number) => void;
};
declare function RowCount({ children, onRowCountChanged }: RowCountProps): any;

declare function calculateRowCount(element: HTMLElement): number;

export { RowCount, type RowCountProps, calculateRowCount };
