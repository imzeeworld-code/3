import type { Toast } from '@/hooks/useToast';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`toast ${t.type}`}
          onClick={() => onRemove(t.id)}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
