import React from 'react';

interface LoaderProps {
    message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ message = "Loading..." }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 text-gray-400">
            <div className="w-8 h-8 border-4 border-cyan-400 border-dashed rounded-full animate-spin mb-4"></div>
            <p className="text-lg font-semibold text-gray-300">{message}</p>
        </div>
    );
};