import { LoadingSpinner } from '@/components/ui/loading';

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
