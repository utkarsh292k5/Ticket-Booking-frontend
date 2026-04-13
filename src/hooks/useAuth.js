// Re-export from AuthContext for backwards compatibility
import { useAuth as useAuthFromContext } from '../context/AuthContext';
export const useAuth = useAuthFromContext;