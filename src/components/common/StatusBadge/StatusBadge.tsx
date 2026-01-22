// StatusBadge.tsx
interface StatusBadgeProps {
    status: 'active' | 'inactive' | 'pending';
  }
  
  export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    return <span className={`badge badge-${status}`}>{status}</span>;
  };