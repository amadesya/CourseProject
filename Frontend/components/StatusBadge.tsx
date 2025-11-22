import React from 'react';
import { RequestStatus } from '../types';

const statusLabels: Record<RequestStatus, string> = {
    [RequestStatus.New]: 'Новая',
    [RequestStatus.InProgress]: 'В работе',
    [RequestStatus.Ready]: 'Готова',
    [RequestStatus.Closed]: 'Закрыта',
    [RequestStatus.Rejected]: 'Отклонена',
};

const StatusBadge = ({ status }: { status: RequestStatus }) => {
    const statusClasses: Record<RequestStatus, string> = {
        [RequestStatus.New]: 'bg-blue-500/20 text-blue-300',
        [RequestStatus.InProgress]: 'bg-yellow-500/20 text-yellow-300',
        [RequestStatus.Ready]: 'bg-green-500/20 text-green-300',
        [RequestStatus.Closed]: 'bg-gray-500/20 text-gray-300',
        [RequestStatus.Rejected]: 'bg-red-500/20 text-red-300',
    };

    return (
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusClasses[status]}`}>
            {statusLabels[status]}
        </span>
    );
};

export default StatusBadge;
