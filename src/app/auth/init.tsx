import { authService } from "@/service/authService";
import MainDashboard from "../Dashboard/Page";
import LoginPage from "../signin";
import SignupPage from "../signup";
import { allowedRoles, allUsersAtom, authenticated, isLogin, setUserAtom, userRoleAtom } from "@/store/atoms";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useState } from "react";


export default function Init() {
  const isLoggedIn = useAtomValue(isLogin);
  const [ , setIsLogin] = useAtom(isLogin);
  const setuser = useSetAtom(setUserAtom);
  const [, setAllusers ] = useAtom(allUsersAtom);
  const [ , setUserRoles ] = useAtom(allowedRoles);
  const [isLoading, setIsLoading] = useState(true);
  const [, setUserRole] = useAtom(userRoleAtom);
  const [isAuthenticated, setIsAuthenticated] = useAtom(authenticated);



  
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user: any = await authService.getCurrentUser();
        if(user.roles.includes('admin') || user.roles.includes('distributor') ){
          const allUsers:any = await authService.getAllUsers();
          setAllusers(allUsers.map((u:any) => ({id: u.id, name: u.email || u?.name})));
        }
        setUserRoles(user.roles);
        setUserRole(user.roles[0]);
        setuser(user);
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        setIsLogin(true);
        setIsLoading(false)
        setIsAuthenticated(false);
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  return !isLoading ? (
    <div className="flex-1">
      
   {/* <MainDashboard /> */}
   {!isAuthenticated ? isLoggedIn ?(<LoginPage />):(<SignupPage />): (<MainDashboard />)}
    </div>
  ):(<span>Loading ...</span>);
}
