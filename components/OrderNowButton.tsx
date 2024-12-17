import { TruckIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import type { FC } from 'react';

const OrderNowButton: FC = () => {
  return (
    <Link
      href="https://www.doordash.com/store/el-pueblito/"
      className="group relative mr-4 animate-float"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Order from El Pueblito on DoorDash"
    >
      <div
        className="-inset-1 absolute animate-tilt rounded-xl bg-gradient-to-t from-yellow-300 via-pueb to-yellow-500 opacity-40 blur-md group-hover:opacity-20 group-hover:transition-shadow"
        aria-hidden="true"
      />
      <button
        type="button"
        className="group relative mx-auto flex w-full items-center divide-x divide-zinc-950/90 rounded-xl bg-zinc-50/70 py-2 text-base leading-none shadow-lg shadow-zinc-950/75 backdrop-blur-sm transition-shadow focus:text-pueb group-hover:divide-pueb group-hover:bg-zinc-950/90 group-hover:shadow-md dark:divide-pueb dark:bg-zinc-950/90 dark:group-hover:divide-zinc-50"
        aria-label="Order Now"
      >
        <span className="pr-2">
          <TruckIcon className="h-6 w-8 pl-2 text-pueb transition-colors group-hover:text-orange-50 dark:text-orange-50 dark:group-hover:text-pueb" />
        </span>
        <span className="px-2 font-semibold text-pueb text-sm transition-colors group-hover:text-zinc-50 md:inline-flex dark:text-zinc-50 dark:group-hover:text-pueb">
          Order Now
        </span>
      </button>
    </Link>
  );
};

export default OrderNowButton;
