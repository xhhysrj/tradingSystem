import { ReactNode } from 'react';

interface ConfirmModalProps {
    title: string;
    message: string | ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
}

export function ConfirmModal({ title, message, onConfirm, onCancel }: ConfirmModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
                <div className="text-gray-700 dark:text-gray-300 mb-6">{message}</div>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        取消
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white"
                    >
                        确定
                    </button>
                </div>
            </div>
        </div>
    );
}