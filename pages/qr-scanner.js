import React from 'react';
import AppbarComponent from '../components/appbarComponent';
import QRScannerComponent from '@/components/qrScanner';

const QRScanner = () => {

    return (
        <>
            <AppbarComponent />
            <QRScannerComponent />
        </>
    );
};

export default QRScanner;