import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { RequestStatus } from '../types';

interface StatusSelectProps {
  value: RequestStatus;
  onChange: (val: RequestStatus) => void;
}

// Русские названия статусов
const statusLabels: Record<RequestStatus, string> = {
  [RequestStatus.New]: 'Новая',
  [RequestStatus.InProgress]: 'В работе',
  [RequestStatus.Ready]: 'Готово',
  [RequestStatus.Closed]: 'Закрыта',
  [RequestStatus.Rejected]: 'Отклонена',
};

export default function StatusSelect({ value, onChange }: StatusSelectProps) {
  const options = Object.values(RequestStatus);

  return (
    <Listbox value={value} onChange={onChange}>
      <div className="relative mt-1 w-60">
        <Listbox.Button
          as="button"
          className="relative w-full cursor-pointer rounded-lg bg-[#0b2b26] py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
        >
          <span className="block truncate">{statusLabels[value]}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options
            as="div"
            className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#0b2b26] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm text-white"
          >
            {options.map((status) => (
              <Listbox.Option
                key={status}
                as="div"
                value={status}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-[#0d3b35]' : ''}`
                }
              >
                {({ selected }) => (
                  <>
                    <span className="block truncate">{statusLabels[status]}</span>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
