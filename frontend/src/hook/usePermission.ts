import { useAuth } from "../contexts/AuthContext";




export default function usePermission() {
    const { user } = useAuth();
    const permissionSet = new Set((user?.permissions || []).map((p) => p.toLowerCase()));
    const canAccess = (permission: string) => {
        if (!permission) return false;
        return permissionSet.has(permission.toLowerCase());
    };

    const isCadmin = ()=>{
        return user?.is_cadmin === "1"
    }
    return { canAccess,isCadmin };
}